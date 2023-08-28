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
    'BreadcrumbModuleLdapSync'  => 'Синхронизация с LDAP/AD',
    'SubHeaderModuleLdapSync'   => 'Модуль позволяет загружать пользователей из домена',
    'module_ldap_LdapServerConnectionHeader'=>'Параметры подключения к контроллеру домена',
    'module_ldap_AddServer'=> 'Добавить сервер',
    'module_ldap_AddServerShort'=> 'Добавить',
    'module_ldap_NoAnyServers'=>'Нет настроенных серверов',
    'module_ldap_TableColumnServerName'=>'Адрес сервера',
    'module_ldap_OrganizationalUnit'=>'Подразделение',
    'module_ldap_BaseDN'=>'Корень домена',
    'module_ldap_ldapType'=>'Тип сервера',
    'module_ldap_LdapServerName' => 'Адрес контроллера домена',
    'module_ldap_LdapServerPort' => 'Порт',
    'module_ldap_LdapAdminLogin' => 'Имя пользователя и пароль с правами на чтение и запись в домене',
    'module_ldap_LdapBaseDN' => 'Корень домена',
    'module_ldap_LdapPassword' => 'Пароль',
    'module_ldap_LdapAttributesHeader'=> 'Аттрибуты в домене для сопоставления с данными в MikoPBX',
    'module_ldap_ExtensionAttribute' => 'внутренний номер пользователя',
    'module_ldap_MobileAttribute' => 'мобильный телефон',
    'module_ldap_EmailAttribute' => 'адрес электронной почты',
    'module_ldap_UserNameAttribute'=> 'имя и фамилия пользователя',
    'module_ldap_UserAccountControl'=> 'атрибут где хранится статус блокировки пользователя',
    'module_ldap_UserAvatarAttribute'=> 'атрибут с фотографией',
    'module_ldap_UpdateAttributes'=>'Обновлять номера телефонов в домене при изменении их в MikoPBX (нужны права на запись)',
    'module_ldap_LdapOrganizationalUnit' => 'Подразделение',
    'module_ldap_LdapUserFilter' => 'Дополнительный фильтр пользователей',
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
    'module_ldap_LdapManualSyncHeader'=>'Ручная синхронизация',
    'module_ldap_LdapManualSyncManual'=>'При нажатии на кнопку будет выполнена синхронизация пользователей между указанным контроллером домена и MikoPBX',
    'module_ldap_LdapManualSyncButton'=>'Синхронизировать данные',
    'module_ldap_usersSyncResult'=>'Статус',
    'module_ldap_userHadChangesOnTheSide'=>'Обновлен',
    'module_ldap_OnPBXSide'=>'внутри MikoPBX',
    'module_ldap_OnDomainSide'=>'в домене',
    'module_ldap_SKIPPED'=>'пропущен',
    'module_ldap_UPDATED'=>'обработан',
];