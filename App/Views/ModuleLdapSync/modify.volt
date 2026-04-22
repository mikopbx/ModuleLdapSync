<form method="post" autocomplete="off" action="module-ldap-sync/module-ldap-sync/save" role="form" class="ui large info form" id="module-ldap-sync-form">

{{ ldapForm.render('id') }}

<div class="ui top attached tabular menu" id="module-ldap-sync-modify-menu">
        <a class="item active" data-tab="tabConnection">{{ t._('module_ldap_LdapServerConnectionHeader') }}</a>
        <a class="item tab-certificate" data-tab="tabCertificate" style="display:none;">
            {{ t._('module_ldap_TabCertificate') }}
            <i class="exclamation triangle icon ca-missing-warning" style="display:none; margin-left:0.3em;"></i>
        </a>
        <a class="item" data-tab="tabAttributes">{{ t._('module_ldap_TabAttributes') }}</a>
        <a class="item" data-tab="tabConflicts">{{ t._('module_ldap_SyncTabHeader') }}</a>
</div>

    <div class="ui bottom attached tab segment active" data-tab="tabConnection">
        {{ partial("Modules/ModuleLdapSync/ModuleLdapSync/ModifyTabs/tabConnection") }}
    </div>
    <div class="ui bottom attached tab segment" data-tab="tabCertificate">
        {{ partial("Modules/ModuleLdapSync/ModuleLdapSync/ModifyTabs/tabCertificate") }}
    </div>
    <div class="ui bottom attached tab segment" data-tab="tabAttributes">
        {{ partial("Modules/ModuleLdapSync/ModuleLdapSync/ModifyTabs/tabAttributes") }}
    </div>

    <div class="ui bottom attached tab segment" data-tab="tabConflicts">
        {{ partial("Modules/ModuleLdapSync/ModuleLdapSync/ModifyTabs/tabConflicts") }}
    </div>

{{ partial("partials/submitbutton",['indexurl':'module-ldap-sync/module-ldap-sync/index']) }}
</form>

<script type="text/javascript">
    var module_ldap_hiddenAttributes = '{{ hiddenAttributes }}';
    var module_ldap_userDisabledAttribute = '{{ userDisabledAttribute }}';
</script>