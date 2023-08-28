<?php
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

namespace Modules\ModuleLdapSync\Lib;

class Constants
{
    public const HIDDEN_PASSWORD = 'xxxxxxxx';

    public const USER_NAME_ATTR = 'userNameAttribute';
    public const USER_MOBILE_ATTR = 'userMobileAttribute';
    public const USER_EXTENSION_ATTR = 'userExtensionAttribute';
    public const USER_EMAIL_ATTR = 'userEmailAttribute';
    public const USER_AVATAR_ATTR = 'userAvatarAttribute';
    public const USER_GUID_ATTR = 'ObjectGUID';
    public const USER_ACCOUNT_CONTROL_ATTR = 'userAccountControl';
    public const USER_DISABLED = 'userDisabled';

    public const USER_SYNC_RESULT = 'usersSyncResult';
    public const SYNC_RESULT_UPDATED = 'UPDATED';
    public const SYNC_RESULT_SKIPPED = 'SKIPPED';

    public const USER_HAD_CHANGES_ON = 'userHadChangesOnTheSide';
    public const HAD_CHANGES_ON_PBX = 'OnPBXSide';
    public const HAD_CHANGES_ON_AD = 'OnDomainSide';


}