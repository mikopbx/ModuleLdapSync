<div class="field">
    <div class="ui basic segment">

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
                <div class="field">
                    {{ ldapForm.render('administrativeLogin') }}
                </div>
                <div class="field">
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

        <div class="field">
            <div class="ui segment">
                <div class="ui toggle checkbox">
                    {{ ldapForm.render('updateAttributes') }}
                    <label for="updateAttributes">{{ t._('module_ldap_UpdateAttributes') }}</label>
                </div>
            </div>
        </div>
        <div class="field">
            <div class="ui segment">
                <div class="ui toggle checkbox">
                    {{ ldapForm.render('autosync') }}
                    <label for="autosync">{{ t._('module_ldap_EnableAutoSync') }}</label>
                </div>
            </div>
        </div>
    </div>
</div>