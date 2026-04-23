<div class="field">
    <div class="ui basic segment">

        <div class="inline field">
            <label for="ldapType">{{ t._('module_ldap_ldapType') }}</label>
            {{ ldapForm.render('ldapType') }}
        </div>

        <div class="fields">
            {{ ldapForm.render('tlsMode') }}
            <div class="six wide field">
                <label for="serverName">{{ t._('module_ldap_LdapServerName') }}
                    <i class="small info circle icon field-info-icon" data-field="serverName"></i>
                </label>
                <div class="ui left labeled input">
                    <div class="ui dropdown label use-tls-dropdown">
                        <div class="text">ldap://</div>
                        <i class="dropdown icon"></i>
                    </div>
                    {{ ldapForm.render('serverName') }}
                </div>
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

        <div class="field tls-settings" style="display:none;">
            <div class="ui segment">
                <div class="ui toggle checkbox">
                    {{ ldapForm.render('verifyCert') }}
                    <label for="verifyCert">{{ t._('module_ldap_VerifyCertificate') }}
                        <i class="small info circle icon field-info-icon" data-field="verifyCert"></i>
                    </label>
                </div>
                <div class="ui warning message insecure-tls-warning" style="display:none;">
                    <i class="exclamation triangle icon"></i>
                    <span>{{ t._('module_ldap_InsecureTlsWarning') }}</span>
                </div>
            </div>
        </div>

        <div class="field">
            <label>{{ t._('module_ldap_LdapAdminLogin') }}
                <i class="small info circle icon field-info-icon" data-field="administrativeLogin"></i>
            </label>
            <div class="fields">
                <div class="seven wide field">
                    {{ ldapForm.render('administrativeLogin') }}
                </div>
                <div class="seven wide field">
                    {{ ldapForm.render('administrativePasswordHidden') }}
                </div>
                <div class="two wide field">
                    <div class="ui icon basic button test-ldap-bind"
                         data-tooltip="{{ t._('module_ldap_TestBindButton') }}"
                         data-position="top right"
                         data-variation="tiny">
                        <i class="key icon"></i>
                    </div>
                </div>
            </div>
            <div class="ui message test-bind-result" style="display:none;"></div>
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
                    <label for="updateAttributes">{{ t._('module_ldap_UpdateAttributes') }}
                        <i class="small info circle icon field-info-icon" data-field="updateAttributes"></i>
                    </label>
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
