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
    'repModuleLdapSync' => '与 LDAP/AD 同步 - %repesent%',
    'mo_ModuleModuleLdapSync' => '与 LDAP/AD 同步',
    'BreadcrumbModuleLdapSync' => '与 LDAP/AD 同步',
    'SubHeaderModuleLdapSync' => '该模块允许您从域加载用户',
    'module_ldap_LdapServerConnectionHeader' => '域控制器连接设置',
    'module_ldap_AddServer' => '添加服务器',
    'module_ldap_AddServerShort' => '添加',
    'module_ldap_NoAnyServers' => '没有配置服务器',
    'module_ldap_TableColumnServerName' => '服务器地址',
    'module_ldap_OrganizationalUnit' => '细分',
    'module_ldap_BaseDN' => '域根',
    'module_ldap_ldapType' => '服务器类型',
    'module_ldap_LdapServerName' => '域控制器地址',
    'module_ldap_LdapServerPort' => '港口',
    'module_ldap_LdapAdminLogin' => '具有域读/写访问权限的用户名和密码',
    'module_ldap_LdapBaseDN' => '域根',
    'module_ldap_LdapPassword' => '密码',
    'module_ldap_LdapAttributesHeader' => '域中用于与 MikoPBX 中的数据匹配的属性',
    'module_ldap_UserExtensionAttribute' => '用户分机号码',
    'module_ldap_UserMobileAttribute' => '手机',
    'module_ldap_UserEmailAttribute' => '电子邮件地址',
    'module_ldap_UserNameAttribute' => '用户的名字和姓氏',
    'module_ldap_UserAccountControl' => '存储用户锁定状态的属性',
    'module_ldap_UserAvatarAttribute' => '照片属性',
    'module_ldap_UpdateAttributes' => '当 MikoPBX 中的电话号码发生更改时更新域中的电话号码（需要写入权限）',
    'module_ldap_LdapOrganizationalUnit' => '细分',
    'module_ldap_LdapUserFilter' => '附加用户过滤器',
    'module_ldap_LdapCheckGetListHeader' => '测试获取 LDAP 用户列表',
    'module_ldap_LdapCheckGetUsersList' => '使用指定的访问参数和过滤器，我们将执行对 LDAP/AD 的请求并接收 20 个用户中的一部分进行同步',
    'module_ldap_LdapGetUsersButton' => '运行请求',
    'module_ldap_user_not_found' => '用户无权访问该域，或指定的参数不正确',
    'module_ldap_ValidateServerNameIsEmpty' => '域控制器地址未填写',
    'module_ldap_ValidateServerPortIsEmpty' => '域控制器端口未填充',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => '域用户登录名未填写',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => '域用户密码未填写',
    'module_ldap_ValidateBaseDNIsEmpty' => '域根未填充',
    'module_ldap_LdapManualSyncHeader' => '手动同步',
    'module_ldap_LdapManualSyncManual' => '单击该按钮时，将在指定域控制器和 MikoPBX 之间同步 20 个用户中的一部分',
    'module_ldap_LdapManualSyncButton' => '同步数据',
    'module_ldap_usersSyncResult' => '地位',
    'module_ldap_userHadChangesOnTheSide' => '更新',
    'module_ldap_OnPBXSide' => 'MikoPBX 内部',
    'module_ldap_OnDomainSide' => '在域中',
    'module_ldap_SKIPPED' => '跳过',
    'module_ldap_UPDATED' => '处理',
    'module_ldap_EnableAutoSync' => '启用计划同步',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => '域中用户名的属性未填写',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => '域内用户手机的属性未填写',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => '域内用户内部电话号码属性未填写',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => '域中用户电子邮件的属性未填写',
    'module_ldap_ValidateUserAccountControlIsEmpty' => '域内用户活动属性的属性未填写',
    'module_ldap_TableColumnAutoSync' => '自动同步',
    'module_ldap_ConflictsTabHeader' => '同步冲突',
    'module_ldap_NoAnyConflicts' => '没有发现问题',
    'module_ldap_deleteCurrentConflict' => '删除当前条目，不更改 PBX 或 LDAP/AD 服务器端的数据',
    'module_ldap_ConflictTime' => '日期',
    'module_ldap_ConflictUserData' => '已保存的数据',
    'module_ldap_ConflictSide' => '谁拒绝了',
    'module_ldap_ConflictErrorMessages' => '拒绝原因',
    'module_ldap_PBX_UPDATE_CONFLICT' => '集团电话',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => '冲突',
    'module_ldap_SyncTabHeader' => '同步和冲突',
    'module_ldap_TabAttributes' => '同步字段',
    'module_ldap_DeleteAllConflicts' => '清除所有冲突',
    'module_ldap_UserPasswordAttribute' => 'SIP密码',
    'module_ldap_UseTLS' => '传输层安全/SSL',
    'module_ldap_UpdateAttributesMessage' => '当 MikoPBX 中的数据发生变化时，以下内容将在域中更新：内部号码、手机号码、电子邮件、头像、SIP 密码',
    'module_ldap_UserName' => '用户名',
    'module_ldap_UserNumber' => '分机号码',
    'module_ldap_findExtension' => '在用户列表中查找',
    'module_ldap_DeletedUsersHeader' => 'LDAP/AD 中的远程员工',
    'module_ldap_DeletedUsersEmpty' => '没有远程员工',
    'module_ldap_UserEmail' => '电子邮件',
];
