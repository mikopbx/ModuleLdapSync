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
use Modules\ModuleLdapSync\Lib\MikoPBXVersion;

require_once 'Globals.php';

/**
 * WorkerLdapSync is a worker class responsible for synchronizing users on LDAP with users on MikoPBX.
 *
 * @package Modules\ModuleLdapSync\Lib\Workers
 */
class WorkerLdapSync extends WorkerBase
{
    public const CACHE_KEY  = 'Workers:WorkerLdapSync:lastSync';

    /**
     * Starts the LDAP synchronization worker.
     *
     * @param array $argv The command-line arguments passed to the worker.
     * @return void
     */
    public function start(array $argv): void
    {
        $managedCache = $this->di->get(ManagedCacheProvider::SERVICE_NAME);

        // Retrieve the last sync timestamp from the cache
        $lastSync = $managedCache->get(self::CACHE_KEY);

        if ($lastSync === null) {
            // Generate a random delay before the first run
            $randomDelay = $this->generateRandomDelay();

            // Store the current timestamp in the cache to track the last sync check
            $managedCache->set(self::CACHE_KEY, time() + $randomDelay, 86400); // Sync every hour if no changes; decrease interval if changes

            // Sleep for the random delay before the first sync check
            sleep($randomDelay);

            // Sync LDAP and MikoPBX users
            LdapSyncMain::syncAllUsers();
        } elseif (time() - $lastSync > 3600) {
            $managedCache->set(self::CACHE_KEY, time(), 86400);
            // Sync LDAP and MikoPBX users every hour
            LdapSyncMain::syncAllUsers();
        }

    }

    /**
     * Increases the sync frequency for LDAP synchronization.
     *
     * @return void
     */
    public static function increaseSyncFrequency():void
    {
        $di=MikoPBXVersion::getDefaultDi();
        $managedCache = $di->get(ManagedCacheProvider::SERVICE_NAME);
        // Decrease sync interval to 5 minutes if changes occur
        $managedCache->set(self::CACHE_KEY, time()-3300, 86400);
    }

    /**
     * Generates a random delay before the first run.
     *
     * @return int The delay in seconds.
     */
    private function generateRandomDelay(): int
    {
        // Generate a random delay between 0 and 3600 seconds (1 hour)
        return rand(0, 3600);
    }
}

// Start worker process
WorkerLdapSync::startWorker($argv ?? []);