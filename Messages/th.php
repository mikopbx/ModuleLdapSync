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
    'repModuleLdapSync' => 'การซิงโครไนซ์กับ LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'การซิงโครไนซ์กับ LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'การซิงโครไนซ์กับ LDAP/AD',
    'SubHeaderModuleLdapSync' => 'โมดูลนี้ช่วยให้คุณสามารถโหลดผู้ใช้จากโดเมนได้',
    'module_ldap_LdapServerConnectionHeader' => 'การตั้งค่าการเชื่อมต่อกับตัวควบคุมโดเมน',
    'module_ldap_EnableAutoSync' => 'เปิดใช้งานการซิงโครไนซ์ตามกำหนดเวลา',
    'module_ldap_AddServer' => 'เพิ่มเซิร์ฟเวอร์',
    'module_ldap_AddServerShort' => 'เพิ่ม',
    'module_ldap_NoAnyServers' => 'ไม่มีการกำหนดค่าเซิร์ฟเวอร์',
    'module_ldap_TableColumnAutoSync' => 'ซิงค์อัตโนมัติ',
    'module_ldap_TableColumnServerName' => 'ที่อยู่เซิฟเวอร์',
    'module_ldap_OrganizationalUnit' => 'แผนกย่อย',
    'module_ldap_BaseDN' => 'รูทโดเมน',
    'module_ldap_ldapType' => 'ประเภทเซิร์ฟเวอร์',
    'module_ldap_LdapServerName' => 'ที่อยู่ตัวควบคุมโดเมน',
    'module_ldap_LdapServerPort' => 'ท่าเรือ',
    'module_ldap_LdapAdminLogin' => 'ชื่อผู้ใช้และรหัสผ่านพร้อมสิทธิ์ในการอ่านและเขียนบนโดเมน',
    'module_ldap_LdapBaseDN' => 'รูทโดเมน',
    'module_ldap_LdapPassword' => 'รหัสผ่าน',
    'module_ldap_LdapAttributesHeader' => 'คุณสมบัติในโดเมนสำหรับการจับคู่กับข้อมูลใน MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'หมายเลขส่วนขยายผู้ใช้',
    'module_ldap_UserMobileAttribute' => 'โทรศัพท์มือถือ',
    'module_ldap_UserEmailAttribute' => 'ที่อยู่อีเมล',
    'module_ldap_UserNameAttribute' => 'ชื่อและนามสกุลของผู้ใช้',
    'module_ldap_UserAccountControl' => 'คุณลักษณะที่จัดเก็บสถานะการล็อคของผู้ใช้',
    'module_ldap_UserAvatarAttribute' => 'คุณลักษณะที่มีรูปถ่าย',
    'module_ldap_UpdateAttributes' => 'อัปเดตหมายเลขโทรศัพท์ในโดเมนเมื่อมีการเปลี่ยนแปลงใน MikoPBX (ต้องมีสิทธิ์ในการเขียน)',
    'module_ldap_LdapOrganizationalUnit' => 'แผนกย่อย',
    'module_ldap_LdapUserFilter' => 'ตัวกรองผู้ใช้เพิ่มเติม',
    'module_ldap_LdapCheckGetListHeader' => 'ทดสอบการรับรายชื่อผู้ใช้ LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'เมื่อใช้พารามิเตอร์การเข้าถึงและตัวกรองที่ระบุ เราจะดำเนินการคำขอไปยัง LDAP/AD และรับผู้ใช้ส่วนหนึ่ง 20 รายสำหรับการซิงโครไนซ์',
    'module_ldap_LdapGetUsersButton' => 'ดำเนินการตามคำขอ',
    'module_ldap_user_not_found' => 'ผู้ใช้ไม่มีสิทธิ์เข้าถึงโดเมนหรือพารามิเตอร์ไม่ถูกต้อง',
    'module_ldap_ValidateServerNameIsEmpty' => 'ที่อยู่ตัวควบคุมโดเมนว่างเปล่า',
    'module_ldap_ValidateServerPortIsEmpty' => 'พอร์ตตัวควบคุมโดเมนไม่เต็ม',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'ไม่ได้กรอกข้อมูลเข้าสู่ระบบสำหรับผู้ใช้โดเมน',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'ไม่ได้กรอกรหัสผ่านสำหรับผู้ใช้โดเมน',
    'module_ldap_ValidateBaseDNIsEmpty' => 'ไม่ได้กรอกรากโดเมน',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'ไม่ได้กรอกแอตทริบิวต์ที่มีชื่อผู้ใช้ในโดเมน',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'ไม่ได้กรอกแอตทริบิวต์ที่มีโทรศัพท์มือถือของผู้ใช้ในโดเมน',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'ไม่ได้กรอกแอตทริบิวต์ที่มีหมายเลขโทรศัพท์ภายในของผู้ใช้ในโดเมน',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'ไม่ได้กรอกแอตทริบิวต์ที่มีอีเมลของผู้ใช้ในโดเมน',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'ไม่ได้กรอกแอตทริบิวต์ที่มีแอตทริบิวต์กิจกรรมผู้ใช้ในโดเมน',
    'module_ldap_LdapManualSyncHeader' => 'การซิงโครไนซ์ด้วยตนเอง',
    'module_ldap_LdapManualSyncManual' => 'เมื่อคุณคลิกปุ่ม ผู้ใช้ส่วนหนึ่ง 20 คนจะถูกซิงโครไนซ์ระหว่างตัวควบคุมโดเมนที่ระบุและ MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'ประสานข้อมูล',
    'module_ldap_usersSyncResult' => 'สถานะ',
    'module_ldap_userHadChangesOnTheSide' => 'อัปเดตแล้ว',
    'module_ldap_OnPBXSide' => 'ภายใน MikoPBX',
    'module_ldap_OnDomainSide' => 'ในโดเมน',
    'module_ldap_SKIPPED' => 'พลาด',
    'module_ldap_UPDATED' => 'ประมวลผล',
    'module_ldap_ConflictsTabHeader' => 'ข้อขัดแย้งในการซิงโครไนซ์',
    'module_ldap_NoAnyConflicts' => 'ไม่พบปัญหา',
    'module_ldap_ConflictUserData' => 'ข้อมูลที่บันทึกไว้',
    'module_ldap_deleteCurrentConflict' => 'ลบรายการปัจจุบัน ไม่เปลี่ยนแปลงข้อมูลใน PBX หรือบนฝั่งเซิร์ฟเวอร์ LDAP/AD',
    'module_ldap_ConflictTime' => 'วันที่',
    'module_ldap_ConflictSide' => 'ใครปฏิเสธ',
    'module_ldap_ConflictErrorMessages' => 'เหตุผลในการปฏิเสธ',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'ตู้สาขา',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'แอลดีเอพี/โฆษณา',
    'module_ldap_CONFLICT' => 'ขัดแย้ง',
    'module_ldap_SyncTabHeader' => 'การซิงโครไนซ์และความขัดแย้ง',
    'module_ldap_TabAttributes' => 'ฟิลด์การซิงโครไนซ์',
    'module_ldap_DeleteAllConflicts' => 'เคลียร์ข้อขัดแย้งทั้งหมด',
];
