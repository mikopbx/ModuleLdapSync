<div class="field">
    <div class="ui basic segment">
        <div class="ui header">{{ t._('module_ldap_CaCertificate') }}</div>
        <div class="ui info message">
            <div class="content">
                <p>{{ t._('module_ldap_CaCertificateHint') }}</p>
            </div>
        </div>
        {{ ldapForm.render('caCertificate') }}
    </div>
</div>
