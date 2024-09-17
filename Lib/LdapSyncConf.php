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

use MikoPBX\Common\Providers\ManagedCacheProvider;
use MikoPBX\Core\Workers\Cron\WorkerSafeScriptsCore;
use MikoPBX\Modules\Config\ConfigClass;
use MikoPBX\PBXCoreREST\Lib\PBXApiResult;
use Modules\ModuleLdapSync\Lib\Workers\WorkerLdapSync;
use Modules\ModuleLdapSync\Models\LdapServers;

class LdapSyncConf extends ConfigClass
{

    /**
     * Receive information about mikopbx main database changes
     *
     * @param $data
     */
    public function modelsEventChangeData($data): void
    {
        // Somebody changes LdapServers, we will restart all workers
        if (
            $data['model'] === LdapServers::class
        ) {
            $managedCache = $this->di->get(ManagedCacheProvider::SERVICE_NAME);
            $managedCache->delete(WorkerLdapSync::CACHE_KEY);
        }
    }

    /**
     * Returns module workers to start it at WorkerSafeScriptCore
     *
     * @return array
     */
    public function getModuleWorkers(): array
    {
        return [
            [
                'type' => WorkerSafeScriptsCore::CHECK_BY_PID_NOT_ALERT,
                'worker' => WorkerLdapSync::class,
            ],
        ];
    }

    /**
     * Process PBXCoreREST requests under root rights
     * @see https://docs.mikopbx.com/mikopbx-development/module-developement/module-class#modulerestapicallback
     *
     * @param array $request GET/POST parameters
     *
     * @return PBXApiResult An object containing the result of the API call.
     */
    public function moduleRestAPICallback(array $request): PBXApiResult
    {
        $res = new PBXApiResult();
        $res->processor = __METHOD__;
        $action = strtoupper($request['action']);
        $data = $request['data'];
        switch ($action) {
            case 'GET-AVAILABLE-LDAP-USERS':
                $ldapCredentials = LdapSyncMain::postDataToLdapCredentials($data);
                $result = LdapSyncMain::getAvailableLdapUsers($ldapCredentials);
                $res->success = $result->success;
                $res->messages = $result->messages;
                $res->data = $result->data;
                break;
            case 'SYNC-LDAP-USERS':
                $ldapCredentials = LdapSyncMain::postDataToLdapCredentials($data);
                $result = LdapSyncMain::syncUsersPerServer($ldapCredentials);
                $res->success = $result->success;
                $res->messages = $result->messages;
                $res->data = $result->data;
                break;
            case 'GET-SERVER-CONFLICTS':
                if (!empty($data['id'])) {
                    $result = LdapSyncConflicts::getServerConflicts($data['id']);
                    $res->success = $result->success;
                    $res->messages = $result->messages;
                    $res->data = $result->data;
                } else {
                    $res->success = false;
                    $res->messages[] = 'No server id provided';
                }
                break;
            case 'DELETE-SERVER-CONFLICT':
                if (!empty($data['recordId'])) {
                    $result = LdapSyncConflicts::deleteServerConflict($data['recordId']);
                    $res->success = $result->success;
                    $res->messages = $result->messages;
                    $res->data = $result->data;
                } else {
                    $res->success = false;
                    $res->messages[] = 'No record id provided';
                }
                break;
            case 'DELETE-SERVER-CONFLICTS':
                if (!empty($data['id'])) {
                    $result = LdapSyncConflicts::deleteServerConflicts($data['id']);
                    $res->success = $result->success;
                    $res->messages = $result->messages;
                    $res->data = $result->data;
                } else {
                    $res->success = false;
                    $res->messages[] = 'No server id provided';
                }
                break;
            default:
                $res->success = false;
                $res->messages[] = 'API action not found in ' . __METHOD__;
        }
        return $res;
    }

}