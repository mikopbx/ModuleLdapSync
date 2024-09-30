<?php

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2024 Alexey Portnov and Nikolay Beketov
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

use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\Users;
use Modules\ModuleLdapSync\Models\ADUsers;
use Phalcon\Di\Injectable;

class LdapSyncUsers extends Injectable
{
    /**
     * Gets disabled on LDAP server users
     *
     * @param string $serverId The ID of the LDAP server.
     * @return AnswerStructure
     */
    static public function getDisabledUsers(string $serverId): AnswerStructure
    {
        $res = new AnswerStructure();
        $res->success = true;

        $parameters=[
            'models' => [
                'ADUsers' => ADUsers::class,
            ],
            'columns'=>[
                'id'=>'ADUsers.user_id',
            ],
            'conditions'=>'server_id=:server_id: and disabled=1',
            'bind'=>[
                'server_id'=>intval($serverId)
            ],
        ];

        $di=MikoPBXVersion::getDefaultDi();
        $selectedUsers = $di->get('modelsManager')->createBuilder($parameters)
            ->getQuery()
            ->execute();
        if (empty($selectedUsers->toArray())){
            $res->data=[];
            return $res;
        }
        $arrIDS =  array_column($selectedUsers->toArray(), 'id');

        $parameters=[
            'models' => [
                'Users' => Users::class,
            ],
            'columns'=>[
                'extension_id'=>'Extensions.id',
                'number'=>'Extensions.number',
                'email'=>'Users.email',
                'name'=>'Users.username',
            ],
            'conditions' => 'Users.id IN ({ids:array})',
            'bind' => ['ids' => $arrIDS],
            'joins' => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Extensions.userid=Users.id AND Extensions.type="' . Extensions::TYPE_SIP . '"',
                    2 => 'Extensions',
                    3 => 'INNER',
                ],
            ],
        ];

        $di=MikoPBXVersion::getDefaultDi();

        $records = $di->get('modelsManager')->createBuilder($parameters)
            ->getQuery()
            ->execute();
        foreach ($records as $record) {
            $res->data[$record->extension_id] = [
                'extension_id' => $record->extension_id,
                'number' => $record->number,
                'email' => $record->email,
                'name' => $record->name,
            ];
        }
        return $res;
    }

}