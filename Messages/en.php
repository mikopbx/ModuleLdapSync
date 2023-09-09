<?php
return [
    'mo_ModuleModuleLdapSync' => 'Synchronization with LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronization with LDAP/AD',
    'module_ldap_LdapServerConnectionHeader' => 'Domain controller connection settings',
    'module_ldap_TableColumnServerName' => 'Server address',
    'module_ldap_OrganizationalUnit' => 'Subdivision',
    'module_ldap_UserNameAttribute' => 'user\'s first and last name',
    'module_ldap_UserAccountControl' => 'attribute where the user\'s lock status is stored',
    'module_ldap_LdapGetUsersButton' => 'Run request',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_UPDATED' => 'processed',
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
    'repModuleLdapSync' => 'Synchronization with LDAP/AD - %repesent%',
    'SubHeaderModuleLdapSync' => 'The module allows you to load users from a domain',
    'module_ldap_AddServer' => 'Add server',
    'module_ldap_AddServerShort' => 'Add',
    'module_ldap_NoAnyServers' => 'No servers configured',
    'module_ldap_BaseDN' => 'Domain root',
    'module_ldap_ldapType' => 'Server type',
    'module_ldap_LdapServerName' => 'Domain controller address',
    'module_ldap_LdapServerPort' => 'Port',
    'module_ldap_LdapAdminLogin' => 'Username and password with read/write access to the domain',
    'module_ldap_LdapBaseDN' => 'Domain root',
    'module_ldap_LdapPassword' => 'Password',
    'module_ldap_LdapAttributesHeader' => 'Attributes in the domain for matching with data in MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'user extension number',
    'module_ldap_UserMobileAttribute' => 'mobile phone',
    'module_ldap_UserEmailAttribute' => 'E-mail address',
    'module_ldap_UserAvatarAttribute' => 'photo attribute',
    'module_ldap_UpdateAttributes' => 'Update phone numbers in the domain when they change in MikoPBX (requires write permissions)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdivision',
    'module_ldap_LdapUserFilter' => 'Additional user filter',
    'module_ldap_LdapCheckGetListHeader' => 'Test to get list of LDAP users',
    'module_ldap_LdapCheckGetUsersList' => 'Using the specified access parameters and filters, we will query LDAP / AD and get a list of users to synchronize',
    'module_ldap_user_not_found' => 'The user does not have access to the domain, or the parameters specified are incorrect',
    'module_ldap_ValidateServerNameIsEmpty' => 'Domain controller address not filled',
    'module_ldap_ValidateServerPortIsEmpty' => 'Domain controller port not populated',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Login for domain user is not filled',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Password not filled for domain user',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Domain root not filled',
    'module_ldap_LdapManualSyncHeader' => 'Manual sync',
    'module_ldap_LdapManualSyncManual' => 'Clicking the button will synchronize users between the specified domain controller and MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synchronize data',
    'module_ldap_userHadChangesOnTheSide' => 'Updated',
    'module_ldap_OnPBXSide' => 'inside MikoPBX',
    'module_ldap_OnDomainSide' => 'in the domain',
    'module_ldap_SKIPPED' => 'skipped',
    'module_ldap_EnableAutoSync' => 'Enable scheduled synchronization (every hour)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'The attribute with the username in the domain is not filled',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'The attribute with the user\'s mobile phone in the domain is not filled',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'The attribute with the internal phone number of the user in the domain is not filled',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'The attribute with the user\'s e-mail in the domain is not filled',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'The attribute with the attribute of user activity in the domain is not filled',
    'module_ldap_TableColumnAutoSync' => 'Auto-sync',
];
