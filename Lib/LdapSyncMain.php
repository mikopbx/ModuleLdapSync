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
use MikoPBX\Common\Handlers\CriticalErrorsHandler;
use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\PbxSettings;
use MikoPBX\Common\Models\Users;
use MikoPBX\Core\System\Util;
use MikoPBX\PBXCoreREST\Lib\Extensions\DataStructure;
use Modules\ModuleLdapSync\Models\ADUsers;
use Modules\ModuleLdapSync\Models\LdapServers;
use Phalcon\Di;
use Phalcon\Di\Injectable;

/**
 * Class for synchronizing user data from LDAP servers.
 */
class LdapSyncMain extends Injectable
{
    /**
     * Synchronizes all LDAP users across enabled servers.
     *
     * @return void
     */
    public static function syncAllUsers(): void
    {
        $serversList = LdapServers::find('disabled=0')->toArray();
        foreach ($serversList as $server) {
            self::syncUsersPerServer($server);
        }
    }

    /**
     * Synchronizes LDAP users based on the provided server parameters.
     *
     * @param array $serverParams - Parameters for the LDAP server.
     * @return AnswerStructure - The structure containing synchronization status.
     */
    public static function syncUsersPerServer(array $serverParams): AnswerStructure
    {
        $res = new AnswerStructure();
        $res->success = true;

        // Create an LDAP connector for the server
        $connector = new LdapSyncConnector($serverParams);

        // Get the list of users from LDAP
        $responseFromLdap = $connector->getUsersList();
        if ($responseFromLdap->success = true) {
            foreach ($responseFromLdap->data as $userFromLdap) {

                // Update user data based on LDAP information
                $result = self::updateUserData($serverParams, $userFromLdap);

                if (!$result->success) {
                    // Update synchronization status and messages
                    $res->success = false;
                    $res->messages = array_merge($res->messages, $result->messages);
                }

            }
        }
        return $res;
    }

    /**
     * Updates user data using LDAP information.
     *
     * @param array $serverData - Configuration data for the LDAP server.
     * @param array $userFromLdap - User data retrieved from LDAP.
     * @return void
     */
    public static function updateUserData(array $serverData, array $userFromLdap): AnswerStructure
    {
        $userGuid = $userFromLdap[Constants::USER_GUID_ATTR];
        $userDataHash = md5(implode('', $userFromLdap));
        $parameters = [
            'conditions' => 'server_id=:server_id and guid=:guid',
            'bind' => [
                'guid' => $userGuid,
                'server_id' => $serverData['id'],
            ]
        ];

        $previousSyncUser = ADUsers::findFirst($parameters);
        if ($previousSyncUser and $previousSyncUser->paramsHash === $userDataHash) {
            $res = new AnswerStructure();
            $res->success = true;
            return $res; // No changes
        }

        if ($previousSyncUser === null) {
            $previousSyncUser = new ADUsers();
            $previousSyncUser->paramsHash = $userDataHash;
            $previousSyncUser->server_id = $serverData['id'];
            $previousSyncUser->guid = $userGuid;
        }

        $onlyDigitsMobile = preg_replace('/[^0-9]/', '', $userFromLdap[$serverData[Constants::USER_MOBILE_ATTR]]);
        $params = [
            'email' => $userFromLdap[$serverData[Constants::USER_EMAIL_ATTR]],
            'mobile' => $onlyDigitsMobile,
            'number' => $userFromLdap[$serverData[Constants::USER_EXTENSION_ATTR]],
            'username' => $userFromLdap[$serverData[Constants::USER_NAME_ATTR]]
        ];

        if ($previousSyncUser->lastChangeDate === $userFromLdap[Constants::USER_LAST_CHANGE_ATTR]) {
            // Changes on MikoPBX side
            $response = self::updateADUser($previousSyncUser);
        } else {
            // Changes on Domain side
            $response = self::createUpdateUser($params);
            $previousSyncUser->lastChangeDate = $userFromLdap[Constants::USER_LAST_CHANGE_ATTR];
        }

        if ($response->sussess) {
            $previousSyncUser->user_id = $response->data['user_id'];
            $previousSyncUser->save();
        }

        return $response;
    }

    /**
     * Updates an AD user's data based on the previous synchronization.
     *
     * @param ADUsers $previousSyncUser - The previously synchronized user data.
     * @return AnswerStructure - The structure containing update status and user ID.
     */
    private static function updateADUser(ADUsers $previousSyncUser): AnswerStructure
    {
        $res = new AnswerStructure();

        // Retrieve LDAP server configuration
        $ldapServer = LdapServers::findFirstById($previousSyncUser->server_id)->toArray();
        if ($ldapServer === null or $ldapServer['updateAttributes'] === '0') {
            // No need to update attributes, return success
            $res->success = true;
            $res->data['user_id'] = $previousSyncUser->user_id;
            return $res;
        }

        // Create an LDAP connector
        $connector = new LdapSyncConnector($ldapServer);

        // Define parameters for database query
        $parameters = [
            'models' => [
                'Users' => Users::class,
            ],
            'conditions' => 'Users.id = :user_id',
            'binds' => [
                'user_id' => $previousSyncUser->user_id
            ],
            'columns' => [
                Constants::USER_NAME_ATTR => 'Users.username',
                Constants::USER_EXTENSION_ATTR => 'Extensions.number',
                Constants::USER_MOBILE_ATTR => 'ExtensionsExternal.number',
                Constants::USER_EMAIL_ATTR => 'Users.email',
            ],
            'joins' => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Users.id = Extensions.userid AND Extensions.type=' . Extensions::TYPE_SIP,
                    2 => 'Users',
                    3 => 'INNER',
                ],
                'ExtensionsExternal' => [
                    0 => Extensions::class,
                    1 => 'ExtensionsExternal.userid = Users.id AND Extensions.type=' . Extensions::TYPE_EXTERNAL,
                    2 => 'ExtensionsExternal',
                    3 => 'LEFT',
                ],
            ],
        ];
        $userOnMikoPBX = Di::getDefault()->get('modelsManager')->createBuilder($parameters)
            ->getQuery()
            ->getSingleResult();

        // Update AD user's data using the LDAP connector
        $res = $connector->updateDomainUser($previousSyncUser->guid, $userOnMikoPBX);
        $res->data['user_id'] = $previousSyncUser->user_id;
        return $res;
    }

    /**
     * Creates or updates a user using provided data.
     *
     * @param array $userData - User data to be created or updated.
     * @return AnswerStructure
     */
    public static function createUpdateUser(array $userData): AnswerStructure
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

        foreach ($userData as $index => $value) {
            if (!empty($value)) {
                switch ($index) {
                    case 'email':
                        $parameters['conditions'] = $parameters['conditions'] . ' OR Users.email=:email';
                        $parameters['bind'][$index] = $value;
                        break;
                    case 'mobile':
                        $parameters['conditions'] = $parameters['conditions'] . ' OR Extensions.number = :mobile';
                        $parameters['bind'][$index] = $value;
                        break;
                    case 'number':
                        $parameters['conditions'] = $parameters['conditions'] . ' OR Extensions.number = :number';
                        $parameters['bind'][$index] = $value;
                        break;
                    case 'username':
                        $parameters['conditions'] = $parameters['conditions'] . ' OR Users.username=:username';
                        $parameters['bind'][$index] = $value;
                        break;
                }
            }
        }
        $parameters['conditions'] = substr($parameters['conditions'], 3);
        $userOnMikoPBX = null;
        if (!empty($parameters['bind'])) {
            $userOnMikoPBX = Di::getDefault()->get('modelsManager')->createBuilder($parameters)
                ->getQuery()
                ->getSingleResult();
        }
        if ($userOnMikoPBX === null) {
            $extensionId = '';
        } else {
            $extensionId = $userOnMikoPBX->extension_id;
        }

        // Get user data from the API
        $restAnswer = self::restApiRequest('/pbxcore/api/extensions/getRecord', 'GET', ['id' => $extensionId]);
        if (!$restAnswer->success) {
            return $restAnswer;
        }

        // Create a new data structure for user data
        /** @var $dataStructure \MikoPBX\PBXCoreREST\Lib\Extensions\DataStructure */
        $dataStructure = new DataStructure($restAnswer['data']);
        $dataStructure->user_username = $userData['username'];
        $dataStructure->user_email = $userData['email'];
        $dataStructure->number = $userData['number'];

        // Update mobile number and forwarding settings
        $oldMobileNumber = $dataStructure->mobile_number;
        $dataStructure->mobile_number = $userData['mobile'];
        $dataStructure->mobile_dialstring = $userData['mobile'];

        if ($oldMobileNumber === $dataStructure->fwd_forwardingonunavailable) {
            $dataStructure->fwd_forwardingonunavailable = $userData['mobile'];
        }
        if ($oldMobileNumber === $dataStructure->fwd_forwarding) {
            $dataStructure->fwd_forwarding = $userData['mobile'];
        }
        if ($oldMobileNumber === $dataStructure->fwd_forwardingonbusy) {
            $dataStructure->fwd_forwardingonbusy = $userData['mobile'];
        }

        // Save user data through the API
        return self::restApiRequest('/pbxcore/api/extensions/saveRecord', 'POST', $dataStructure->toArray());
    }

    /**
     * Makes a REST API request.
     *
     * @param string $url - The API endpoint URL.
     * @param string $method - The HTTP method (default: 'GET').
     * @param array $data - Optional data to include in the request.
     * @return AnswerStructure - The response from the API as AnswerStructure class.
     */
    public static function restApiRequest(string $url, string $method = 'GET', array $data = []): AnswerStructure
    {
        $res = new AnswerStructure();

        // Get the web port from PbxSettings
        $webPort = PbxSettings::getValueByKey('WEBPort');

        // Create a new HTTP client instance
        $client = new Client([
            'base_uri' => 'http://localhost:' . $webPort,
            'timeout' => 0,
            'allow_redirects' => false
        ]);

        // Create a new request with the specified method and data
        $request = new Request($method, $url, ['query' => $data]);

        try {
            // Send the request and get the response
            $response = $client->send($request, ['timeout' => 10]);
            $body = $response->getBody();
            $result = json_decode($body, true);

            $res->data = $result['data'];
            $res->messages = $result['messages'];
            $res->success = $result['success'];
        } catch (ClientException $e) {
            // Handle client exception
            $message = "Rest API request error " . Message::toString($e->getResponse());
            Util::sysLogMsg(__METHOD__, $message, LOG_DEBUG);
            $res->messages['error'][] = $message;
        } catch (\Throwable $e) {
            // Handle other exceptions and log using SentryErrorHandler
            CriticalErrorsHandler::handleExceptionWithSyslog($e, __CLASS__, __METHOD__);
            $res->messages['error'][] = $e->getMessage();
        }

        return $res;
    }

    /**
     * Retrieves available LDAP users based on provided data.
     *
     * @param array $postData - Data containing LDAP configuration.
     * @return AnswerStructure - The structure containing available LDAP users.
     */
    public static function getAvailableLdapUsers(array $postData): AnswerStructure
    {
        // Admin password can be stored in DB on the time, on this way it has only xxxxxx value.
        // It can be empty as well, if some password manager tried to fill it.
        if (empty($postData['administrativePasswordHidden'])
            || $postData['administrativePasswordHidden'] === Constants::HIDDEN_PASSWORD) {
            $ldapConfig = LdapServers::findFirstById($postData['id']) ?? new LdapServers();
            $postData['administrativePassword'] = $ldapConfig->administrativePassword ?? '';
        } else {
            $postData['administrativePassword'] = $postData['administrativePasswordHidden'];
        }

        // Define attributes for LDAP search
        $attributes = [
            Constants::USER_EMAIL_ATTR => $postData[Constants::USER_EMAIL_ATTR],
            Constants::USER_NAME_ATTR => $postData[Constants::USER_NAME_ATTR],
            Constants::USER_MOBILE_ATTR => $postData[Constants::USER_MOBILE_ATTR],
            Constants::USER_EXTENSION_ATTR => $postData[Constants::USER_EXTENSION_ATTR],
        ];

        // Construct LDAP credentials
        $ldapCredentials = [
            'ldapType' => $postData['ldapType'],
            'serverName' => $postData['serverName'],
            'serverPort' => $postData['serverPort'],
            'baseDN' => $postData['baseDN'],
            'administrativeLogin' => $postData['administrativeLogin'],
            'administrativePassword' => $postData['administrativePassword'],
            'attributes' => json_encode($attributes),
            'organizationalUnit' => $postData['organizationalUnit'],
            'userFilter' => $postData['userFilter'],
        ];

        // Create an LDAP connector
        $ldapConnector = new LdapSyncConnector($ldapCredentials);

        // Retrieve the list of available LDAP users
        return $ldapConnector->getUsersList();
    }
}