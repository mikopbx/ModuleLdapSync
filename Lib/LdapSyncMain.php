<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

namespace Modules\ModuleLdapSync\Lib;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Psr7\Message;
use GuzzleHttp\Psr7\Request;
use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Common\Models\Users;
use MikoPBX\Core\System\SentryErrorLogger;
use MikoPBX\Core\System\Util;
use MikoPBX\PBXCoreREST\Lib\Extensions\DataStructure;
use Modules\ModuleLdapSync\Models\ADUsers;
use Modules\ModuleLdapSync\Models\LdapServers;
use Phalcon\Di;
use Phalcon\Di\Injectable;

class LdapSyncMain extends Injectable
{
    public static function syncUsers():void
    {
        $serversList = LdapServers::find('disabled=0')->toArray();
        foreach ($serversList as $server){
            $connector = new LdapSyncConnector($server);
            foreach ($connector->getUsersList() as $userData){
                self::updateUserData($server, $userData);
            }
        }
    }

    public static function updateUserData(array $serverData, array $userFromLdap):void
    {
        $userGuid = $userFromLdap[$serverData['userIdAttribute']]??'unknown';
        $userDataHash = md5(implode('',$userFromLdap));
        $parameters = [
            'conditions'=>'server_id=:server_id and guid=:guid',
            'bind'=>[
                'guid' => $userGuid,
                'server_id'=>$serverData['id'],
            ]
        ];

        $previousSyncUser = ADUsers::findFirst($parameters);
        if ($previousSyncUser and $previousSyncUser->paramsHash===$userDataHash){
            return; // No changes
        }

        if ($previousSyncUser===null){
            $previousSyncUser = new ADUsers();
            $previousSyncUser->paramsHash = $userDataHash;
            $previousSyncUser->server_id = $serverData['id'];
        }
        $onlyDigitsMobile = preg_replace('/[^0-9]/', '', $userFromLdap[$serverData['userMobileAttribute']]);
        $params = [
            'email'=>$userFromLdap[$serverData['userEmailAttribute']],
            'mobile'=>$onlyDigitsMobile,
            'number'=>$userFromLdap[$serverData['userExtensionAttribute']],
            'username'=>$userFromLdap[$serverData['userNameAttribute']]
        ];

        $userId = self::createUpdateUser($params);
        if ($userId!=='error'){
            $previousSyncUser->user_id = $userId;
            $previousSyncUser->save();
        }

    }

    public static function createUpdateUser(array $userData):string
    {
        $parameters = [
            'models' => [
                'Extensions' => Extensions::class,
            ],
            'conditions' => '',
            'columns' => [
                'extension_id' => 'Extensions.id',
                'username' => 'Users.username',
                'number' => 'Extensions.number',
                'user_id' => 'Extensions.userid',
                'email' => 'Users.email',
            ],
            'joins' => [
                'Users' => [
                    0 => Users::class,
                    1 => 'Users.id = Extensions.userid',
                    2 => 'Users',
                    3 => 'INNER',
                ],
            ],
        ];

        foreach ($userData as $index=>$value){
            if (!empty($value)){
                switch ($index){
                    case 'email':
                        $parameters['conditions']=$parameters['conditions'].' OR Users.email=:email';
                        $parameters['bind'][$index]=$value;
                        break;
                    case 'mobile':
                        $parameters['conditions']=$parameters['conditions'].' OR Extensions.number = :mobile';
                        $parameters['bind'][$index]=$value;
                        break;
                    case 'number':
                        $parameters['conditions']=$parameters['conditions'].' OR Extensions.number = :number';
                        $parameters['bind'][$index]=$value;
                        break;
                    case 'username':
                        $parameters['conditions']=$parameters['conditions'].' OR Users.username=:username';
                        $parameters['bind'][$index]=$value;
                        break;
                }
            }
        }
        $parameters['conditions'] = substr($parameters['conditions'], 3);
        $userOnMikoPBX = null;
        if (!empty( $parameters['bind'])){
            $userOnMikoPBX = Di::getDefault()->get('modelsManager')->createBuilder($parameters)->getQuery()->getSingleResult();
        }
        if ($userOnMikoPBX===null){
            $extensionId = '';
        } else {
            $extensionId = $userOnMikoPBX->extension_id;
        }
        /** @var $dataStructure \MikoPBX\PBXCoreREST\Lib\Extensions\DataStructure */
        $restAnswer = self::restApiRequest('/pbxcore/api/extensions/getRecord','GET', ['id' => $extensionId]);
        if (!array_key_exists('data', $restAnswer)){
            return 'error';
        }
        $dataStructure = new DataStructure($restAnswer['data']);
        $dataStructure->user_username = $userData['username'];
        $dataStructure->user_email = $userData['email'];
        $dataStructure->number = $userData['number'];

        $oldMobileNumber = $dataStructure->mobile_number;
        $dataStructure->mobile_number = $userData['mobile'];
        $dataStructure->mobile_dialstring = $userData['mobile'];

        if ($oldMobileNumber===$dataStructure->fwd_forwardingonunavailable ){
            $dataStructure->fwd_forwardingonunavailable = $userData['mobile'];
        }
        if ($oldMobileNumber===$dataStructure->fwd_forwarding ){
            $dataStructure->fwd_forwarding = $userData['mobile'];
        }
        if ($oldMobileNumber===$dataStructure->fwd_forwardingonbusy ){
            $dataStructure->fwd_forwardingonbusy = $userData['mobile'];
        }

        $restAnswer = self::restApiRequest('/pbxcore/api/extensions/saveRecord','POST', $dataStructure->toArray());
        if (!array_key_exists('data', $restAnswer)){
            return 'error';
        }
        return $restAnswer['data']['id'];
    }

    public static function restApiRequest(string $url, string $method='GET', array $data=[]):array
    {
        $webPort = PbxSettings::getValueByKey('WEBPort');
        $client = new Client([
            'base_uri'        => 'http://localhost:'.$webPort,
            'timeout'         => 0,
            'allow_redirects' => false
        ]);

        $request = new Request($method, $url, ['query'=>$data]);

        try {
            $response = $client->send($request, ['timeout' => 10]);
            $body = $response->getBody();
            $result = json_decode($body,true);
        } catch (ClientException $e) {
            $message = "Rest API request error ".Message::toString($e->getResponse());
            Util::sysLogMsg(__METHOD__, $message , LOG_DEBUG);
            $result = [$message];
        } catch (\Throwable $e){
            SentryErrorLogger::captureExceptionWithSyslog($e, __CLASS__,__METHOD__ );
            $result = [$e->getMessage()];
        }

        return $result;
    }
}