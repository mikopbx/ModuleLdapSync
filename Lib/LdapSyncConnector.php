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
use MikoPBX\Common\Providers\ManagedCacheProvider;


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
     * Use TLS for LDAP connection.
     *
     * @var bool
     */
    private bool $useTLS;

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
    public array $userAttributes=[];

    /**
     * The class of the user model based on LDAP type.
     *
     * @var string
     */
    private string $userModelClass;

    // Ldap connection
    private \LdapRecord\Connection $connection;

    // Cache provider
    private $redis;

    private string $redisKeyPrefix;

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
        $this->useTLS = $ldapCredentials['useTLS']==='1';
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
            'use_tls'  => $this->useTLS,
        ]);

        $this->redis = $this->getDI()->getShared(ManagedCacheProvider::SERVICE_NAME);
        $this->redisKeyPrefix = 'modules:ldap-sync:'.md5($this->serverName.$ldapCredentials['attributes']);
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
            $requestAttributes = array_values($this->userAttributes);

            $page = (int) $this->redis->getAdapter()->incr($this->redisKeyPrefix . '-users-list:page');
            $itemsPerPage = 20;

            if (is_a($this->userModelClass,\LdapRecord\Models\ActiveDirectory\User::class)){
                $items = $query->select($requestAttributes)->slice($page, $itemsPerPage)->items();
            } else {
                $items = $query->select($requestAttributes)->get();
            }


            // If the server returned more records than requested, apply client-side pagination
            if ($items->count() > $itemsPerPage) {
                // Convert the result to an array for easier manipulation
                $allUsers = $items->toArray();

                // Calculate the offset and take the required number of records
                $offset = ($page - 1) * $itemsPerPage;
                $paginatedUsers = array_slice($allUsers, $offset, $itemsPerPage);
            } else {
                // Use the result returned by the server if it fits within the limit
                $paginatedUsers = $items->toArray();
            }

            // Check if we've reached the last page
            if (count($paginatedUsers) < $itemsPerPage) {
                // Delete the Redis key if we're at the last page
                $this->redis->getAdapter()->del($this->redisKeyPrefix . '-users-list:page');
            }

            foreach ($paginatedUsers as $user) {
                $record = [];
                foreach ($requestAttributes as $attribute){
                    if ($user->hasAttribute($attribute)){
                        if ($attribute===$this->userAttributes[Constants::USER_AVATAR_ATTR]) {
                            $binData = $user->getFirstAttribute($attribute);
                            $record[$attribute] = 'data:image/jpeg;base64,'.base64_encode($binData);
                        } elseIf (
                                !is_a($user, \LdapRecord\Models\ActiveDirectory\User::class)
                                &&
                                $attribute===$this->userAttributes[Constants::USER_ACCOUNT_CONTROL_ATTR]
                                ) {
                            $record[Constants::USER_DISABLED] = true;
                        } else {
                            $record[$attribute]= $user->getFirstAttribute($attribute);
                        }
                    }
                }
                $record[Constants::USER_GUID_ATTR] = $user->getConvertedGuid();
                if (is_a($user, \LdapRecord\Models\ActiveDirectory\User::class)){
                    $record[Constants::USER_DISABLED] = $user->isDisabled();
                }

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
            $res->messages['error'][] = $e->getMessage().' ('.$e->getCode().')';
            $res->success = false;
        } catch (\Throwable $e) {
            CriticalErrorsHandler::handleExceptionWithSyslog($e);
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
        $res->data[Constants::USER_SYNC_RESULT]=Constants::SYNC_RESULT_SKIPPED;

        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            $updatableAttributes = [
                Constants::USER_EXTENSION_ATTR,
                Constants::USER_MOBILE_ATTR,
                Constants::USER_EMAIL_ATTR,
                Constants::USER_AVATAR_ATTR,
                Constants::USER_PASSWORD_ATTR,
            ];

            // Query LDAP for the user
            $user = call_user_func([$this->userModelClass, 'findByGuid'], $userGuid);
            if ($user===null){
                $res->messages['error'][] ='User '.$newUserData[Constants::USER_NAME_ATTR].' with guid: '.$userGuid.' did not found on server '.$this->serverName;
                $res->success = false;
                return $res;
            }
            foreach ($newUserData as $attribute=>$value){
                if (!empty($value) and in_array($attribute, $updatableAttributes)){
                    if ($attribute===Constants::USER_AVATAR_ATTR){
                        $base64Image = $value;
                        $base64Data = substr($base64Image, strpos($base64Image, ',') + 1);
                        $binaryData = base64_decode($base64Data);
                        $user->{$this->userAttributes[$attribute]} = $binaryData;
                    } else {
                        $user->{$this->userAttributes[$attribute]}=$value;
                    }

                }
            }
            $user->save();
            $res->success = true;
            $res->messages['info'][]= 'User '.$newUserData[Constants::USER_NAME_ATTR].' was updated on server '.$this->serverName;
            $res->data[Constants::USER_SYNC_RESULT]=Constants::SYNC_RESULT_UPDATED;
        } catch (\LdapRecord\Exceptions\InsufficientAccessException $e) {
            $res->messages['info'][]= 'User '.$newUserData[Constants::USER_NAME_ATTR].' was not updated on server '.$this->serverName.' because of insufficient access rights';
            $res->success = true;
        } catch (\Throwable $e) {
            $res->messages['error'][] = CriticalErrorsHandler::handleExceptionWithSyslog($e);
            $res->success = false;
        }

        return $res;
    }

}