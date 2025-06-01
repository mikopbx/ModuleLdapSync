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
    'repModuleLdapSync' => 'Sinkronizacija s LDAP/AD-om - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Sinkronizacija s LDAP/AD-om',
    'BreadcrumbModuleLdapSync' => 'Sinkronizacija s LDAP/AD-om',
    'SubHeaderModuleLdapSync' => 'Modul vam omogućuje učitavanje korisnika iz domene',
    'module_ldap_LdapServerConnectionHeader' => 'Parametri povezivanja kontrolera domene',
    'module_ldap_EnableAutoSync' => 'Omogući zakazanu sinkronizaciju',
    'module_ldap_AddServer' => 'Dodaj poslužitelj',
    'module_ldap_AddServerShort' => 'Dodati',
    'module_ldap_NoAnyServers' => 'Nema konfiguriranih poslužitelja',
    'module_ldap_TableColumnAutoSync' => 'Automatska sinkronizacija',
    'module_ldap_TableColumnServerName' => 'Adresa poslužitelja',
    'module_ldap_OrganizationalUnit' => 'Podjela',
    'module_ldap_BaseDN' => 'Korijen domene',
    'module_ldap_ldapType' => 'Vrsta poslužitelja',
    'module_ldap_LdapServerName' => 'Adresa kontrolera domene',
    'module_ldap_LdapServerPort' => 'Luka',
    'module_ldap_LdapAdminLogin' => 'Korisničko ime i lozinka s dopuštenjima za čitanje i pisanje na domeni',
    'module_ldap_LdapBaseDN' => 'Korijen domene',
    'module_ldap_LdapPassword' => 'Lozinka',
    'module_ldap_LdapAttributesHeader' => 'Atributi u domeni za usklađivanje s podacima u MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'Dodatni broj korisnika',
    'module_ldap_UserMobileAttribute' => 'Mobitel',
    'module_ldap_UserEmailAttribute' => 'E-mail adresa',
    'module_ldap_UserNameAttribute' => 'Ime i prezime korisnika',
    'module_ldap_UserAccountControl' => 'Atribut gdje je pohranjen status blokiranja korisnika',
    'module_ldap_UserAvatarAttribute' => 'Atribut uz fotografiju',
    'module_ldap_UpdateAttributesMessage' => 'Prilikom promjene podataka u MikoPBX-u, u domeni će se ažurirati: interni broj, broj mobitela, email, avatar, SIP lozinka',
    'module_ldap_UpdateAttributes' => 'Ažuriraj podatke u domeni kada se promijene u MikoPBX (zahtijeva dopuštenje za pisanje)',
    'module_ldap_LdapOrganizationalUnit' => 'Podjela',
    'module_ldap_LdapUserFilter' => 'Dodatni korisnički filter',
    'module_ldap_LdapCheckGetListHeader' => 'Test za dobivanje popisa LDAP korisnika',
    'module_ldap_LdapCheckGetUsersList' => 'Koristeći navedene pristupne parametre i filtere, izvršit ćemo zahtjev prema LDAP/AD i primiti dio od 20 korisnika za sinkronizaciju',
    'module_ldap_LdapGetUsersButton' => 'Izvrši zahtjev',
    'module_ldap_user_not_found' => 'Korisnik nema pristup domeni ili su parametri netočni.',
    'module_ldap_ValidateServerNameIsEmpty' => 'Adresa kontrolera domene je prazna',
    'module_ldap_ValidateServerPortIsEmpty' => 'Port kontrolera domene nije pun',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Prijava za korisnika domene nije ispunjena',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Lozinka za korisnika domene nije popunjena',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Korijen domene nije popunjen',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Atribut s korisničkim imenom u domeni nije popunjen',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Atribut s mobitelom korisnika u domeni nije popunjen',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Atribut s internim telefonskim brojem korisnika u domeni nije popunjen',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Atribut s e-poštom korisnika u domeni nije popunjen',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Atribut s atributom aktivnosti korisnika u domeni nije popunjen',
    'module_ldap_LdapManualSyncHeader' => 'Ručna sinkronizacija',
    'module_ldap_LdapManualSyncManual' => 'Kada kliknete gumb, dio od 20 korisnika će se sinkronizirati između navedenog kontrolera domene i MikoPBX-a',
    'module_ldap_LdapManualSyncButton' => 'Sinkronizirajte podatke',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Ažurirano',
    'module_ldap_OnPBXSide' => 'unutar MikoPBX-a',
    'module_ldap_OnDomainSide' => 'u domeni',
    'module_ldap_SKIPPED' => 'propušteno',
    'module_ldap_UPDATED' => 'obrađeno',
    'module_ldap_CONFLICT' => 'sukob',
    'module_ldap_SyncTabHeader' => 'Sinkronizacija i sukobi',
    'module_ldap_ConflictsTabHeader' => 'Konflikti sinkronizacije',
    'module_ldap_TabAttributes' => 'Sinkronizacija polja',
    'module_ldap_NoAnyConflicts' => 'Nema problema',
    'module_ldap_deleteCurrentConflict' => 'Brisanje trenutnog unosa, ne mijenja podatke niti u PBX-u niti na strani LDAP/AD poslužitelja',
    'module_ldap_ConflictTime' => 'Datum',
    'module_ldap_ConflictUserData' => 'Spremljeni podaci',
    'module_ldap_ConflictSide' => 'Tko je odbio',
    'module_ldap_ConflictErrorMessages' => 'Razlog odbijanja',
    'module_ldap_DeleteAllConflicts' => 'Očistite sve sukobe',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_UserPasswordAttribute' => 'SIP lozinka',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UserName' => 'Korisničko ime',
    'module_ldap_UserNumber' => 'Interni broj',
    'module_ldap_UserEmail' => 'E-mail',
    'module_ldap_findExtension' => 'Pronađite na popisu korisnika',
    'module_ldap_DeletedUsersHeader' => 'Zaposlenici onemogućeni u LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'Nema zaposlenika s invaliditetom',
];
