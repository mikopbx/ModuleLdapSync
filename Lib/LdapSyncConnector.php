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
use LdapRecord\Models\Attributes\AccountControl;
use MikoPBX\Common\Handlers\CriticalErrorsHandler;

include_once __DIR__.'/../vendor/autoload.php';

/**
 * Class LdapSyncConnector
 * Handles synchronization and interaction with LDAP server.
 */
class LdapSyncConnector extends \Phalcon\Di\Injectable
{
    /**
     * The name or ip of the LDAP server.
     *
     * @var string
     */
    private string $serverName;


    /**
     * The port of the LDAP server.
     *
     * @var string
     */
    private string $serverPort;

    /**
     * The base DN (Distinguished Name) for LDAP operations.
     *
     * @var string
     */
    private string $baseDN;

    /**
     * The administrative login for LDAP connection.
     *
     * @var string
     */
    private string $administrativeLogin;

    /**
     * The administrative password for LDAP connection.
     *
     * @var string
     */
    private string $administrativePassword;


    /**
     * The organizational unit for LDAP operations.
     *
     * @var string
     */
    private string $organizationalUnit;

    /**
     * The user filter for LDAP operations.
     *
     * @var string
     */
    private string $userFilter;

    /**
     * The user attributes to synchronize.
     *
     * @var array
     */
    private array $userAttributes=[];

    /**
     * The class of the user model based on LDAP type.
     *
     * @var string
     */
    private string $userModelClass;

    private \LdapRecord\Connection $connection;

    /**
     * LdapConnectionManager constructor.
     *
     * @param array $ldapCredentials The LDAP credentials.
     */
    public function __construct(array $ldapCredentials)
    {
        // Initialize properties from provided LDAP credentials
        $this->serverName = $ldapCredentials['serverName'];
        $this->serverPort = $ldapCredentials['serverPort'];
        $this->baseDN = $ldapCredentials['baseDN'];
        $this->administrativeLogin = $ldapCredentials['administrativeLogin'];
        $this->administrativePassword = $ldapCredentials['administrativePassword'];
        $this->organizationalUnit = $ldapCredentials['organizationalUnit'];
        $this->userFilter = $ldapCredentials['userFilter'];

        // Parse and filter user attributes
        $this->userAttributes = array_filter(json_decode($ldapCredentials['attributes'], true));

        // Set user model class based on LDAP type
        $this->userModelClass = $this->getUserModelClass($ldapCredentials['ldapType']);

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
     * Get the class of the user model based on LDAP type.
     *
     * @param string $ldapType The LDAP type.
     * @return string The user model class.
     */
    private function getUserModelClass(string $ldapType): string
    {
        switch ($ldapType) {
            case 'OpenLDAP':
                return \LdapRecord\Models\OpenLDAP\User::class;
            case 'DirectoryServer':
                return \LdapRecord\Models\DirectoryServer\User::class;
            case 'FreeIPA':
                return \LdapRecord\Models\FreeIPA\User::class;
            default:
                return \LdapRecord\Models\ActiveDirectory\User::class;
        }
    }

    /**
     * Get available users list via LDAP.
     *
     * @return AnswerStructure List of users in the data attribute.
     */
    public function getUsersList(): AnswerStructure
    {
        $res = new AnswerStructure();

        $listOfAvailableUsers = [];
        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            // Query LDAP for the user
            $query = call_user_func([$this->userModelClass, 'query']);

            if ($this->userFilter!==''){
                $query->rawFilter($this->userFilter);
            }
            if ($this->organizationalUnit!==''){
                $query->in($this->organizationalUnit);
            }
            $commonAttributes = [Constants::USER_ACCOUNT_CONTROL_ATTR];
            $requestAttributes = array_merge($commonAttributes, array_values($this->userAttributes));
            $users =$query->select($requestAttributes)->get();
            foreach ($users as $user) {
                $record = [];
                foreach ($requestAttributes as $attribute){
                    if ($user->hasAttribute($attribute)){
                        $record[$attribute]= $user->getFirstAttribute($attribute);
                    }
                }
                $record[Constants::USER_GUID_ATTR] = $user->getConvertedGuid();
                $record[Constants::USER_DISABLED] = $user->isDisabled();
                uksort($record, function($a, $b){
                    return $a>$this->userAttributes[Constants::USER_NAME_ATTR];
                });
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

    /**
     * Update user data in the LDAP domain.
     *
     * @param string $userGuid The GUID of the user to update.
     * @param array $newUserData The new user data to update.
     * @return AnswerStructure The response structure indicating success or failure.
     */
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
            if ($user===null){
                $res->messages['error'][] ='User with guid: '.$userGuid.' did not found on server '.$this->serverName;
                $res->success = false;
            }
            foreach ($newUserData as $attribute=>$value){
                if (!empty($value) and in_array($attribute, $updatableAttributes)){
                    $user->{$this->userAttributes[$attribute]}=$value;
                }
            }
            $user->save();
            $res->success = true;
            $res->data[Constants::USER_GUID_ATTR]=$user->getObjectGUID();
            $res->messages['info'][]= 'User '.$newUserData[Constants::USER_NAME_ATTR].' was updated on server '.$this->serverName;
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