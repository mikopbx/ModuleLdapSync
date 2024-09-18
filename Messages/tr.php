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
    'repModuleLdapSync' => 'LDAP/AD ile senkronizasyon - %repesent%',
    'mo_ModuleModuleLdapSync' => 'LDAP/AD ile senkronizasyon',
    'BreadcrumbModuleLdapSync' => 'LDAP/AD ile senkronizasyon',
    'SubHeaderModuleLdapSync' => 'Modül, bir alan adından kullanıcıları yüklemenize olanak tanır',
    'module_ldap_LdapServerConnectionHeader' => 'Etki alanı denetleyicisi bağlantı ayarları',
    'module_ldap_AddServer' => 'Sunucu ekle',
    'module_ldap_AddServerShort' => 'Eklemek',
    'module_ldap_NoAnyServers' => 'Hiçbir sunucu yapılandırılmadı',
    'module_ldap_TableColumnServerName' => 'Sunucu adresi',
    'module_ldap_OrganizationalUnit' => 'Alt bölüm',
    'module_ldap_BaseDN' => 'Etki alanı kökü',
    'module_ldap_ldapType' => 'Sunucu tipi',
    'module_ldap_LdapServerName' => 'Etki alanı denetleyicisi adresi',
    'module_ldap_LdapServerPort' => 'Liman',
    'module_ldap_LdapAdminLogin' => 'Etki alanına okuma/yazma erişimi olan kullanıcı adı ve şifre',
    'module_ldap_LdapBaseDN' => 'Etki alanı kökü',
    'module_ldap_LdapPassword' => 'Şifre',
    'module_ldap_LdapAttributesHeader' => 'MikoPBX\'teki verilerle eşleştirmeye yönelik etki alanındaki özellikler',
    'module_ldap_UserExtensionAttribute' => 'kullanıcı dahili numarası',
    'module_ldap_UserMobileAttribute' => 'cep telefonu',
    'module_ldap_UserEmailAttribute' => 'E-posta adresi',
    'module_ldap_UserNameAttribute' => 'kullanıcının adı ve soyadı',
    'module_ldap_UserAccountControl' => 'kullanıcının kilit durumunun saklandığı özellik',
    'module_ldap_UserAvatarAttribute' => 'fotoğraf özelliği',
    'module_ldap_UpdateAttributes' => 'MikoPBX\'te değiştiklerinde etki alanındaki telefon numaralarını güncelleyin (yazma izinleri gerektirir)',
    'module_ldap_LdapOrganizationalUnit' => 'Alt bölüm',
    'module_ldap_LdapUserFilter' => 'Ek kullanıcı filtresi',
    'module_ldap_LdapCheckGetListHeader' => 'LDAP kullanıcılarının listesini almak için test edin',
    'module_ldap_LdapCheckGetUsersList' => 'Belirtilen erişim parametrelerini ve filtreleri kullanarak LDAP/AD\'ye bir istek uygulayacağız ve senkronizasyon için 20 kullanıcının bir kısmını alacağız',
    'module_ldap_LdapGetUsersButton' => 'İsteği çalıştır',
    'module_ldap_user_not_found' => 'Kullanıcının etki alanına erişimi yok veya belirtilen parametreler yanlış',
    'module_ldap_ValidateServerNameIsEmpty' => 'Etki alanı denetleyicisi adresi doldurulmadı',
    'module_ldap_ValidateServerPortIsEmpty' => 'Etki alanı denetleyicisi bağlantı noktası doldurulmamış',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Etki alanı kullanıcısı için giriş bilgileri doldurulmadı',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Etki alanı kullanıcısı için parola doldurulmadı',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Etki alanı kökü doldurulmadı',
    'module_ldap_LdapManualSyncHeader' => 'Manuel senkronizasyon',
    'module_ldap_LdapManualSyncManual' => 'Butona tıkladığınızda 20 kullanıcının bir kısmı belirtilen domain denetleyicisi ile MikoPBX arasında senkronize edilecektir',
    'module_ldap_LdapManualSyncButton' => 'Verileri senkronize et',
    'module_ldap_usersSyncResult' => 'Durum',
    'module_ldap_userHadChangesOnTheSide' => 'Güncellenmiş',
    'module_ldap_OnPBXSide' => 'MikoPBX\'in içinde',
    'module_ldap_OnDomainSide' => 'etki alanında',
    'module_ldap_SKIPPED' => 'atlandı',
    'module_ldap_UPDATED' => 'işlenmiş',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Alan adındaki kullanıcı adının bulunduğu özellik doldurulmamış',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Kullanıcının cep telefonunun alan adındaki özelliği doldurulmamış',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Alan adındaki kullanıcının dahili telefon numarasını içeren özellik doldurulmamış',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Kullanıcının etki alanındaki e-postasını içeren özellik doldurulmamış',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Alandaki kullanıcı etkinliği özelliğine sahip özellik doldurulmamış',
    'module_ldap_EnableAutoSync' => 'Zamanlanmış senkronizasyonu etkinleştir',
    'module_ldap_TableColumnAutoSync' => 'Otomatik senkronizasyon',
    'module_ldap_deleteCurrentConflict' => 'Geçerli girişi silin, PBX\'teki veya LDAP/AD sunucusu tarafındaki verileri değiştirmez',
    'module_ldap_ConflictsTabHeader' => 'Senkronizasyon çakışmaları',
    'module_ldap_NoAnyConflicts' => 'Hiçbir sorun bulunamadı',
    'module_ldap_ConflictTime' => 'Tarih',
    'module_ldap_ConflictUserData' => 'Kaydedilen veriler',
    'module_ldap_ConflictSide' => 'Kim reddetti',
    'module_ldap_ConflictErrorMessages' => 'Reddetme nedeni',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'anlaşmazlık',
    'module_ldap_SyncTabHeader' => 'Senkronizasyon ve çatışmalar',
    'module_ldap_TabAttributes' => 'Senkronizasyon alanları',
    'module_ldap_DeleteAllConflicts' => 'Tüm çakışmaları temizle',
    'module_ldap_UpdateAttributesMessage' => 'MikoPBX\'te veriler değiştiğinde alanda aşağıdakiler güncellenecektir: dahili numara, cep telefonu numarası, e-posta, avatar, SIP şifresi',
    'module_ldap_UserPasswordAttribute' => 'SIP şifresi',
    'module_ldap_UseTLS' => 'TLS/SSL',
];
