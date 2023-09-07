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
use MikoPBX\Modules\PbxExtensionUtils;
use Modules\ModuleLdapSync\App\Forms\LdapConfigForm;
use Modules\ModuleLdapSync\Lib\Constants;
use Modules\ModuleLdapSync\Models\LdapServers;

class ModuleLdapSyncController extends BaseController
{
    private $moduleUniqueID = 'ModuleLdapSync';

    public bool $showModuleStatusToggle = true;


    /**
     * Basic initial class
     */
    public function initialize(): void
    {
        $this->view->logoImagePath = $this->url->get() . 'assets/img/cache/' . $this->moduleUniqueID . '/logo.svg';
        parent::initialize();
    }

    public function indexAction(): void
    {
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection
            ->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-status.js', true)
            ->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-index.js', true);

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
        $this->showModuleStatusToggle = false;
        $footerCollection = $this->assets->collection(AssetProvider::FOOTER_JS);
        $footerCollection
            ->addJs('js/pbx/main/form.js', true)
            ->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-status.js', true)
            ->addJs('js/cache/'.$this->moduleUniqueID.'/module-ldap-sync-modify.js', true);

        $serverConfig = LdapServers::findFirstById($id);

        if (!$serverConfig) {
            $serverConfig = new LdapServers();
        }

        $attributeValues = json_decode($serverConfig->attributes??'', true);

        $this->view->setVar('hiddenAttributes', json_encode([
            Constants::USER_ACCOUNT_CONTROL_ATTR,
            Constants::USER_GUID_ATTR,
            Constants::USER_DISABLED
        ]));
        $this->view->setVar('userDisabledAttribute', Constants::USER_DISABLED);
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
                    $serverConfig->$name = $data['autosync']==='1'?'0':'1';
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

        $attributes = [
            Constants::USER_EMAIL_ATTR => $data[Constants::USER_EMAIL_ATTR],
            Constants::USER_NAME_ATTR => $data[Constants::USER_NAME_ATTR],
            Constants::USER_MOBILE_ATTR => $data[Constants::USER_MOBILE_ATTR],
            Constants::USER_EXTENSION_ATTR => $data[Constants::USER_EXTENSION_ATTR],
            Constants::USER_AVATAR_ATTR => $data[Constants::USER_AVATAR_ATTR],
            Constants::USER_ACCOUNT_CONTROL_ATTR => $data[Constants::USER_ACCOUNT_CONTROL_ATTR],
        ];
        $serverConfig->attributes = json_encode($attributes);

        $this->saveEntity($serverConfig, 'module-ldap-sync/module-ldap-sync/modify/{id}');
    }


    /**
     * Enables a ldap server.
     *
     * @param string $id Unique identifier of the server.
     */
    public function enableAction(string $id): void
    {
        $this->view->success = false;
        $record = LdapServers::findFirstById($id);
        if ($record !== null) {
            $record->disabled = '0';
            $this->saveEntity($record);
        }
    }

    /**
     * Disables a ldap server.
     *
     * @param string $id Unique identifier of the server.
     */
    public function disableAction(string $id): void
    {
        $this->view->success = false;
        $record = LdapServers::findFirstById($id);
        if ($record !== null) {
            $record->disabled = '1';
            $this->saveEntity($record);
        }
    }

}