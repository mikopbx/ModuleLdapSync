{{ form('module-ldap-sync/module-ldap-sync/save', 'role': 'form', 'class': 'ui large form','id':'module-ldap-sync-form') }}
{{ ldapForm.render('id') }}

<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_LdapServerConnectionHeader') }}</div>

        <div class="inline field">
            <label for="ldapType">{{ t._('module_ldap_ldapType') }}</label>
            {{ ldapForm.render('ldapType') }}
        </div>

        <div class="fields">
            <div class="six wide field">
                <label for="serverName">{{ t._('module_ldap_LdapServerName') }}</label>
                {{ ldapForm.render('serverName') }}
            </div>
            <div class="two wide field">
                <label for="serverPort">{{ t._('module_ldap_LdapServerPort') }}</label>
                <div class="field max-width-200">
                    {{ ldapForm.render('serverPort') }}
                </div>
            </div>
            <div class="eight wide field">
                <label for="baseDN">{{ t._('module_ldap_LdapBaseDN') }}</label>
                {{ ldapForm.render('baseDN') }}
            </div>
        </div>

        <div class="field">
            <label>{{ t._('module_ldap_LdapAdminLogin') }}</label>
            <div class="equal width fields">
                <div class="field max-width-250">
                    {{ ldapForm.render('administrativeLogin') }}
                </div>
                <div class="field max-width-400">
                    {{ ldapForm.render('administrativePasswordHidden') }}
                </div>
            </div>
        </div>
        <div class="field">
            <label for="organizationalUnit">{{ t._('module_ldap_LdapOrganizationalUnit') }}</label>
            {{ ldapForm.render('organizationalUnit') }}
        </div>
        <div class="field">
            <label for="userFilter">{{ t._('module_ldap_LdapUserFilter') }}</label>
            {{ ldapForm.render('userFilter') }}
        </div>

    </div>
</div>

<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_LdapAttributesHeader') }}</div>
        <div class="inline field">
            {{ ldapForm.render('userNameAttribute') }}
            <label for="userNameAttribute">{{ t._('module_ldap_UserNameAttribute') }}</label>
        </div>
        <div class="inline field">
            {{ ldapForm.render('userExtensionAttribute') }}
            <label for="userExtensionAttribute">{{ t._('module_ldap_UserExtensionAttribute') }}</label>
        </div>
        <div class="inline field">
            {{ ldapForm.render('userMobileAttribute') }}
            <label for="userMobileAttribute">{{ t._('module_ldap_UserMobileAttribute') }}</label>
        </div>
        <div class="inline field">
            {{ ldapForm.render('userEmailAttribute') }}
            <label for="userEmailAttribute">{{ t._('module_ldap_UserEmailAttribute') }}</label>
        </div>
        <div class="inline field">
            {{ ldapForm.render('userAccountControl') }}
            <label for="userAccountControl">{{ t._('module_ldap_UserAccountControl') }}</label>
        </div>
        <div class="inline field">
            {{ ldapForm.render('userAvatarAttribute') }}
            <label for="userAvatarAttribute">{{ t._('module_ldap_UserAvatarAttribute') }}</label>
        </div>
        <div class="field">
            <div class="ui toggle checkbox">
                {{ ldapForm.render('updateAttributes') }}
                <label for="updateAttributes">{{ t._('module_ldap_UpdateAttributes') }}</label>
            </div>
        </div>
    </div>
</div>
<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_LdapCheckGetListHeader') }}</div>
        <p>{{ t._('module_ldap_LdapCheckGetUsersList') }}</p>
        <div class="field" id="ldap-check-get-users">
            <div class="ui labeled icon basic button check-ldap-get-users"><i
                        class="ui icon check"></i>{{ t._('module_ldap_LdapGetUsersButton') }}</div>
        </div>
    </div>
</div>
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
{{ partial("partials/submitbutton",['indexurl':'']) }}
<div class="ui clearing hidden divider"></div>
{{ endform() }}

<script type="text/javascript">
    var module_ldap_hiddenAttributes = '{{ hiddenAttributes }}';
    var module_ldap_userDisabledAttribute = '{{ userDisabledAttribute }}';
</script>