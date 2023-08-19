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

namespace Modules\ModuleLdapSync\App\Controllers;

use MikoPBX\AdminCabinet\Controllers\BaseController;
use MikoPBX\AdminCabinet\Providers\AssetProvider;
use Modules\ModuleLdapSync\App\Forms\LdapConfigForm;
use Modules\ModuleLdapSync\Lib\Constants;
use Modules\ModuleLdapSync\Models\LdapServers;

class ModuleLdapSyncController extends BaseController
{
    private $moduleUniqueID = 'ModuleLdapSync';

    public function indexAction(): void
    {
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-index.js', true);

        $servers = LdapServers::find();
        $serversList = null;
        foreach ($servers as $server){
            $serversList[]=[
                'id'=>$server->id,
                'serverName' => $server->serverName,
                'baseDN' => $server->baseDN,
                'organizationalUnit' => $server->organizationalUnit,
                'status'=>$server->disabled==='1'?'disabled':'',
            ];
        }
        $this->view->setVar('serversList', $serversList);
    }

    /**
     * The modify action for creating or editing LDAP server record.
     *
     * @param string|null $id The ID of the server (optional)
     *
     * @return void
     */
    public function modifyAction(string $id = null): void
    {
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection
            ->addJs('js/pbx/main/form.js', true)
            ->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-modify.js', true);

        $serverConfig = LdapServers::findFirstById($id);

        if (!$serverConfig) {
            $serverConfig = new LdapServers();
        }

        $this->view->setVar('ldapForm', new LdapConfigForm($serverConfig));
    }

    /**
     * Save LDAP configuration.
     *
     * @return void
     */
    public function saveAction(): void
    {
        if (!$this->request->isPost()) {
            return;
        }

        $data = $this->request->getPost();
        $serverConfig = LdapServers::findFirstById($data['id']);

        if (!$serverConfig) {
            $serverConfig = new LdapServers();
        }

        // Update serverConfig properties with the provided data
        foreach ($serverConfig as $name => $value) {
            switch ($name) {
                case 'id':
                    break;
                case 'disabled':
                    $serverConfig->$name = '0';
                    break;
                case 'administrativePassword':
                    if (isset($data['administrativePasswordHidden'])
                        && $data['administrativePasswordHidden'] !== Constants::HIDDEN_PASSWORD) {
                        $serverConfig->$name = $data['administrativePasswordHidden'];
                    }
                    break;
                default:
                    if (isset($data[$name])) {
                        $serverConfig->$name = $data[$name];
                    } else {
                        $serverConfig->$name = '';
                    }
            }
        }

        $this->saveEntity($serverConfig, 'module-ldap-sync/module-ldap-sync/modify/'.$serverConfig->id);
    }

}