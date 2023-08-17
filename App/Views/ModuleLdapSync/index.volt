    {% for server in serversList %}
        {% if loop.first %}
            {{ link_to("module-ldap-sync/module-ldap-sync/modify", '<i class="add circle icon"></i>  '~t._('module_ldap_AddServer'), "class": "ui blue button add-new-button", "id":"add-new-server") }}
            <table class="ui selectable unstackable table" id="servers-table">
            <thead>
            <tr>
                <th></th>
                <th class="center aligned"></th>
                <th>{{ t._('module_ldap_TableColumnServerName') }}</th>
                <th>{{ t._('module_ldap_BaseDN') }}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
        {% endif %}

        <tr class="server-row" id="{{ server['id'] }}">

            <td class="no-modify-columns collapsing">
                <div class="ui  toggle checkbox">
                    <input type="checkbox" {% if server['status']!='disabled' %} checked {% endif %}><label></label>
                </div>
            </td>
            <td class="{{ server['status'] }} disability center aligned server-status"><i
                        class="spinner loading icon"></i></td>
            <td class="{{ server['status'] }} disability collapsing">{{ server['serverName'] }} <br><span
                        class="features failure"></span></td>
            <td class="{{ provider['status'] }} disability">{{ server['baseDN'] }}</td>
            {{ partial("partials/tablesbuttons",
                [
                    'id': provider['id'],
                    'edit' : 'module-ldap-sync/module-ldap-sync/modify/'~ server['id'],
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
        {{ link_to("module-ldap-sync/module-ldap-sync/modify", '<i class="add circle icon"></i>  '~t._('module_ldap_AddServerShort'), "class": "ui blue button add-new-button", "id":"add-new-server") }}
    </div>
{% endif %}