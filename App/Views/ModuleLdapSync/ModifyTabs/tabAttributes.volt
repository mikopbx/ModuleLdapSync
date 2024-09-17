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