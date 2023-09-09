    {% for server in serversList %}
        {% if loop.first %}
            {{ link_to("module-ldap-sync/module-ldap-sync/modify", '<i class="add circle icon"></i>  '~t._('module_ldap_AddServer'), "class": "ui blue button add-new-button disability", "id":"add-new-server") }}
            <table class="ui selectable unstackable table" id="servers-table">
            <thead>
            <tr>
                <th>{{ t._('module_ldap_TableColumnAutoSync') }}</th>
                <th>{{ t._('module_ldap_TableColumnServerName') }}</th>
                <th>{{ t._('module_ldap_BaseDN') }}</th>
                <th>{{ t._('module_ldap_OrganizationalUnit') }}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
        {% endif %}

        <tr class="ui server-row disability" id="{{ server['id'] }}">
            <td class="collapsing">
                <div class="ui toggle checkbox server-sync-status">
                    <input type="checkbox" {% if server['status']!='disabled' %} checked {% endif %}><label></label>
                </div>
            </td>
            <td>{{ server['serverName'] }}</td>
            <td>{{ server['baseDN'] }}</td>
            <td>{{ server['organizationalUnit'] }}</td>
            {{ partial("partials/tablesbuttons",
                [
                    'id': server['id'],
                    'edit' : 'module-ldap-sync/module-ldap-sync/modify/',
                    'delete': 'module-ldap-sync/module-ldap-sync/delete/'
                ]) }}
        </tr>
        {% if loop.last %}
            </tbody>
            </table>
        {% endif %}
    {% endfor %}

{% if serversList is null %}
    <div class="ui placeholder segment">
        <div class="ui icon header">
            <i class="users icon"></i>
            {{ t._('module_ldap_NoAnyServers') }}
        </div>
        {{ link_to("module-ldap-sync/module-ldap-sync/modify", '<i class="add circle icon"></i>  '~t._('module_ldap_AddServerShort'), "class": "ui blue button add-new-button disability", "id":"add-new-server") }}
    </div>
{% endif %}