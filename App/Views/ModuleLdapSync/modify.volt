{{ form('module-ldap-sync/module-ldap-sync/save', 'role': 'form', 'class': 'ui large form','id':'module-ldap-sync-form') }}

{{ ldapForm.render('id') }}

<div class="ui top attached tabular menu" id="module-ldap-sync-modify-menu">
        <a class="item active" data-tab="tabConnection">{{ t._('module_ldap_LdapServerConnectionHeader') }}</a>
        <a class="item" data-tab="tabAttributes">{{ t._('module_ldap_LdapAttributesHeader') }}</a>
        <a class="item" data-tab="tabTests">{{ t._('module_ldap_TestsTabHeader') }}</a>
        <a class="item" data-tab="tabConflicts">{{ t._('module_ldap_ConflictsTabHeader') }}</a>
</div>

{% if id is null %}
    <div class="ui bottom attached tab segment active" data-tab="tabConnection">
        {{ partial("Modules/ModuleLdapSync/ModifyTabs/tabConnection") }}
    </div>
{% else %}
    <div class="ui bottom attached tab segment" data-tab="tabAttributes">
        {{ partial("Modules/ModuleLdapSync/ModifyTabs/tabAttributes") }}
    </div>
    <div class="ui bottom attached tab segment active" data-tab="tabTests">
        {{ partial("Modules/ModuleLdapSync/ModifyTabs/tabTests") }}
    </div>

    <div class="ui bottom attached tab segment" data-tab="tabConflicts">
        {{ partial("Modules/ModuleLdapSync/ModifyTabs/tabConflicts") }}
    </div>

{% endif %}

{{ partial("partials/submitbutton",['indexurl':'module-ldap-sync/module-ldap-sync/index']) }}
{{ endform() }}

<script type="text/javascript">
    var module_ldap_hiddenAttributes = '{{ hiddenAttributes }}';
    var module_ldap_userDisabledAttribute = '{{ userDisabledAttribute }}';
</script>