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

use LdapRecord\Auth\Events\Failed;
use LdapRecord\Container;
use MikoPBX\Core\System\SentryErrorLogger;

include_once __DIR__.'/../vendor/autoload.php';

class LdapSyncConnector extends \Phalcon\Di\Injectable
{
    private string $serverName;
    private string $serverPort;
    private string $baseDN;
    private string $administrativeLogin;
    private string $administrativePassword;
    private string $userIdAttribute;
    private string $userNameAttribute;
    private string $userExtensionAttribute;
    private string $userMobileAttribute;
    private string $userEmailAttribute;
    private string $organizationalUnit;
    private string $userFilter;

    public function __construct(array $ldapCredentials)
    {
        $this->serverName = $ldapCredentials['serverName'];
        $this->serverPort = $ldapCredentials['serverPort'];
        $this->baseDN = $ldapCredentials['baseDN'];
        $this->administrativeLogin = $ldapCredentials['administrativeLogin'];
        $this->administrativePassword = $ldapCredentials['administrativePassword'];
        $this->userIdAttribute = $ldapCredentials['userIdAttribute'];
        $this->userNameAttribute = $ldapCredentials['userNameAttribute'];
        $this->userExtensionAttribute = $ldapCredentials['userExtensionAttribute'];
        $this->userMobileAttribute = $ldapCredentials['userMobileAttribute'];
        $this->userEmailAttribute = $ldapCredentials['userEmailAttribute'];
        $this->organizationalUnit = $ldapCredentials['organizationalUnit'];
        $this->userFilter = $ldapCredentials['userFilter'];
    }

    /**
     * Get available users list via LDAP.
     *
     * @param string $message The error message.
     * @return array list of users.
     */
    public function getUsersList(string &$message=''): array
    {
        // Create a new LDAP connection
        $connection = new \LdapRecord\Connection([
            'hosts' => [$this->serverName],
            'port' => $this->serverPort,
            'base_dn' => $this->baseDN,
            'username' => $this->administrativeLogin,
            'password' => $this->administrativePassword,
        ]);

        $listOfAvailableUsers = [];
        $message = $this->translation->_('module_ldap_user_not_found');
        try {
            $connection->connect();

            $dispatcher = Container::getEventDispatcher();
            // Listen for failed events
            $dispatcher->listen(Failed::class, function (Failed $event) use (&$message) {
                $ldap = $event->getConnection();
                $message = $ldap->getDiagnosticMessage();
            });

            // Query LDAP for the user
            $query = $connection->query();
            if ($this->userFilter!==''){
                $query->rawFilter($this->userFilter);
            }
            if ($this->organizationalUnit!==''){
                $query->in($this->organizationalUnit);
            }
            $users = $query->get();
            foreach ($users as $user) {
                $record = [];
                if (array_key_exists($this->userIdAttribute, $user)
                    && isset($user[$this->userIdAttribute][0])){
                    $record[$this->userIdAttribute]=$user[$this->userIdAttribute][0];
                }
                if (array_key_exists($this->userNameAttribute, $user)
                    && isset($user[$this->userNameAttribute][0])){
                    $record[$this->userNameAttribute]=$user[$this->userNameAttribute][0];
                }
                if (array_key_exists($this->userExtensionAttribute, $user)
                    && isset($user[$this->userExtensionAttribute][0])){
                    $record[$this->userExtensionAttribute]=$user[$this->userExtensionAttribute][0];
                }
                if (array_key_exists($this->userMobileAttribute, $user)
                    && isset($user[$this->userMobileAttribute][0])){
                    $record[$this->userMobileAttribute]=$user[$this->userMobileAttribute][0];
                }
                if (array_key_exists($this->userEmailAttribute, $user)
                    && isset($user[$this->userEmailAttribute][0])){
                    $record[$this->userEmailAttribute]=$user[$this->userEmailAttribute][0];
                }
                if (!empty($record)){
                    $listOfAvailableUsers[] = $record;
                }
            }
            // Sort the array based on the name value
            usort($listOfAvailableUsers, function($a, $b){
                return $a[$this->userNameAttribute] > $b[$this->userNameAttribute];
            });

        } catch (\Throwable $e) {
            SentryErrorLogger::captureExceptionWithSyslog($e, __CLASS__,__METHOD__);
            $message = $e->getMessage();
        }

        return $listOfAvailableUsers;
    }

}