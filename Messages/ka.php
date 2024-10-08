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
    'repModuleLdapSync' => 'სინქრონიზაცია LDAP/AD-თან - %repesent%',
    'mo_ModuleModuleLdapSync' => 'სინქრონიზაცია LDAP/AD-თან',
    'BreadcrumbModuleLdapSync' => 'სინქრონიზაცია LDAP/AD-თან',
    'SubHeaderModuleLdapSync' => 'მოდული საშუალებას გაძლევთ ატვირთოთ მომხმარებლები დომენიდან',
    'module_ldap_LdapServerConnectionHeader' => 'დომენის კონტროლერის კავშირის პარამეტრები',
    'module_ldap_AddServer' => 'სერვერის დამატება',
    'module_ldap_AddServerShort' => 'დამატება',
    'module_ldap_NoAnyServers' => 'სერვერები არ არის კონფიგურირებული',
    'module_ldap_TableColumnServerName' => 'Სერვერის მისამართი',
    'module_ldap_OrganizationalUnit' => 'ქვედანაყოფი',
    'module_ldap_BaseDN' => 'დომენის ფესვი',
    'module_ldap_ldapType' => 'სერვერის ტიპი',
    'module_ldap_LdapServerName' => 'დომენის კონტროლერის მისამართი',
    'module_ldap_LdapServerPort' => 'პორტი',
    'module_ldap_LdapAdminLogin' => 'მომხმარებლის სახელი და პაროლი დომენზე წაკითხვის/ჩაწერის წვდომით',
    'module_ldap_LdapBaseDN' => 'დომენის ფესვი',
    'module_ldap_LdapPassword' => 'პაროლი',
    'module_ldap_LdapAttributesHeader' => 'ატრიბუტები დომენში MikoPBX-ის მონაცემებთან შესატყვისი',
    'module_ldap_UserExtensionAttribute' => 'მომხმარებლის გაფართოების ნომერი',
    'module_ldap_UserMobileAttribute' => 'მობილური ტელეფონი',
    'module_ldap_UserEmailAttribute' => 'Ელექტრონული მისამართი',
    'module_ldap_UserNameAttribute' => 'მომხმარებლის სახელი და გვარი',
    'module_ldap_UserAccountControl' => 'ატრიბუტი, სადაც ინახება მომხმარებლის დაბლოკვის სტატუსი',
    'module_ldap_UserAvatarAttribute' => 'ფოტო ატრიბუტი',
    'module_ldap_UpdateAttributes' => 'განაახლეთ ტელეფონის ნომრები დომენში, როდესაც ისინი იცვლება MikoPBX-ში (მოითხოვს ჩაწერის ნებართვას)',
    'module_ldap_LdapOrganizationalUnit' => 'ქვედანაყოფი',
    'module_ldap_LdapUserFilter' => 'მომხმარებლის დამატებითი ფილტრი',
    'module_ldap_LdapCheckGetListHeader' => 'ტესტი LDAP მომხმარებლების სიის მისაღებად',
    'module_ldap_LdapCheckGetUsersList' => 'მითითებული წვდომის პარამეტრებისა და ფილტრების გამოყენებით, ჩვენ შევასრულებთ მოთხოვნას LDAP/AD-ზე და მივიღებთ 20 მომხმარებლის ნაწილს სინქრონიზაციისთვის',
    'module_ldap_LdapGetUsersButton' => 'გაუშვით მოთხოვნა',
    'module_ldap_user_not_found' => 'მომხმარებელს არ აქვს წვდომა დომენზე, ან მითითებული პარამეტრები არასწორია',
    'module_ldap_ValidateServerNameIsEmpty' => 'დომენის კონტროლერის მისამართი არ არის შევსებული',
    'module_ldap_ValidateServerPortIsEmpty' => 'დომენის კონტროლერის პორტი არ არის დასახლებული',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'დომენის მომხმარებლის შესვლა არ არის შევსებული',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'პაროლი არ არის შევსებული დომენის მომხმარებლისთვის',
    'module_ldap_ValidateBaseDNIsEmpty' => 'დომენის ფესვი არ არის შევსებული',
    'module_ldap_LdapManualSyncHeader' => 'ხელით სინქრონიზაცია',
    'module_ldap_LdapManualSyncManual' => 'როდესაც დააჭირეთ ღილაკს, 20 მომხმარებლის ნაწილი სინქრონიზებული იქნება მითითებულ დომენის კონტროლერსა და MikoPBX-ს შორის',
    'module_ldap_LdapManualSyncButton' => 'მონაცემთა სინქრონიზაცია',
    'module_ldap_usersSyncResult' => 'სტატუსი',
    'module_ldap_userHadChangesOnTheSide' => 'განახლებულია',
    'module_ldap_OnPBXSide' => 'MikoPBX-ის შიგნით',
    'module_ldap_OnDomainSide' => 'დომენში',
    'module_ldap_SKIPPED' => 'გამოტოვა',
    'module_ldap_UPDATED' => 'დამუშავებული',
    'module_ldap_EnableAutoSync' => 'დაგეგმილი სინქრონიზაციის ჩართვა',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'დომენში მომხმარებლის სახელის მქონე ატრიბუტი არ არის შევსებული',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'დომენში მომხმარებლის შიდა ტელეფონის ნომრის ატრიბუტი არ არის შევსებული',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'დომენში მომხმარებლის ელ. ფოსტით ატრიბუტი არ არის შევსებული',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'დომენში მომხმარებლის აქტივობის ატრიბუტით ატრიბუტი არ არის შევსებული',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'დომენში მომხმარებლის მობილური ტელეფონის ატრიბუტი არ არის შევსებული',
    'module_ldap_TableColumnAutoSync' => 'ავტომატური სინქრონიზაცია',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_ConflictsTabHeader' => 'სინქრონიზაციის კონფლიქტები',
    'module_ldap_NoAnyConflicts' => 'პრობლემები არ მოიძებნა',
    'module_ldap_deleteCurrentConflict' => 'წაშალეთ მიმდინარე ჩანაწერი, არ ცვლის მონაცემებს არც PBX-ში და არც LDAP/AD სერვერის მხარეს',
    'module_ldap_ConflictTime' => 'თარიღი',
    'module_ldap_ConflictUserData' => 'შენახული მონაცემები',
    'module_ldap_ConflictSide' => 'ვინც უარი თქვა',
    'module_ldap_ConflictErrorMessages' => 'უარის მიზეზი',
    'module_ldap_CONFLICT' => 'კონფლიქტი',
    'module_ldap_SyncTabHeader' => 'სინქრონიზაცია და კონფლიქტები',
    'module_ldap_TabAttributes' => 'სინქრონიზაციის ველები',
    'module_ldap_DeleteAllConflicts' => 'გაასუფთავეთ ყველა კონფლიქტი',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'როდესაც მონაცემები იცვლება MikoPBX-ში, შემდეგი განახლდება დომენში: შიდა ნომერი, მობილურის ნომერი, ელფოსტა, ავატარი, SIP პაროლი.',
    'module_ldap_UserPasswordAttribute' => 'SIP პაროლი',
    'module_ldap_UserName' => 'მომხმარებლის სახელი',
    'module_ldap_UserNumber' => 'გაფართოების ნომერი',
    'module_ldap_findExtension' => 'იპოვეთ მომხმარებელთა სიაში',
    'module_ldap_DeletedUsersHeader' => 'თანამშრომლები დისტანციურად LDAP/AD-ში',
    'module_ldap_DeletedUsersEmpty' => 'არ არის დისტანციური თანამშრომლები',
    'module_ldap_UserEmail' => 'ელფოსტა',
];
