<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_LdapManualSyncHeader') }}</div>
        <p>{{ t._('module_ldap_LdapManualSyncManual') }}</p>
        <div class="field" id="ldap-sync-users">
            <div class="ui labeled icon basic button ldap-sync-users"><i
                        class="ui icon check"></i>{{ t._('module_ldap_LdapManualSyncButton') }}</div>
        </div>
    </div>
</div>

<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_ConflictsTabHeader') }}</div>
        <div class="field">
            <div class="ui labeled icon basic button " id="delete-all-conflicts-button">
                <i class="trash icon"></i>
                {{ t._('module_ldap_DeleteAllConflicts') }}
            </div>
        </div>

        <div class="field">
            <div class="ui placeholder segment" id="no-any-conflicts-placeholder">
                <div class="ui icon header">
                    <i class="smile outline icon"></i>
                    {{ t._('module_ldap_NoAnyConflicts') }}
                </div>
            </div>
        </div>
    </div>
</div>

<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_DeletedUsersHeader') }}</div>
        <div class="field">
            <div class="ui placeholder segment" id="no-any-disabled-users-placeholder">
                <div class="ui icon header">
                    <i class="smile outline icon"></i>
                    {{ t._('module_ldap_DeletedUsersEmpty') }}
                </div>
            </div>
        </div>
    </div>
</div>