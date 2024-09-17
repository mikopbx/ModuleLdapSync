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

namespace Modules\ModuleLdapSync\App\Forms;

use MikoPBX\AdminCabinet\Forms\BaseForm;
use Modules\ModuleLdapSync\Lib\Constants;
use Phalcon\Forms\Element\Check;
use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Password;
use Phalcon\Forms\Element\Select;
use Phalcon\Forms\Element\Text;


class LdapConfigForm extends BaseForm
{
    public function initialize($entity = null, $options = null): void
    {
        // ID
        $this->add(new Hidden('id'));

        // Autosync checkbox
        $checkArr = [];
        if ($entity->disabled === '0') {
            $checkArr['checked'] = 'checked';
        }
        $this->add(new Check('autosync', $checkArr));

        // ServerHost
        $this->add(new Text('serverName', [
            'placeholder' => 'dc1.domain.com'
        ]));

        // ServerPort
        $this->add(new Text('serverPort', [
            'placeholder' => '389',
            'value' =>$entity->serverPort ?? '389'
        ]));

        // AdministrativeLogin
        $this->add(new Text('administrativeLogin', ['placeholder' => 'cn=admin, dc=example, dc=com']));

        // AdministrativePassword
        $this->add(new Password('administrativePasswordHidden', [
            'autocomplete' => 'off',
            'placeholder' => 'Domain admin password',
            'value' => Constants::HIDDEN_PASSWORD
        ]));

        // BaseDN
        $this->add(new Text('baseDN', [
            'placeholder' => 'dc=domain, dc=com',
            'value' => $entity->baseDN ?? 'dc=domain, dc=com'
        ]));

        // UserFilter
        $this->addTextArea('userFilter', $entity->userFilter ?? '(&(objectClass=user)(objectCategory=PERSON))', 90, [
            'placeholder' => '(&(objectClass=user)(objectCategory=PERSON))'
        ]);

        // Select server type
        $types = [
            'ActiveDirectory' => 'ActiveDirectory',
            'OpenLDAP' => 'OpenLDAP',
            'DirectoryServer' => 'DirectoryServer',
            'FreeIPA' => 'FreeIPA',
        ];
        $extension = new Select(
            'ldapType', $types, [
                'using' => [
                    'id',
                    'name',
                ],
                'emptyValue' => 'ActiveDirectory',
                'useEmpty' => false,
                'class' => "ui selection dropdown select-ldap-field",
            ]
        );
        $this->add($extension);


        $attributes = json_decode($entity->attributes??'', true);


        // UserNameAttribute
        $this->add(new Text(Constants::USER_NAME_ATTR, [
            'placeholder' => 'cn or displayName',
            'value' => $attributes[Constants::USER_NAME_ATTR] ?? 'displayName'
        ]));

        // UserExtensionAttribute
        $this->add(new Text(Constants::USER_EXTENSION_ATTR, [
            'placeholder' => 'telephoneNumber',
            'value' => $attributes[Constants::USER_EXTENSION_ATTR] ?? 'telephoneNumber'
        ]));

        // UserMobileAttribute
        $this->add(new Text(Constants::USER_MOBILE_ATTR, [
            'placeholder' => 'mobile',
            'value' => $attributes[Constants::USER_MOBILE_ATTR] ?? 'mobile'
        ]));

        // UserEmailAttribute
        $this->add(new Text(Constants::USER_EMAIL_ATTR, [
            'placeholder' => 'mail',
            'value' => $attributes[Constants::USER_EMAIL_ATTR] ?? 'mail'
        ]));

        // UserAvatarAttribute
        $this->add(new Text(Constants::USER_AVATAR_ATTR, [
            'placeholder' => 'jpegPhoto',
            'value' => $attributes[Constants::USER_AVATAR_ATTR] ?? 'jpegPhoto'
        ]));

        // UserAccountControlAttribute
        $this->add(new Text(Constants::USER_ACCOUNT_CONTROL_ATTR, [
            'placeholder' => 'userAccountControl',
            'value' => $attributes[Constants::USER_ACCOUNT_CONTROL_ATTR] ?? 'userAccountControl'
        ]));

        // OrganizationUnit
        $this->add(new Text('organizationalUnit', [
            'placeholder' => 'ou=users, dc=domain, dc=com'
        ]));

        // UpdateAttributes checkbox
        $checkArr = [];
        if ($entity->updateAttributes === '1') {
            $checkArr['checked'] = 'checked';
        }
        $this->add(new Check('updateAttributes', $checkArr));

    }
}