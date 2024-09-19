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
    'module_ldap_EnableAutoSync'=> 'Включить синхронизацию по расписанию',
    'module_ldap_AddServer'=> 'Добавить сервер',
    'module_ldap_AddServerShort'=> 'Добавить',
    'module_ldap_NoAnyServers'=>'Нет настроенных серверов',
    'module_ldap_TableColumnAutoSync'=> 'Автосинхронизация',
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
    'module_ldap_UserExtensionAttribute' => 'внутренний номер пользователя',
    'module_ldap_UserMobileAttribute' => 'мобильный телефон',
    'module_ldap_UserEmailAttribute' => 'адрес электронной почты',
    'module_ldap_UserNameAttribute'=> 'имя и фамилия пользователя',
    'module_ldap_UserAccountControl'=> 'атрибут где хранится статус блокировки пользователя',
    'module_ldap_UserAvatarAttribute'=> 'атрибут с фотографией',
    'module_ldap_UpdateAttributesMessage'=>'При изменении данных в MikoPBX в домене будут обновляться: внутренний номер, мобильный номер, email, аватар, пароль SIP',
    'module_ldap_UpdateAttributes'=>'Обновлять данные в домене при изменении их в MikoPBX (нужны права на запись)',
    'module_ldap_LdapOrganizationalUnit' => 'Подразделение',
    'module_ldap_LdapUserFilter' => 'Дополнительный фильтр пользователей',
    'module_ldap_LdapCheckGetListHeader' => 'Тест получения списка LDAP пользователей',
    'module_ldap_LdapCheckGetUsersList' => 'Используя указанный параметры доступа и фильтры выполним запрос к LDAP/AD и получим порцию из 20 пользователей для синхронизации',
    'module_ldap_LdapGetUsersButton' => 'Выполнить запрос',
    'module_ldap_user_not_found'=>'Пользователь не имеет доступ к домену или указаны неправильные параметры',
    'module_ldap_ValidateServerNameIsEmpty' => 'Не заполнен адрес контроллера домена',
    'module_ldap_ValidateServerPortIsEmpty' => 'Не заполнен порт контроллера домена',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Не заполнен логин для пользователя домена',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Не заполнен пароль для пользователя домена',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Не заполнен корень домена',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Не заполнен атрибут с именем пользователя в домене',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Не заполнен атрибут с мобильным телефоном пользователя в домене',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Не заполнен атрибут с внутренним номером телефона пользователя в домене',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Не заполнен атрибут с электронной почтой пользователя в домене',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Не заполнен атрибут с атрибутом активности пользователя в домене',
    'module_ldap_LdapManualSyncHeader'=>'Ручная синхронизация',
    'module_ldap_LdapManualSyncManual'=>'При нажатии на кнопку будет выполнена синхронизация порции из 20 пользователей между указанным контроллером домена и MikoPBX',
    'module_ldap_LdapManualSyncButton'=>'Синхронизировать данные',
    'module_ldap_usersSyncResult'=>'Статус',
    'module_ldap_userHadChangesOnTheSide'=>'Обновлен',
    'module_ldap_OnPBXSide'=>'внутри MikoPBX',
    'module_ldap_OnDomainSide'=>'в домене',
    'module_ldap_SKIPPED'=>'пропущен',
    'module_ldap_UPDATED'=>'обработан',
    'module_ldap_CONFLICT'=>'конфликт',
    'module_ldap_SyncTabHeader'=>'Синхронизация и конфликты',
    'module_ldap_ConflictsTabHeader'=>'Конфликты синхронизации',
    'module_ldap_TabAttributes'=>'Поля синхронизации',
    'module_ldap_NoAnyConflicts'=>'Проблем не обнаружено',
    'module_ldap_deleteCurrentConflict'=>'Удалить текущую запись, не меняет данных ни в PBX ни на стороне LDAP/AD сервера',
    'module_ldap_ConflictTime'=>'Дата',
    'module_ldap_ConflictUserData'=>'Сохраняемые данные',
    'module_ldap_ConflictSide'=>'Кто отказал',
    'module_ldap_ConflictErrorMessages'=>'Причина отказа',
    'module_ldap_DeleteAllConflicts'=>'Очистить все конфликты',
    'module_ldap_PBX_UPDATE_CONFLICT'=>'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT'=>'LDAP/AD',
    'module_ldap_UserPasswordAttribute'=>'Пароль SIP',
    'module_ldap_UseTLS'=>'TLS/SSL',
    'module_ldap_UserName'=>'Имя пользователя',
    'module_ldap_UserNumber'=>'Внутренний номер',
    'module_ldap_UserEmail'=>'Email',
    'module_ldap_findExtension'=>'Найти в списке пользователей',
    'module_ldap_DeletedUsersHeader'=>'Отключенные в LDAP/AD сотрудники',
    'module_ldap_DeletedUsersEmpty'=>'Нет отключенных сотрудников',
];