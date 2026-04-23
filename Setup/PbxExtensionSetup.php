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

namespace Modules\ModuleLdapSync\Setup;

use MikoPBX\Modules\Setup\PbxExtensionSetupBase;
use Modules\ModuleLdapSync\Models\LdapServers;
use Throwable;

/**
 * Class PbxExtensionSetup
 * Module installer and uninstaller
 *
 * @package Modules\ModuleLdapSync\Setup
 */
class PbxExtensionSetup extends PbxExtensionSetupBase
{
    /**
     * Runs schema upgrade via model annotations, then performs data migrations
     * for existing installations upgrading from < 1.39.
     *
     * @return bool
     */
    public function installDB(): bool
    {
        $result = parent::installDB();

        if ($result) {
            $this->migrateLegacyTlsFlag();
        }

        return $result;
    }

    /**
     * Maps the legacy `useTLS` flag onto the new `tlsMode` column for rows that
     * were created by versions < 1.39. Idempotent — only touches rows that still
     * have the default `tlsMode='none'`.
     *
     * Old: useTLS='1' (StartTLS on port 389)  → tlsMode='starttls'
     * Old: useTLS='0' (no encryption)          → tlsMode='none' (already default)
     */
    private function migrateLegacyTlsFlag(): void
    {
        try {
            $legacyRows = LdapServers::find([
                'conditions' => 'useTLS = :useTLS: AND tlsMode = :defaultMode:',
                'bind'       => [
                    'useTLS'      => '1',
                    'defaultMode' => 'none',
                ],
            ]);

            foreach ($legacyRows as $row) {
                $row->tlsMode = 'starttls';
                $row->save();
            }
        } catch (Throwable $e) {
            // Do not block install on migration failure — schema is already in place.
            $this->messages[] = 'ModuleLdapSync TLS migration skipped: ' . $e->getMessage();
        }
    }
}
