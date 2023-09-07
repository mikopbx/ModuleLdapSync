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

namespace Modules\ModuleLdapSync\Lib\Workers;


use MikoPBX\Common\Providers\ManagedCacheProvider;
use MikoPBX\Core\Workers\WorkerBase;
use Modules\ModuleLdapSync\Lib\LdapSyncMain;

require_once 'Globals.php';

/**
 * WorkerLdapSync is a worker class responsible for sync users on LDAP with users on MikoPBX.
 *
 * @package Modules\ModuleLdapSync\Lib\Workers
 */
class WorkerLdapSync extends WorkerBase
{
    public const CACHE_KEY  = 'Workers:WorkerLdapSync:lastCheck';

    /**
     * Starts the checker worker.
     *
     * @param array $argv The command-line arguments passed to the worker.
     * @return void
     */
    public function start(array $argv): void
    {
        $managedCache = $this->di->get(ManagedCacheProvider::SERVICE_NAME);
        // Retrieve the last license check timestamp from the cache
        $lastCheck = $managedCache->get(self::CACHE_KEY);
        if ($lastCheck === null) {
            // Sync LDAP and MikoPBX users
            LdapSyncMain::syncAllUsers();

            // Store the current timestamp in the cache to track the last repository check
            $managedCache->set(self::CACHE_KEY, time(), 3600); // Check every hour
        }
    }
}

// Start worker process
WorkerLdapSync::startWorker($argv ?? []);