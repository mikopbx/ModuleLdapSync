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
    'repModuleLdapSync' => 'Szinkronizálás LDAP/AD-vel – %repesent%',
    'mo_ModuleModuleLdapSync' => 'Szinkronizálás LDAP/AD-vel',
    'BreadcrumbModuleLdapSync' => 'Szinkronizálás LDAP/AD-vel',
    'SubHeaderModuleLdapSync' => 'A modul lehetővé teszi felhasználók betöltését egy tartományból',
    'module_ldap_LdapServerConnectionHeader' => 'Csatlakozási beállítások egy tartományvezérlőhöz',
    'module_ldap_EnableAutoSync' => 'Ütemezett szinkronizálás engedélyezése',
    'module_ldap_AddServer' => 'Szerver hozzáadása',
    'module_ldap_AddServerShort' => 'Hozzáadás',
    'module_ldap_NoAnyServers' => 'Nincsenek konfigurálva szerverek',
    'module_ldap_TableColumnAutoSync' => 'Automatikus szinkronizáció',
    'module_ldap_TableColumnServerName' => 'Szerver címe',
    'module_ldap_OrganizationalUnit' => 'Felosztás',
    'module_ldap_BaseDN' => 'Domain gyökér',
    'module_ldap_ldapType' => 'Szerver típusa',
    'module_ldap_LdapServerName' => 'A tartományvezérlő címe',
    'module_ldap_LdapServerPort' => 'Kikötő',
    'module_ldap_LdapAdminLogin' => 'Felhasználónév és jelszó írási és olvasási jogosultsággal a tartományban',
    'module_ldap_LdapBaseDN' => 'Domain gyökér',
    'module_ldap_LdapPassword' => 'Jelszó',
    'module_ldap_LdapAttributesHeader' => 'Attribútumok a tartományban a MikoPBX-ben lévő adatokkal való egyeztetéshez',
    'module_ldap_UserExtensionAttribute' => 'felhasználói mellékállomás száma',
    'module_ldap_UserMobileAttribute' => 'mobiltelefon',
    'module_ldap_UserEmailAttribute' => 'Email cím',
    'module_ldap_UserNameAttribute' => 'a felhasználó kereszt- és vezetékneve',
    'module_ldap_UserAccountControl' => 'attribútum, ahol a felhasználó zárolási állapota tárolva van',
    'module_ldap_UserAvatarAttribute' => 'attribútum fényképpel',
    'module_ldap_UpdateAttributes' => 'Frissítse a tartomány telefonszámait, amikor megváltoznak a MikoPBX-ben (írási engedély szükséges)',
    'module_ldap_LdapOrganizationalUnit' => 'Felosztás',
    'module_ldap_LdapUserFilter' => 'További felhasználói szűrő',
    'module_ldap_LdapCheckGetListHeader' => 'Teszt az LDAP-felhasználók listájának megszerzéséhez',
    'module_ldap_LdapCheckGetUsersList' => 'A megadott hozzáférési paraméterek és szűrők használatával végrehajtunk egy kérést az LDAP/AD felé, és 20 felhasználóból álló részt kapunk szinkronizálásra.',
    'module_ldap_LdapGetUsersButton' => 'A kérés végrehajtása',
    'module_ldap_user_not_found' => 'A felhasználó nem fér hozzá a tartományhoz, vagy a paraméterek helytelenek.',
    'module_ldap_ValidateServerNameIsEmpty' => 'A tartományvezérlő címe üres',
    'module_ldap_ValidateServerPortIsEmpty' => 'A tartományvezérlő portja nincs tele',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'A domain felhasználó bejelentkezési azonosítója nincs kitöltve',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'A domain felhasználó jelszava nincs kitöltve',
    'module_ldap_ValidateBaseDNIsEmpty' => 'A domain gyökér nincs kitöltve',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'A domainben lévő felhasználónévvel rendelkező attribútum nincs kitöltve',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Az attribútum a felhasználó mobiltelefonjával a domainben nincs kitöltve',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'A felhasználó belső telefonszámát tartalmazó attribútum a domainben nincs kitöltve',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'A domainben lévő felhasználó e-mail-címét tartalmazó attribútum nincs kitöltve',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'A felhasználói tevékenység attribútuma a tartományban nincs kitöltve',
    'module_ldap_LdapManualSyncHeader' => 'Kézi szinkronizálás',
    'module_ldap_LdapManualSyncManual' => 'Ha rákattint a gombra, 20 felhasználó egy része szinkronizálva lesz a megadott tartományvezérlő és a MikoPBX között.',
    'module_ldap_LdapManualSyncButton' => 'Adatok szinkronizálása',
    'module_ldap_usersSyncResult' => 'Állapot',
    'module_ldap_userHadChangesOnTheSide' => 'Frissítve',
    'module_ldap_OnPBXSide' => 'MikoPBX-en belül',
    'module_ldap_OnDomainSide' => 'a domainben',
    'module_ldap_SKIPPED' => 'nem fogadott',
    'module_ldap_UPDATED' => 'feldolgozott',
    'module_ldap_ConflictSide' => 'Aki megtagadta',
    'module_ldap_ConflictsTabHeader' => 'Szinkronizálási ütközések',
    'module_ldap_NoAnyConflicts' => 'Nem található probléma',
    'module_ldap_deleteCurrentConflict' => 'Törölje az aktuális bejegyzést, nem módosítja az adatokat sem az alközpontban, sem az LDAP/AD szerver oldalon',
    'module_ldap_ConflictTime' => 'Dátum',
    'module_ldap_ConflictUserData' => 'Mentett adatok',
    'module_ldap_ConflictErrorMessages' => 'Az elutasítás oka',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'konfliktus',
    'module_ldap_SyncTabHeader' => 'Szinkronizálás és konfliktusok',
    'module_ldap_TabAttributes' => 'Szinkronizálási mezők',
    'module_ldap_DeleteAllConflicts' => 'Törölje az összes ütközést',
];
