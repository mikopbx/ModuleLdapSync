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
    'repModuleLdapSync' => 'Synchronizacja z LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synchronizacja z LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronizacja z LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Moduł pozwala na załadowanie użytkowników z domeny',
    'module_ldap_LdapServerConnectionHeader' => 'Ustawienia połączenia kontrolera domeny',
    'module_ldap_AddServer' => 'Dodaj serwer',
    'module_ldap_AddServerShort' => 'Dodać',
    'module_ldap_NoAnyServers' => 'Nie skonfigurowano żadnych serwerów',
    'module_ldap_TableColumnServerName' => 'Adres serwera',
    'module_ldap_OrganizationalUnit' => 'Poddział',
    'module_ldap_BaseDN' => 'Katalog główny domeny',
    'module_ldap_ldapType' => 'Rodzaj serwera',
    'module_ldap_LdapServerName' => 'Adres kontrolera domeny',
    'module_ldap_LdapServerPort' => 'Port',
    'module_ldap_LdapAdminLogin' => 'Nazwa użytkownika i hasło z dostępem do odczytu/zapisu w domenie',
    'module_ldap_LdapBaseDN' => 'Katalog główny domeny',
    'module_ldap_LdapPassword' => 'Hasło',
    'module_ldap_LdapAttributesHeader' => 'Atrybuty w domenie umożliwiające dopasowanie do danych w MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'Numer wewnętrzny użytkownika',
    'module_ldap_UserMobileAttribute' => 'Telefon komórkowy',
    'module_ldap_UserEmailAttribute' => 'Adres e-mail',
    'module_ldap_UserNameAttribute' => 'Imię i nazwisko użytkownika',
    'module_ldap_UserAccountControl' => 'Atrybut, w którym przechowywany jest status blokowania użytkownika',
    'module_ldap_UserAvatarAttribute' => 'Atrybut ze zdjęciem',
    'module_ldap_UpdateAttributes' => 'Aktualizuj dane w domenie podczas jej zmiany w MikoPBX (wymagane prawa zapisu)',
    'module_ldap_LdapOrganizationalUnit' => 'Poddział',
    'module_ldap_LdapUserFilter' => 'Dodatkowy filtr użytkownika',
    'module_ldap_LdapCheckGetListHeader' => 'Przetestuj, aby uzyskać listę użytkowników LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Korzystając z podanych parametrów dostępu i filtrów wykonamy żądanie do LDAP/AD i otrzymamy część 20 użytkowników do synchronizacji',
    'module_ldap_LdapGetUsersButton' => 'Uruchom żądanie',
    'module_ldap_user_not_found' => 'Użytkownik nie ma dostępu do domeny lub podane parametry są nieprawidłowe',
    'module_ldap_ValidateServerNameIsEmpty' => 'Adres kontrolera domeny nie został wypełniony',
    'module_ldap_ValidateServerPortIsEmpty' => 'Port kontrolera domeny nie jest wypełniony',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Login użytkownika domeny nie jest wypełniony',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Hasło nie zostało wypełnione dla użytkownika domeny',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Katalog główny domeny nie jest wypełniony',
    'module_ldap_LdapManualSyncHeader' => 'Synchronizacja ręczna',
    'module_ldap_LdapManualSyncManual' => 'Po kliknięciu przycisku część 20 użytkowników zostanie zsynchronizowana pomiędzy określonym kontrolerem domeny a MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synchronizuj dane',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Zaktualizowano',
    'module_ldap_OnPBXSide' => 'wewnątrz MikoPBX',
    'module_ldap_OnDomainSide' => 'w domenie',
    'module_ldap_SKIPPED' => 'pominięte',
    'module_ldap_UPDATED' => 'obrobiony',
    'module_ldap_EnableAutoSync' => 'Włącz zaplanowaną synchronizację',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Atrybut z nazwą użytkownika w domenie nie jest wypełniony',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Atrybut z telefonem komórkowym użytkownika w domenie nie jest wypełniony',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Atrybut z wewnętrznym numerem telefonu użytkownika w domenie nie jest wypełniony',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Atrybut z adresem e-mail użytkownika w domenie nie jest wypełniony',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Atrybut z atrybutem aktywności użytkownika w domenie nie jest wypełniony',
    'module_ldap_TableColumnAutoSync' => 'Automatyczna synchronizacja',
    'module_ldap_ConflictsTabHeader' => 'Konflikty synchronizacji',
    'module_ldap_NoAnyConflicts' => 'Nie znaleziono żadnych problemów',
    'module_ldap_deleteCurrentConflict' => 'Usunięcie aktualnego wpisu nie powoduje zmiany danych ani w centrali, ani po stronie serwera LDAP/AD',
    'module_ldap_ConflictTime' => 'Data',
    'module_ldap_ConflictUserData' => 'Zapisane dane',
    'module_ldap_ConflictSide' => 'Kto odmówił',
    'module_ldap_ConflictErrorMessages' => 'Powód odmowy',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'centrala telefoniczna',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'konflikt',
    'module_ldap_SyncTabHeader' => 'Synchronizacja i konflikty',
    'module_ldap_TabAttributes' => 'Pola synchronizacji',
    'module_ldap_DeleteAllConflicts' => 'Usuń wszystkie konflikty',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'W przypadku zmiany danych w MikoPBX w domenie zostaną zaktualizowane: numer wewnętrzny, numer telefonu komórkowego, e-mail, awatar, hasło SIP',
    'module_ldap_UserPasswordAttribute' => 'Hasło SIP',
    'module_ldap_UserName' => 'Nazwa użytkownika',
    'module_ldap_UserNumber' => 'Numer wewnętrzny',
    'module_ldap_findExtension' => 'Znajdź na liście użytkowników',
    'module_ldap_DeletedUsersHeader' => 'Pracownicy wyłączeni w LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'Brak pracowników niepełnosprawnych',
    'module_ldap_UserEmail' => 'E-mail',
];
