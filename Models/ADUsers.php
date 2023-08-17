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

namespace Modules\ModuleLdapSync\Models;

use MikoPBX\Common\Models\Users;
use MikoPBX\Modules\Models\ModulesModelsBase;
use Phalcon\Mvc\Model\Relation;

class ADUsers extends ModulesModelsBase
{

    /**
     * @Primary
     * @Identity
     * @Column(type="integer", nullable=false)
     */
    public $id;

    /**
     * Link to the users table
     *
     * @Column(type="string", nullable=false)
     */
    public $user_id;


    /**
     * Link to the ldap server table
     *
     * @Column(type="string", nullable=false)
     */
    public $server_id;


    /**
     * User unique ID
     *
     * @Column(type="string", nullable=false)
     */
    public $guid;

    /**
     * Ldap data hash
     *
     * @Column(type="string", nullable=false)
     */
    public $paramsHash;


    public function initialize(): void
    {
        $this->setSource('m_ModuleLdapSync_Users');
        parent::initialize();
        $this->belongsTo(
            'user_id',
            Users::class,
            'id',
            [
                'alias' => 'Users',
                'foreignKey' => [
                    'allowNulls' => false,
                    'action' => Relation::NO_ACTION,
                ],
            ]
        );

        $this->belongsTo(
            'server_id',
            LdapServers::class,
            'id',
            [
                'alias' => 'LdapServers',
            ]
        );
    }

    /**
     * Returns dynamic relations between module models and common models
     * MikoPBX check it in ModelsBase after every call to keep data consistent
     *
     * There is example to describe the relation between Providers and ModuleTemplate models
     *
     * It is important to duplicate the relation alias on message field after Models\ word
     *
     * @param $calledModelObject
     *
     * @return void
     */
    public static function getDynamicRelations(&$calledModelObject): void
    {
        if (is_a($calledModelObject, Users::class)) {
            $calledModelObject->hasOne(
                'id',
                ADUsers::class,
                'user_id',
                [
                    'alias'      => 'ModuleLdapSyncADUsers',
                    'foreignKey' => [
                        'allowNulls' => 0,
                        'message'    => 'Models\ModuleLdapSyncADUsers',
                        'action'     => Relation::ACTION_CASCADE
                    ],
                ]
            );
        }
    }

}