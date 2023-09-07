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
    'SubHeaderModuleLdapSync' => 'Modulen låter dig ladda användare från en domän',
    'module_ldap_LdapServerConnectionHeader' => 'Domänkontrollantens anslutningsinställningar',
    'module_ldap_AddServer' => 'Lägg till server',
    'module_ldap_AddServerShort' => 'Lägg till',
    'module_ldap_NoAnyServers' => 'Inga servrar konfigurerade',
    'module_ldap_TableColumnServerName' => 'Server adress',
    'module_ldap_OrganizationalUnit' => 'Indelning',
    'module_ldap_BaseDN' => 'Domänrot',
    'module_ldap_ldapType' => 'Servertyp',
    'module_ldap_LdapServerName' => 'Domänkontrollantadress',
    'module_ldap_LdapServerPort' => 'Hamn',
    'module_ldap_LdapAdminLogin' => 'Användarnamn och lösenord med läs/skrivbehörighet till domänen',
    'module_ldap_LdapBaseDN' => 'Domänrot',
    'module_ldap_LdapPassword' => 'Lösenord',
    'module_ldap_LdapAttributesHeader' => 'Attribut i domänen för matchning med data i MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'användarens anknytningsnummer',
    'module_ldap_UserMobileAttribute' => 'mobiltelefon',
    'module_ldap_UserEmailAttribute' => 'E-postadress',
    'module_ldap_UserNameAttribute' => 'användarens för- och efternamn',
    'module_ldap_UserAccountControl' => 'attribut där användarens låsstatus lagras',
    'module_ldap_UserAvatarAttribute' => 'fotoattribut',
    'module_ldap_UpdateAttributes' => 'Uppdatera telefonnummer i domänen när de ändras i MikoPBX (kräver skrivbehörighet)',
    'module_ldap_LdapOrganizationalUnit' => 'Indelning',
    'module_ldap_LdapUserFilter' => 'Ytterligare användarfilter',
    'module_ldap_LdapCheckGetListHeader' => 'Testa för att få lista över LDAP-användare',
    'module_ldap_LdapCheckGetUsersList' => 'Med hjälp av de angivna åtkomstparametrarna och filtren kommer vi att fråga LDAP / AD och få en lista över användare att synkronisera',
    'module_ldap_LdapGetUsersButton' => 'Kör begäran',
    'module_ldap_user_not_found' => 'Användaren har inte åtkomst till domänen eller så är de angivna parametrarna felaktiga',
    'module_ldap_ValidateServerNameIsEmpty' => 'Domänkontrollantens adress är inte ifylld',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domänkontrollantporten är inte ifylld',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Inloggning för domänanvändare är inte ifylld',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Lösenordet är inte ifyllt för domänanvändaren',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domänroten är inte ifylld',
    'module_ldap_LdapManualSyncHeader' => 'Manuell synkronisering',
    'module_ldap_LdapManualSyncManual' => 'Genom att klicka på knappen synkroniseras användare mellan den angivna domänkontrollanten och MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synkronisera data',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Uppdaterad',
    'module_ldap_OnPBXSide' => 'inuti MikoPBX',
    'module_ldap_OnDomainSide' => 'i domänen',
    'module_ldap_SKIPPED' => 'hoppat över',
    'module_ldap_UPDATED' => 'bearbetas',
    'module_ldap_EnableAutoSync' => 'Aktivera schemalagd synkronisering (varje timme)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Attributet med användarnamnet i domänen är inte ifyllt',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Attributet med användarens mobiltelefon i domänen är inte ifyllt',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Attributet med användarens interna telefonnummer i domänen är inte ifyllt',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Attributet med användarens e-post i domänen är inte ifyllt',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Attributet med attributet för användaraktivitet i domänen är inte ifyllt',
];
