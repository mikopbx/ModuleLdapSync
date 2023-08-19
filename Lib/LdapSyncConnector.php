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

use LdapRecord\Container;
use MikoPBX\Common\Handlers\CriticalErrorsHandler;

include_once __DIR__.'/../vendor/autoload.php';

class LdapSyncConnector extends \Phalcon\Di\Injectable
{
    private string $serverName;
    private string $serverPort;
    private string $baseDN;
    private string $administrativeLogin;
    private string $administrativePassword;
    private array $userAttributes=[];
    private string $organizationalUnit;
    private string $userFilter;
    private string $userModelClass;

    private \LdapRecord\Connection $connection;

    public function __construct(array $ldapCredentials)
    {
        $this->serverName = $ldapCredentials['serverName'];
        $this->serverPort = $ldapCredentials['serverPort'];
        $this->baseDN = $ldapCredentials['baseDN'];
        $this->administrativeLogin = $ldapCredentials['administrativeLogin'];
        $this->administrativePassword = $ldapCredentials['administrativePassword'];
        $this->organizationalUnit = $ldapCredentials['organizationalUnit'];
        $this->userFilter = $ldapCredentials['userFilter'];

        $this->userAttributes = json_decode($ldapCredentials['attributes']);
        foreach ($this->userAttributes as $index=>$value){
            if (empty($value)){
                unset($this->userAttributes[$index]);
            }
        }

        switch ($ldapCredentials['ldapType']){
            case 'ActiveDirectory':
                $this->userModelClass = \LdapRecord\Models\ActiveDirectory\User::class;
                break;
            case 'OpenLDAP':
                $this->userModelClass = \LdapRecord\Models\OpenLDAP\User::class;
                break;
            case 'DirectoryServer':
                $this->userModelClass = \LdapRecord\Models\DirectoryServer\User::class;
                break;
            case 'FreeIPA':
                $this->userModelClass = \LdapRecord\Models\FreeIPA\User::class;
                break;
            default:
                $this->userModelClass = \LdapRecord\Models\ActiveDirectory\User::class;
        }

        // Create a new LDAP connection
        $this->connection = new \LdapRecord\Connection([
            'hosts' => [$this->serverName],
            'port' => $this->serverPort,
            'base_dn' => $this->baseDN,
            'username' => $this->administrativeLogin,
            'password' => $this->administrativePassword,
            'timeout'  => 15,
        ]);
    }

    /**
     * Get available users list via LDAP.
     * @return AnswerStructure list of users on data attribute
     */
    public function getUsersList(): AnswerStructure
    {
        $res = new AnswerStructure();

        $listOfAvailableUsers = [];
        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            // Query LDAP for the user
            $query = $this->connection->query();
            if ($this->userFilter!==''){
                $query->rawFilter($this->userFilter);
            }
            if ($this->organizationalUnit!==''){
                $query->in($this->organizationalUnit);
            }
            $commonAttributes = [Constants::USER_GUID_ATTR, Constants::USER_LAST_CHANGE_ATTR];
            $requestAttributes = array_merge($commonAttributes, array_values($this->userAttributes));
            $users =$query->select($requestAttributes)->get();
            foreach ($users as $user) {
                $record = [];

                foreach ($requestAttributes as $attribute){
                    if (array_key_exists($attribute, $user)
                        && isset($user[$attribute][0])){
                        $record[$attribute]=$user[$attribute][0];
                    }
                    $attribute = strtolower($attribute);
                    if (array_key_exists($attribute, $user)
                        && isset($user[$attribute][0])){
                        $record[$attribute]=$user[$attribute][0];
                    }
                }
                if (!empty($record)){
                    $listOfAvailableUsers[] = $record;
                }
            }
            // Sort the array based on the name value
            usort($listOfAvailableUsers, function($a, $b){
                return $a[$this->userAttributes[Constants::USER_NAME_ATTR]] > $b[$this->userAttributes[Constants::USER_NAME_ATTR]];
            });

            $res->data = $listOfAvailableUsers;
            $res->success = true;
        } catch (\LdapRecord\Auth\BindException $e) {
            $error = $e->getDetailedError();
            $res->messages['error'][] = $error->getErrorMessage().' ('.$error->getErrorCode().')';
            $res->success = false;
        } catch (\Throwable $e) {
            CriticalErrorsHandler::handleExceptionWithSyslog($e, __CLASS__,__METHOD__);
            $res->messages['error'][] = $e->getMessage();
            $res->success = false;
        }

        return $res;
    }

    public function updateDomainUser(string $userGuid, array $newUserData):AnswerStructure
    {
        $res = new AnswerStructure();

        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            $updatableAttributes = [
                Constants::USER_EXTENSION_ATTR,
                Constants::USER_MOBILE_ATTR
            ];

            // Query LDAP for the user
            $user = call_user_func([$this->userModelClass, 'findByGuidOrFail'],[$userGuid]);
            foreach ($newUserData as $attribute=>$value){
                if (!empty($value) and in_array($attribute, $updatableAttributes)){
                    $user->$attribute=$value;
                }
            }
            $user->save();
            $res->success = true;
            $res->data[Constants::USER_GUID_ATTR]=$user->getObjectGUID();
        } catch (\LdapRecord\Models\ModelNotFoundException $e) {
            $error = $e->getDetailedError();
            $res->messages['error'][] = $error->getErrorMessage().' ('.$error->getErrorCode().')';
            $res->success = false;
        } catch (\Throwable $e) {
            CriticalErrorsHandler::handleExceptionWithSyslog($e, __CLASS__,__METHOD__);
            $res->messages['error'][] = $e->getMessage();
            $res->success = false;
        }

        return $res;
    }

}