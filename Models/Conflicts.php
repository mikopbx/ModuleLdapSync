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

namespace Modules\ModuleLdapSync\Models;

use MikoPBX\Modules\Models\ModulesModelsBase;
class Conflicts extends ModulesModelsBase
{

    /**
     * @Primary
     * @Identity
     * @Column(type="integer", nullable=false)
     */
    public $id;


    /**
     * Last time happened
     *
     * @Column(type="string", nullable=true)
     */
    public $lastTime;

    /**
     * Errors
     *
     * @Column(type="string", nullable=true)
     */
    public $errors;

    /**
     * Remote data JSON
     *
     * @Column(type="string", nullable=true)
     */
    public $params;

    /**
     * Remote data hash
     *
     * @Column(type="string", nullable=true)
     */
    public $paramsHash;

    /**
     * PBX_UPDATE_CONFLICT or LDAP_UPDATE_CONFLICT
     * @Column(type="string", nullable=true)
    */
    public $side;

    /**
     * Link to the ldap server table
     *
     * @Column(type="string", nullable=false)
     */
    public $server_id;


    public function initialize(): void
    {
        $this->setSource('m_ModuleLdapSync_Conflicts');
        parent::initialize();
        $this->belongsTo(
            'server_id',
            LdapServers::class,
            'id',
            [
                'alias' => 'LdapServers',
            ]
        );
    }
}