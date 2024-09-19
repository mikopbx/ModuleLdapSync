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
    'repModuleLdapSync' => 'LDAP/AD との同期 - %repesent%',
    'mo_ModuleModuleLdapSync' => 'LDAP/ADとの同期',
    'BreadcrumbModuleLdapSync' => 'LDAP/ADとの同期',
    'SubHeaderModuleLdapSync' => 'このモジュールを使用すると、ドメインからユーザーをロードできます',
    'module_ldap_LdapServerConnectionHeader' => 'ドメインコントローラーの接続設定',
    'module_ldap_AddServer' => 'サーバーの追加',
    'module_ldap_AddServerShort' => '追加',
    'module_ldap_NoAnyServers' => 'サーバーが構成されていません',
    'module_ldap_TableColumnServerName' => 'サーバーアドレス',
    'module_ldap_OrganizationalUnit' => '区画',
    'module_ldap_BaseDN' => 'ドメインルート',
    'module_ldap_ldapType' => 'サーバーの種類',
    'module_ldap_LdapServerName' => 'ドメインコントローラーアドレス',
    'module_ldap_LdapServerPort' => 'ポート',
    'module_ldap_LdapAdminLogin' => 'ドメインへの読み取り/書き込みアクセス権を持つユーザー名とパスワード',
    'module_ldap_LdapBaseDN' => 'ドメインルート',
    'module_ldap_LdapPassword' => 'パスワード',
    'module_ldap_LdapAttributesHeader' => 'MikoPBX のデータと照合するためのドメインの属性',
    'module_ldap_UserExtensionAttribute' => 'ユーザー内線番号',
    'module_ldap_UserMobileAttribute' => '携帯電話',
    'module_ldap_UserEmailAttribute' => '電子メールアドレス',
    'module_ldap_UserNameAttribute' => 'ユーザーの姓名',
    'module_ldap_UserAccountControl' => 'ユーザーのロック状態が保存される属性',
    'module_ldap_UserAvatarAttribute' => '写真の属性',
    'module_ldap_UpdateAttributes' => 'MikoPBX で電話番号が変更されたときにドメイン内の電話番号を更新します (書き込み権限が必要です)',
    'module_ldap_LdapOrganizationalUnit' => '区画',
    'module_ldap_LdapUserFilter' => '追加のユーザーフィルター',
    'module_ldap_LdapCheckGetListHeader' => 'LDAP ユーザーのリストを取得するテスト',
    'module_ldap_LdapCheckGetUsersList' => '指定されたアクセス パラメーターとフィルターを使用して、LDAP/AD へのリクエストを実行し、同期のために 20 ユーザーの一部を受信します。',
    'module_ldap_LdapGetUsersButton' => 'リクエストの実行',
    'module_ldap_user_not_found' => 'ユーザーがドメインにアクセスできないか、指定されたパラメータが正しくありません',
    'module_ldap_ValidateServerNameIsEmpty' => 'ドメインコントローラーアドレスが入力されていません',
    'module_ldap_ValidateServerPortIsEmpty' => 'ドメイン コントローラー ポートが設定されていません',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'ドメインユーザーのログイン情報が入力されていません',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'ドメインユーザーのパスワードが入力されていません',
    'module_ldap_ValidateBaseDNIsEmpty' => 'ドメインルートが入力されていません',
    'module_ldap_LdapManualSyncHeader' => '手動同期',
    'module_ldap_LdapManualSyncManual' => 'ボタンをクリックすると、指定したドメイン コントローラーと MikoPBX の間で 20 ユーザーの一部が同期されます。',
    'module_ldap_LdapManualSyncButton' => 'データを同期する',
    'module_ldap_usersSyncResult' => '状態',
    'module_ldap_userHadChangesOnTheSide' => '更新しました',
    'module_ldap_OnPBXSide' => 'ミコPBX内',
    'module_ldap_OnDomainSide' => 'ドメイン内で',
    'module_ldap_SKIPPED' => 'スキップしました',
    'module_ldap_UPDATED' => '処理された',
    'module_ldap_EnableAutoSync' => 'スケジュールされた同期を有効にする',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'ドメイン内のユーザー名の属性が入力されていません',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'ドメイン内のユーザーの携帯電話の属性が入力されていません',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'ドメイン内のユーザーの内部電話番号を含む属性が入力されていません',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'ドメイン内のユーザーの電子メールの属性が入力されていません',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'ドメイン内のユーザーアクティビティの属性を持つ属性が入力されていません',
    'module_ldap_TableColumnAutoSync' => '自動同期',
    'module_ldap_ConflictsTabHeader' => '同期の競合',
    'module_ldap_NoAnyConflicts' => '問題は見つかりませんでした',
    'module_ldap_ConflictTime' => '日付',
    'module_ldap_deleteCurrentConflict' => '現在のエントリを削除します。PBX または LDAP/AD サーバー側のデータは変更されません。',
    'module_ldap_ConflictUserData' => 'セーブデータ',
    'module_ldap_ConflictSide' => '誰が断ったのか',
    'module_ldap_ConflictErrorMessages' => '拒否理由',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => '対立',
    'module_ldap_SyncTabHeader' => '同期と競合',
    'module_ldap_TabAttributes' => '同期フィールド',
    'module_ldap_DeleteAllConflicts' => 'すべての競合をクリアする',
    'module_ldap_UserPasswordAttribute' => 'SIPパスワード',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'MikoPBX でデータが変更されると、ドメイン内で内部番号、携帯電話番号、電子メール、アバター、SIP パスワードが更新されます。',
    'module_ldap_UserName' => 'ユーザー名',
    'module_ldap_UserNumber' => '内線番号',
    'module_ldap_findExtension' => 'ユーザーのリストから検索',
    'module_ldap_DeletedUsersHeader' => 'LDAP/AD でリモートにいる従業員',
    'module_ldap_DeletedUsersEmpty' => 'リモート従業員はいない',
    'module_ldap_UserEmail' => '電子メール',
];
