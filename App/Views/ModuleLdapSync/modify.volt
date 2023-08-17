{{ form('module-ldap-sync/module-ldap-sync/save', 'role': 'form', 'class': 'ui large form','id':'module-ldap-sync-form') }}
{{ ldapForm.render('id') }}
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
    <label for="userIdAttribute">{{ t._('module_ldap_LdapUserIdAttribute') }}</label>
    <div class="field max-width-300">
        {{ ldapForm.render('userIdAttribute') }}
    </div>
</div>
<div class="field">
    <label for="$userNameAttribute">{{ t._('module_ldap_NameAttribute') }}</label>
    <div class="field max-width-300">
        {{ ldapForm.render('$userNameAttribute') }}
    </div>
</div>
<div class="field">
    <label for="userExtensionAttribute">{{ t._('module_ldap_ExtensionAttribute') }}</label>
    <div class="field max-width-300">
        {{ ldapForm.render('userExtensionAttribute') }}
    </div>
</div>
<div class="field">
    <label for="userMobileAttribute">{{ t._('module_ldap_MobileAttribute') }}</label>
    <div class="field max-width-300">
        {{ ldapForm.render('userMobileAttribute') }}
    </div>
</div>
<div class="field">
    <label for="userEmailAttribute">{{ t._('module_ldap_EmailAttribute') }}</label>
    <div class="field max-width-300">
        {{ ldapForm.render('userEmailAttribute') }}
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
<div class="field">
    <div class="ui segment">
        <div class="ui header">{{ t._('module_ldap_LdapCheckGetListHeader') }}</div>
        <p>{{ t._('module_ldap_LdapCheckGetUsersList') }}</p>
        <div class="field" id="ldap-check-get-users">
            <div class="ui labeled icon basic button check-ldap-get-users"><i
                        class="ui icon check"></i>{{ t._('module_ldap_LdapGetUsersButton') }}</div>
        </div>
    </div>
</div>
{{ partial("partials/submitbutton",['indexurl':'']) }}
<div class="ui clearing hidden divider"></div>
{{ endform() }}