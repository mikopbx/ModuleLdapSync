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
    'module_ldap_LdapCheckGetUsersList' => 'Ved at bruge de angivne adgangsparametre og filtre vil vi forespørge LDAP / AD og få en liste over brugere, der skal synkroniseres',
    'module_ldap_LdapGetUsersButton' => 'Kør anmodning',
    'module_ldap_user_not_found' => 'Brugeren har ikke adgang til domænet, eller de angivne parametre er forkerte',
    'module_ldap_ValidateServerNameIsEmpty' => 'Domænecontrolleradressen er ikke udfyldt',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domænecontrollerporten er ikke udfyldt',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Login for domænebruger er ikke udfyldt',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Adgangskode ikke udfyldt for domænebruger',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domænerod ikke udfyldt',
    'module_ldap_LdapManualSyncHeader' => 'Manuel synkronisering',
    'module_ldap_LdapManualSyncManual' => 'Ved at klikke på knappen synkroniseres brugere mellem den angivne domænecontroller og MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synkroniser data',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Opdateret',
    'module_ldap_OnPBXSide' => 'inde i MikoPBX',
    'module_ldap_OnDomainSide' => 'i domænet',
    'module_ldap_SKIPPED' => 'sprunget over',
    'module_ldap_UPDATED' => 'behandlet',
    'module_ldap_EnableAutoSync' => 'Aktiver planlagt synkronisering (hver time)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Attributten med brugernavnet i domænet er ikke udfyldt',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Attributten med brugerens mobiltelefon i domænet er ikke udfyldt',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Attributten med det interne telefonnummer på brugeren i domænet er ikke udfyldt',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Attributten med brugerens e-mail i domænet er ikke udfyldt',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Attributten med attributten for brugeraktivitet i domænet er ikke udfyldt',
];
