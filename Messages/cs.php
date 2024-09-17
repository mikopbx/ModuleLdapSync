<?php
return [
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
    'repModuleLdapSync' => 'Synchronizace s LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synchronizace s LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronizace s LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Modul umožňuje načíst uživatele z domény',
    'module_ldap_LdapServerConnectionHeader' => 'Nastavení připojení řadiče domény',
    'module_ldap_AddServer' => 'Přidat server',
    'module_ldap_AddServerShort' => 'Přidat',
    'module_ldap_NoAnyServers' => 'Nejsou nakonfigurovány žádné servery',
    'module_ldap_TableColumnServerName' => 'Adresa serveru',
    'module_ldap_OrganizationalUnit' => 'Pododdělení',
    'module_ldap_BaseDN' => 'Kořen domény',
    'module_ldap_ldapType' => 'Typ serveru',
    'module_ldap_LdapServerName' => 'Adresa řadiče domény',
    'module_ldap_LdapServerPort' => 'Přístav',
    'module_ldap_LdapAdminLogin' => 'Uživatelské jméno a heslo s přístupem pro čtení/zápis do domény',
    'module_ldap_LdapBaseDN' => 'Kořen domény',
    'module_ldap_LdapPassword' => 'Heslo',
    'module_ldap_LdapAttributesHeader' => 'Atributy v doméně pro párování s daty v MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'číslo uživatelské pobočky',
    'module_ldap_UserMobileAttribute' => 'mobilní telefon',
    'module_ldap_UserEmailAttribute' => 'Emailová adresa',
    'module_ldap_UserNameAttribute' => 'jméno a příjmení uživatele',
    'module_ldap_UserAccountControl' => 'atribut, kde je uložen stav uzamčení uživatele',
    'module_ldap_UserAvatarAttribute' => 'atribut fotografie',
    'module_ldap_UpdateAttributes' => 'Aktualizace telefonních čísel v doméně, když se změní v MikoPBX (vyžaduje oprávnění k zápisu)',
    'module_ldap_LdapOrganizationalUnit' => 'Pododdělení',
    'module_ldap_LdapUserFilter' => 'Další uživatelský filtr',
    'module_ldap_LdapCheckGetListHeader' => 'Otestujte a získejte seznam uživatelů LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Pomocí zadaných přístupových parametrů a filtrů provedeme požadavek na LDAP/AD a obdržíme část 20 uživatelů k synchronizaci',
    'module_ldap_LdapGetUsersButton' => 'Spustit požadavek',
    'module_ldap_user_not_found' => 'Uživatel nemá přístup k doméně nebo jsou zadané parametry nesprávné',
    'module_ldap_ValidateServerNameIsEmpty' => 'Adresa řadiče domény není vyplněna',
    'module_ldap_ValidateServerPortIsEmpty' => 'Port řadiče domény není obsazen',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Přihlašovací jméno pro uživatele domény není vyplněno',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Není vyplněno heslo pro uživatele domény',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Kořen domény není vyplněn',
    'module_ldap_LdapManualSyncHeader' => 'Ruční synchronizace',
    'module_ldap_LdapManualSyncManual' => 'Po kliknutí na tlačítko bude část 20 uživatelů synchronizována mezi určeným doménovým řadičem a MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synchronizujte data',
    'module_ldap_usersSyncResult' => 'Postavení',
    'module_ldap_userHadChangesOnTheSide' => 'Aktualizováno',
    'module_ldap_OnPBXSide' => 'uvnitř MikoPBX',
    'module_ldap_OnDomainSide' => 'v doméně',
    'module_ldap_SKIPPED' => 'přeskočeno',
    'module_ldap_UPDATED' => 'zpracováno',
    'module_ldap_EnableAutoSync' => 'Povolit plánovanou synchronizaci',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Atribut s uživatelským jménem v doméně není vyplněn',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Atribut s mobilním telefonem uživatele v doméně není vyplněn',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Atribut s interním telefonním číslem uživatele v doméně není vyplněn',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Atribut s e-mailem uživatele v doméně není vyplněn',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Atribut s atributem aktivity uživatele v doméně není vyplněn',
    'module_ldap_TableColumnAutoSync' => 'Automatická synchronizace',
    'module_ldap_NoAnyConflicts' => 'Nebyly nalezeny žádné problémy',
    'module_ldap_ConflictsTabHeader' => 'Synchronizační konflikty',
    'module_ldap_deleteCurrentConflict' => 'Smazat aktuální záznam, nezmění data ani v ústředně ani na straně LDAP/AD serveru',
    'module_ldap_ConflictTime' => 'Datum',
    'module_ldap_ConflictUserData' => 'Uložená data',
    'module_ldap_ConflictSide' => 'Kdo odmítl',
    'module_ldap_ConflictErrorMessages' => 'Důvod odmítnutí',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'konflikt',
    'module_ldap_SyncTabHeader' => 'Synchronizace a konflikty',
    'module_ldap_TabAttributes' => 'Synchronizační pole',
    'module_ldap_DeleteAllConflicts' => 'Vymažte všechny konflikty',
];
