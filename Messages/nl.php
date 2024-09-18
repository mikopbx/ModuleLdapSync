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
    'repModuleLdapSync' => 'Synchronisatie met LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synchronisatie met LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronisatie met LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Met de module kunt u gebruikers vanuit een domein laden',
    'module_ldap_LdapServerConnectionHeader' => 'Verbindingsinstellingen voor domeincontroller',
    'module_ldap_AddServer' => 'Server toevoegen',
    'module_ldap_AddServerShort' => 'Toevoegen',
    'module_ldap_NoAnyServers' => 'Geen servers geconfigureerd',
    'module_ldap_TableColumnServerName' => 'Server adres',
    'module_ldap_OrganizationalUnit' => 'Onderverdeling',
    'module_ldap_BaseDN' => 'Domeinhoofdmap',
    'module_ldap_ldapType' => 'Server type',
    'module_ldap_LdapServerName' => 'Domeincontrolleradres',
    'module_ldap_LdapServerPort' => 'Haven',
    'module_ldap_LdapAdminLogin' => 'Gebruikersnaam en wachtwoord met lees-/schrijftoegang tot het domein',
    'module_ldap_LdapBaseDN' => 'Domeinhoofdmap',
    'module_ldap_LdapPassword' => 'Wachtwoord',
    'module_ldap_LdapAttributesHeader' => 'Attributen in het domein voor matching met gegevens in MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'gebruikersextensienummer',
    'module_ldap_UserMobileAttribute' => 'mobiele telefoon',
    'module_ldap_UserEmailAttribute' => 'E-mailadres',
    'module_ldap_UserNameAttribute' => 'voor- en achternaam van de gebruiker',
    'module_ldap_UserAccountControl' => 'attribuut waar de vergrendelingsstatus van de gebruiker wordt opgeslagen',
    'module_ldap_UserAvatarAttribute' => 'foto attribuut',
    'module_ldap_UpdateAttributes' => 'Update telefoonnummers in het domein wanneer ze veranderen in MikoPBX (vereist schrijfrechten)',
    'module_ldap_LdapOrganizationalUnit' => 'Onderverdeling',
    'module_ldap_LdapUserFilter' => 'Extra gebruikersfilter',
    'module_ldap_LdapCheckGetListHeader' => 'Test om een lijst met LDAP-gebruikers op te halen',
    'module_ldap_LdapCheckGetUsersList' => 'Met behulp van de opgegeven toegangsparameters en filters voeren we een verzoek uit naar LDAP/AD en ontvangen we een gedeelte van 20 gebruikers voor synchronisatie',
    'module_ldap_LdapGetUsersButton' => 'Aanvraag uitvoeren',
    'module_ldap_user_not_found' => 'De gebruiker heeft geen toegang tot het domein, of de opgegeven parameters zijn onjuist',
    'module_ldap_ValidateServerNameIsEmpty' => 'Domeincontrolleradres niet ingevuld',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domeincontrollerpoort niet gevuld',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Login voor domeingebruiker is niet ingevuld',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Wachtwoord niet ingevuld voor domeingebruiker',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domeinhoofdmap niet gevuld',
    'module_ldap_LdapManualSyncHeader' => 'Handmatige synchronisatie',
    'module_ldap_LdapManualSyncManual' => 'Wanneer u op de knop klikt, wordt een gedeelte van 20 gebruikers gesynchroniseerd tussen de opgegeven domeincontroller en MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synchroniseer gegevens',
    'module_ldap_usersSyncResult' => 'Toestand',
    'module_ldap_userHadChangesOnTheSide' => 'Bijgewerkt',
    'module_ldap_OnPBXSide' => 'binnen MikoPBX',
    'module_ldap_OnDomainSide' => 'in het domein',
    'module_ldap_SKIPPED' => 'overgeslagen',
    'module_ldap_UPDATED' => 'verwerkt',
    'module_ldap_EnableAutoSync' => 'Schakel geplande synchronisatie in',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Het attribuut met de gebruikersnaam in het domein is niet gevuld',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Het attribuut met de mobiele telefoon van de gebruiker in het domein is niet gevuld',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Het attribuut met het interne telefoonnummer van de gebruiker in het domein is niet gevuld',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Het attribuut met het e-mailadres van de gebruiker in het domein is niet gevuld',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Het attribuut met het attribuut van gebruikersactiviteit in het domein is niet gevuld',
    'module_ldap_TableColumnAutoSync' => 'Automatisch synchroniseren',
    'module_ldap_ConflictErrorMessages' => 'Reden voor weigering',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'Telefooncentrale',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_ConflictsTabHeader' => 'Synchronisatieconflicten',
    'module_ldap_NoAnyConflicts' => 'Geen problemen gevonden',
    'module_ldap_deleteCurrentConflict' => 'Als u de huidige invoer verwijdert, worden de gegevens in de PBX of op de LDAP/AD-server niet gewijzigd',
    'module_ldap_ConflictTime' => 'Datum',
    'module_ldap_ConflictUserData' => 'Opgeslagen gegevens',
    'module_ldap_ConflictSide' => 'Wie weigerde',
    'module_ldap_DeleteAllConflicts' => 'Wis alle conflicten',
    'module_ldap_CONFLICT' => 'conflict',
    'module_ldap_SyncTabHeader' => 'Synchronisatie en conflicten',
    'module_ldap_TabAttributes' => 'Synchronisatievelden',
    'module_ldap_UserPasswordAttribute' => 'SIP-wachtwoord',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'Wanneer gegevens in MikoPBX veranderen, wordt in het domein het volgende bijgewerkt: intern nummer, mobiel nummer, e-mail, avatar, SIP-wachtwoord',
];
