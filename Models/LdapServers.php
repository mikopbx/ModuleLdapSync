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

use MikoPBX\Modules\Models\ModulesModelsBase;

class LdapServers extends ModulesModelsBase
{

    /**
     * @Primary
     * @Identity
     * @Column(type="integer", nullable=false)
     */
    public $id;

    /**
     * Ldap server host name or IP
     *
     * @Column(type="string", nullable=false)
     */
    public $serverName;

    /**
     * Ldap server port
     *
     * @Column(type="string", nullable=false)
     */
    public $serverPort;

    /**
     * Login of user with read rights on the domain
     *
     * @Column(type="string", nullable=false)
     */
    public $administrativeLogin;

    /**
     * Password of user with read rights on the domain
     *
     * @Column(type="string", nullable=false)
     */
    public $administrativePassword;

    /**
     * Tree root (base DN)
     *
     * @Column(type="string", nullable=false)
     */
    public $baseDN;

    /**
     * User filter  i.e. s (&(objectClass=user)(objectCategory=PERSON))
     *
     * @Column(type="string", nullable=true)
     */
    public $userFilter;

    /**
     * Type of ldap server {ActiveDirectory, OpenLDAP, FreeIPA, DirectoryServer}
     *
     * @Column(type="string", nullable=false)
     */
    public ?string $ldapType='ActiveDirectory';

    /**
     * JSON with user attributes
     *
     * @Column(type="string", nullable=false)
     */
    public ?string $attributes='';

    /**
     * Organizational unit filter  i.e. s OU=Accounting,DC=miko,DC=ru
     *
     * @Column(type="string", nullable=true)
     */
    public $organizationalUnit;

    /**
     * Flag update AD attributes from MikoPBX
     *
     * @Column(type="string", length=1, nullable=false)
     */
    public ?string $updateAttributes = '0';

    /**
     * Flag indicating whether the server account is disabled or not
     *
     * @Column(type="string", length=1, nullable=false)
     */
    public ?string $disabled = '0';

    public function initialize(): void
    {
        $this->setSource('m_ModuleLdapSyncServers');
        parent::initialize();

        $this->hasMany(
            'id',
            ADUsers::class,
            'server_id',
            [
                'alias'      => 'ADUsers',
            ]
        );

        $this->hasMany(
            'id',
            Conflicts::class,
            'server_id',
            [
                'alias'      => 'Conflicts',
            ]
        );
    }

}