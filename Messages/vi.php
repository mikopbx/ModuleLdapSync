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
    'repModuleLdapSync' => 'Đồng bộ hóa với LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Đồng bộ hóa với LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Đồng bộ hóa với LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Mô-đun này cho phép bạn tải người dùng từ một miền',
    'module_ldap_LdapServerConnectionHeader' => 'Cài đặt kết nối bộ điều khiển miền',
    'module_ldap_AddServer' => 'Thêm máy chủ',
    'module_ldap_AddServerShort' => 'Thêm vào',
    'module_ldap_NoAnyServers' => 'Không có máy chủ nào được định cấu hình',
    'module_ldap_TableColumnServerName' => 'Địa chỉ máy chủ',
    'module_ldap_OrganizationalUnit' => 'Phân khu',
    'module_ldap_BaseDN' => 'Tên miền gốc',
    'module_ldap_ldapType' => 'Loại máy chủ',
    'module_ldap_LdapServerName' => 'Địa chỉ bộ điều khiển miền',
    'module_ldap_LdapServerPort' => 'Hải cảng',
    'module_ldap_LdapAdminLogin' => 'Tên người dùng và mật khẩu có quyền truy cập đọc/ghi vào miền',
    'module_ldap_LdapBaseDN' => 'Tên miền gốc',
    'module_ldap_LdapPassword' => 'Mật khẩu',
    'module_ldap_LdapAttributesHeader' => 'Các thuộc tính trong miền để khớp với dữ liệu trong MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'số máy nhánh người dùng',
    'module_ldap_UserMobileAttribute' => 'điện thoại di động',
    'module_ldap_UserEmailAttribute' => 'Địa chỉ email',
    'module_ldap_UserNameAttribute' => 'họ và tên người dùng',
    'module_ldap_UserAccountControl' => 'thuộc tính nơi lưu trữ trạng thái khóa của người dùng',
    'module_ldap_UserAvatarAttribute' => 'thuộc tính ảnh',
    'module_ldap_UpdateAttributes' => 'Cập nhật số điện thoại trong miền khi chúng thay đổi trong MikoPBX (yêu cầu quyền ghi)',
    'module_ldap_LdapOrganizationalUnit' => 'Phân khu',
    'module_ldap_LdapUserFilter' => 'Bộ lọc người dùng bổ sung',
    'module_ldap_LdapCheckGetListHeader' => 'Kiểm tra để lấy danh sách người dùng LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Sử dụng các tham số và bộ lọc truy cập được chỉ định, chúng tôi sẽ truy vấn LDAP/AD và lấy danh sách người dùng để đồng bộ hóa',
    'module_ldap_LdapGetUsersButton' => 'Chạy yêu cầu',
    'module_ldap_user_not_found' => 'Người dùng không có quyền truy cập vào miền hoặc các tham số được chỉ định không chính xác',
    'module_ldap_ValidateServerNameIsEmpty' => 'Địa chỉ bộ điều khiển miền không được điền',
    'module_ldap_ValidateServerPortIsEmpty' => 'Cổng điều khiển miền không được điền',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Đăng nhập cho người dùng tên miền không được điền',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Mật khẩu không được điền cho người dùng tên miền',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Gốc tên miền không được lấp đầy',
    'module_ldap_LdapManualSyncHeader' => 'Đồng bộ hóa thủ công',
    'module_ldap_LdapManualSyncManual' => 'Nhấp vào nút sẽ đồng bộ hóa người dùng giữa bộ điều khiển miền được chỉ định và MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Đồng bộ hóa dữ liệu',
    'module_ldap_usersSyncResult' => 'Trạng thái',
    'module_ldap_userHadChangesOnTheSide' => 'Đã cập nhật',
    'module_ldap_OnPBXSide' => 'bên trong MikoPBX',
    'module_ldap_OnDomainSide' => 'trong miền',
    'module_ldap_SKIPPED' => 'bỏ qua',
    'module_ldap_UPDATED' => 'xử lý',
    'module_ldap_EnableAutoSync' => 'Bật đồng bộ hóa theo lịch trình (mỗi giờ)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Thuộc tính có tên người dùng trong miền không được điền',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Thuộc tính có số điện thoại di động của người dùng trong miền không được điền',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Thuộc tính có số điện thoại nội bộ của người dùng trong miền không được điền',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Thuộc tính có e-mail của người dùng trong miền không được điền',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Thuộc tính có thuộc tính hoạt động của người dùng trong miền không được điền',
];
