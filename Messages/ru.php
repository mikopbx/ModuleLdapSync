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

return [
	'repModuleLdapSync'         => 'Синхронизация с LDAP/AD - %repesent%',
	'mo_ModuleModuleLdapSync'   => 'Синхронизация с LDAP/AD',
    'BreadcrumbModuleLdapSync'  => 'Модуль позволяет загружать пользователей из домена',
    'module_ldap_AddServer'=> 'Добавить сервер',
    'module_ldap_AddServerShort'=> 'Добавить',
    'module_ldap_NoAnyServers'=>'Нет настроенных серверов',
    'module_ldap_TableColumnServerName'=>'Имя сервера',
    'module_ldap_BaseDN'=>'Корень домена',
    'module_ldap_LdapServerName' => 'Адрес контроллера домена',
    'module_ldap_LdapServerPort' => 'Порт',
    'module_ldap_LdapAdminLogin' => 'Имя пользователя и пароль с правами на чтение в домене',
    'module_ldap_LdapBaseDN' => 'Корень домена',
    'module_ldap_LdapPassword' => 'Пароль',
    'module_ldap_LdapUserAttribute' => 'Имя пользователя',
    'module_ldap_LdapUserFilter' => 'Дополнительный фильтр пользователей',
    'module_ldap_LdapUserIdAttribute' => 'Атрибут в котором хранится идентификатор пользователя',
    'module_ldap_ExtensionAttribute' => 'Атрибут в котором хранится внутренний номер пользователя',
    'module_ldap_MobileAttribute' => 'Атрибут в котором хранится мобильный телефон',
    'module_ldap_EmailAttribute' => 'Атрибут в котором хранится адрес электронной почты',
    'module_ldap_NameAttribute'=> 'Атрибут в котором хранится полное имя пользователя',
    'module_ldap_LdapOrganizationalUnit' => 'Подразделение',
    'module_ldap_LdapCheckGetListHeader' => 'Тест получения списка LDAP пользователей',
    'module_ldap_LdapCheckGetUsersList' => 'Используя указанный параметры доступа и фильтры выполним запрос к LDAP/AD и получим список пользователей для синхронизации',
    'module_ldap_LdapGetUsersButton' => 'Выполнить запрос',
    'module_ldap_user_not_found'=>'Пользователь не имеет доступ к домену или указаны неправильные параметры',
    'module_ldap_ValidateServerNameIsEmpty' => 'Не заполнен адрес контроллера домена',
    'module_ldap_ValidateServerPortIsEmpty' => 'Не заполнен порт контроллера домена',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Не заполнен логин для пользователя домена',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Не заполнен пароль для пользователя домена',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Не заполнен корень домена',
    'module_ldap_ValidateUserIdAttributeIsEmpty' => 'Не заполнен атрибут с именем пользователя в домене',
];