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
    'repModuleLdapSync' => 'Synchronisierung mit LDAP/AD – %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synchronisierung mit LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronisierung mit LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Mit dem Modul können Sie Benutzer aus einer Domäne laden',
    'module_ldap_LdapServerConnectionHeader' => 'Verbindungseinstellungen des Domänencontrollers',
    'module_ldap_AddServer' => 'Server hinzufügen',
    'module_ldap_AddServerShort' => 'Hinzufügen',
    'module_ldap_NoAnyServers' => 'Keine Server konfiguriert',
    'module_ldap_TableColumnServerName' => 'Serveradresse',
    'module_ldap_OrganizationalUnit' => 'Unterteilung',
    'module_ldap_BaseDN' => 'Domänenstamm',
    'module_ldap_ldapType' => 'Server Typ',
    'module_ldap_LdapServerName' => 'Adresse des Domänencontrollers',
    'module_ldap_LdapServerPort' => 'Hafen',
    'module_ldap_LdapAdminLogin' => 'Benutzername und Passwort mit Lese-/Schreibzugriff auf die Domäne',
    'module_ldap_LdapBaseDN' => 'Domänenstamm',
    'module_ldap_LdapPassword' => 'Passwort',
    'module_ldap_LdapAttributesHeader' => 'Attribute in der Domäne zum Abgleich mit Daten in MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'Durchwahlnummer des Benutzers',
    'module_ldap_UserMobileAttribute' => 'Handy',
    'module_ldap_UserEmailAttribute' => 'E-Mail-Addresse',
    'module_ldap_UserNameAttribute' => 'Vor- und Nachname des Benutzers',
    'module_ldap_UserAccountControl' => 'Attribut, in dem der Sperrstatus des Benutzers gespeichert wird',
    'module_ldap_UserAvatarAttribute' => 'Fotoattribut',
    'module_ldap_UpdateAttributes' => 'Telefonnummern in der Domäne aktualisieren, wenn sie sich in MikoPBX ändern (erfordert Schreibrechte)',
    'module_ldap_LdapOrganizationalUnit' => 'Unterteilung',
    'module_ldap_LdapUserFilter' => 'Zusätzlicher Benutzerfilter',
    'module_ldap_LdapCheckGetListHeader' => 'Testen Sie, um eine Liste der LDAP-Benutzer zu erhalten',
    'module_ldap_LdapCheckGetUsersList' => 'Mithilfe der angegebenen Zugriffsparameter und Filter fragen wir LDAP/AD ab und erhalten eine Liste der zu synchronisierenden Benutzer',
    'module_ldap_LdapGetUsersButton' => 'Anforderung ausführen',
    'module_ldap_user_not_found' => 'Der Benutzer hat keinen Zugriff auf die Domäne oder die angegebenen Parameter sind falsch',
    'module_ldap_ValidateServerNameIsEmpty' => 'Die Adresse des Domänencontrollers ist nicht ausgefüllt',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domänencontroller-Port nicht belegt',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Die Anmeldung für den Domänenbenutzer ist nicht ausgefüllt',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Das Passwort für den Domänenbenutzer ist nicht ausgefüllt',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domänenstamm nicht ausgefüllt',
    'module_ldap_LdapManualSyncHeader' => 'Manuelle Synchronisierung',
    'module_ldap_LdapManualSyncManual' => 'Durch Klicken auf die Schaltfläche werden Benutzer zwischen dem angegebenen Domänencontroller und MikoPBX synchronisiert',
    'module_ldap_LdapManualSyncButton' => 'Daten synchronisieren',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Aktualisiert',
    'module_ldap_OnPBXSide' => 'innerhalb von MikoPBX',
    'module_ldap_OnDomainSide' => 'in der Domäne',
    'module_ldap_SKIPPED' => 'übersprungen',
    'module_ldap_UPDATED' => 'verarbeitet',
    'module_ldap_EnableAutoSync' => 'Geplante Synchronisierung aktivieren (stündlich)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Das Attribut mit dem Benutzernamen in der Domäne ist nicht gefüllt',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Das Attribut mit dem Mobiltelefon des Benutzers in der Domain ist nicht gefüllt',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Das Attribut mit der internen Telefonnummer des Benutzers in der Domäne ist nicht gefüllt',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Das Attribut mit der E-Mail-Adresse des Benutzers in der Domäne ist nicht gefüllt',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Das Attribut mit dem Attribut der Benutzeraktivität in der Domäne ist nicht gefüllt',
    'module_ldap_TableColumnAutoSync' => 'Automatische Synchronisation',
];
