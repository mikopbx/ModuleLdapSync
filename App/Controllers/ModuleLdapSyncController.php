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

namespace Modules\ModuleUsersUI\App\Controllers;

use MikoPBX\AdminCabinet\Providers\AssetProvider;
use Modules\ModuleLdapSync\App\Forms\LdapConfigForm;
use Modules\ModuleLdapSync\Lib\Constants;
use Modules\ModuleLdapSync\Lib\LdapSyncConnector;
use Modules\ModuleLdapSync\Models\LdapServers;

class ModuleLdapSyncController extends ModuleUsersUIBaseController
{
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
                'status'=>$server->disabled==='1'?'disabled':'',
            ];
        }
        $this->view->setVar('servers', $serversList);
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

        $this->saveEntity($serverConfig);
    }


    /**
     * Retrieves the available LDAP users.
     *
     * @return void
     */
    public function getAvailableLdapUsersAction(): void
    {
        // Check if the request method is POST
        if (!$this->request->isPost()) {
            return;
        }
        $data = $this->request->getPost();
        $ldapCredentials = $this->prepareLdapCredentialsArrayFromPost($data);
        $ldapConnector = new LdapSyncConnector($ldapCredentials);
        $message = '';

        // Get the list of available LDAP users
        $availableUsers = $ldapConnector->getUsersList($message);

        // Set the data to be passed to the view
        $this->view->data = $availableUsers;
        $this->view->success = count($availableUsers) > 0;
        $this->view->message = $message;
    }

    /**
     * Prepares the LDAP credentials array from the POST data.
     *
     * @param array $postData The POST data.
     *
     * @return array The prepared LDAP credentials array.
     */
    private function prepareLdapCredentialsArrayFromPost(array $postData): array
    {
        // Admin password can be stored in DB on the time, on this way it has only xxxxxx value.
        // It can be empty as well, if some password manager tried to fill it.
        if (empty($postData['administrativePasswordHidden'])
            || $postData['administrativePasswordHidden'] === Constants::HIDDEN_PASSWORD) {
            $ldapConfig = LdapServers::findFirstById($postData['id'])??new LdapServers();
            $postData['administrativePassword'] = $ldapConfig->administrativePassword??'';
        } else {
            $postData['administrativePassword'] = $postData['administrativePasswordHidden'];
        }

        return [
            'serverName' => $postData['serverName'],
            'serverPort' => $postData['serverPort'],
            'baseDN' => $postData['baseDN'],
            'administrativeLogin' => $postData['administrativeLogin'],
            'administrativePassword' => $postData['administrativePassword'],
            'userIdAttribute' => $postData['userIdAttribute'],
            'organizationalUnit' => $postData['organizationalUnit'],
            'userFilter' => $postData['userFilter'],
        ];
    }
}