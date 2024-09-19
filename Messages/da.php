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
    'repModuleLdapSync' => 'Synkronisering med LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synkronisering med LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synkronisering med LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Modulet giver dig mulighed for at indlæse brugere fra et domæne',
    'module_ldap_LdapServerConnectionHeader' => 'Indstillinger for domænecontrollerforbindelse',
    'module_ldap_AddServer' => 'Tilføj server',
    'module_ldap_AddServerShort' => 'Tilføje',
    'module_ldap_NoAnyServers' => 'Ingen servere konfigureret',
    'module_ldap_TableColumnServerName' => 'Serveradresse',
    'module_ldap_OrganizationalUnit' => 'Underafdeling',
    'module_ldap_BaseDN' => 'Domæne rod',
    'module_ldap_ldapType' => 'Server type',
    'module_ldap_LdapServerName' => 'Domænecontrolleradresse',
    'module_ldap_LdapServerPort' => 'Havn',
    'module_ldap_LdapAdminLogin' => 'Brugernavn og adgangskode med læse/skrive adgang til domænet',
    'module_ldap_LdapBaseDN' => 'Domæne rod',
    'module_ldap_LdapPassword' => 'Adgangskode',
    'module_ldap_LdapAttributesHeader' => 'Attributter i domænet til matchning med data i MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'brugerens lokalnummer',
    'module_ldap_UserMobileAttribute' => 'mobiltelefon',
    'module_ldap_UserEmailAttribute' => 'Email adresse',
    'module_ldap_UserNameAttribute' => 'brugerens for- og efternavn',
    'module_ldap_UserAccountControl' => 'attribut, hvor brugerens låsestatus er gemt',
    'module_ldap_UserAvatarAttribute' => 'foto attribut',
    'module_ldap_UpdateAttributes' => 'Opdater telefonnumre i domænet, når de ændres i MikoPBX (kræver skrivetilladelser)',
    'module_ldap_LdapOrganizationalUnit' => 'Underafdeling',
    'module_ldap_LdapUserFilter' => 'Ekstra brugerfilter',
    'module_ldap_LdapCheckGetListHeader' => 'Test for at få en liste over LDAP-brugere',
    'module_ldap_LdapCheckGetUsersList' => 'Ved at bruge de angivne adgangsparametre og filtre vil vi udføre en anmodning til LDAP/AD og modtage en del på 20 brugere til synkronisering',
    'module_ldap_LdapGetUsersButton' => 'Kør anmodning',
    'module_ldap_user_not_found' => 'Brugeren har ikke adgang til domænet, eller de angivne parametre er forkerte',
    'module_ldap_ValidateServerNameIsEmpty' => 'Domænecontrolleradressen er ikke udfyldt',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domænecontrollerporten er ikke udfyldt',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Login for domænebruger er ikke udfyldt',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Adgangskode ikke udfyldt for domænebruger',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domænerod ikke udfyldt',
    'module_ldap_LdapManualSyncHeader' => 'Manuel synkronisering',
    'module_ldap_LdapManualSyncManual' => 'Når du klikker på knappen, vil en del af 20 brugere blive synkroniseret mellem den angivne domænecontroller og MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synkroniser data',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Opdateret',
    'module_ldap_OnPBXSide' => 'inde i MikoPBX',
    'module_ldap_OnDomainSide' => 'i domænet',
    'module_ldap_SKIPPED' => 'sprunget over',
    'module_ldap_UPDATED' => 'behandlet',
    'module_ldap_EnableAutoSync' => 'Aktiver planlagt synkronisering',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Attributten med brugernavnet i domænet er ikke udfyldt',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Attributten med brugerens mobiltelefon i domænet er ikke udfyldt',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Attributten med det interne telefonnummer på brugeren i domænet er ikke udfyldt',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Attributten med brugerens e-mail i domænet er ikke udfyldt',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Attributten med attributten for brugeraktivitet i domænet er ikke udfyldt',
    'module_ldap_TableColumnAutoSync' => 'Auto-synkronisering',
    'module_ldap_ConflictsTabHeader' => 'Synkroniseringskonflikter',
    'module_ldap_NoAnyConflicts' => 'Ingen problemer fundet',
    'module_ldap_deleteCurrentConflict' => 'Slet den aktuelle post, ændrer ikke dataene hverken i PBX eller på LDAP/AD serversiden',
    'module_ldap_ConflictTime' => 'Dato',
    'module_ldap_ConflictUserData' => 'Gemte data',
    'module_ldap_ConflictSide' => 'Hvem nægtede',
    'module_ldap_ConflictErrorMessages' => 'Årsag til afslag',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'konflikt',
    'module_ldap_SyncTabHeader' => 'Synkronisering og konflikter',
    'module_ldap_TabAttributes' => 'Synkroniseringsfelter',
    'module_ldap_DeleteAllConflicts' => 'Ryd alle konflikter',
    'module_ldap_UserPasswordAttribute' => 'SIP-adgangskode',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'Når data ændres i MikoPBX, vil følgende blive opdateret i domænet: internt nummer, mobilnummer, e-mail, avatar, SIP-adgangskode',
    'module_ldap_UserName' => 'Brugernavn',
    'module_ldap_UserNumber' => 'Lokalnummer',
    'module_ldap_findExtension' => 'Find i listen over brugere',
    'module_ldap_DeletedUsersHeader' => 'Medarbejdere fjernbetjening i LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'Ingen fjernmedarbejdere',
    'module_ldap_UserEmail' => 'E-mail',
];
