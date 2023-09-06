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

/* global globalRootUrl, globalTranslate, Form, PbxApi */

/**
 * ModuleLdapSyncModify
 *
 * This object handles the functionality of synchronizing LDAP users and
 * other related features.
 */
const ModuleLdapSyncIndex = {
    $autoSyncStatuses:$('.checkbox.server-sync-status'),
    initialize(){
        // Enable/disable server checkbox handlers
        ModuleLdapSyncIndex.$autoSyncStatuses
            .checkbox({
                onChecked() {
                    const id = $(this).closest('tr').attr('id');
                    $.api({
                        url: `${globalRootUrl}module-ldap-sync/module-ldap-sync/enable/{id}`,
                        on: 'now',
                        urlData: {
                            id,
                        },
                        onSuccess(response) {
                            if (response.success) {
                                $(`#${id} .status-dependent`).removeClass('disabled');
                            }
                        },
                    });
                },
                onUnchecked() {
                    const id = $(this).closest('tr').attr('id');
                    $.api({
                        url: `${globalRootUrl}module-ldap-sync/module-ldap-sync/disable/{id}`,
                        on: 'now',
                        urlData: {
                            id,
                        },
                        onSuccess(response) {
                            if (response.success) {
                                $(`#${id} .status-dependent`).addClass('disabled');
                            }
                        },
                    });
                },
            });
    }
}

$(document).ready(() => {
    ModuleLdapSyncIndex.initialize();
});