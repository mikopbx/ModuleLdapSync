"use strict";

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/* global globalRootUrl, globalTranslate, Form, PbxApi, module_ldap_userDisabledAttribute, module_ldap_hiddenAttributes, Config, UserMessage */

/**
 * ModuleLdapSyncModify
 *
 * This object handles the functionality of synchronizing LDAP users and
 * other related features.
 */
var ModuleLdapSyncModify = {
  /**
   * jQuery object for the form.
   * @type {jQuery}
   */
  $formObj: $('#module-ldap-sync-form'),

  /**
   * jQuery object for the server type dropdown.
   * @type {jQuery}
   */
  $ldapTypeDropdown: $('.select-ldap-field'),

  /**
   * jQuery object for the getting LDAP users list button.
   * @type {jQuery}
   */
  $checkGetUsersButton: $('.check-ldap-get-users'),

  /**
   * jQuery object for the ldap check segment.
   * @type {jQuery}
   */
  $ldapCheckGetUsersSegment: $('#ldap-check-get-users'),

  /**
   * jQuery object for the sync LDAP users button.
   * @type {jQuery}
   */
  $syncUsersButton: $('.ldap-sync-users'),

  /**
   * jQuery object for the ldap sync users segment.
   * @type {jQuery}
   */
  $syncUsersSegment: $('#ldap-sync-users'),

  /**
   * Constant with user disabled attribute id
   * @type {string}
   */
  userDisabledAttribute: module_ldap_userDisabledAttribute,

  /**
   * Constant with hidden users attributes
   * @type {array}
   */
  hiddenAttributes: JSON.parse(module_ldap_hiddenAttributes),

  /**
   * jQuery object for the man tab menu.
   * @type {jQuery}
   */
  $mainTabMenu: $('#module-ldap-sync-modify-menu  .item'),

  /**
   * jQuery object for the message no any conflicts
   * @type {jQuery}
   */
  $noAnyConflictsPlaceholder: $('#no-any-conflicts-placeholder'),

  /**
   * jQuery object for the button to delete all conflicts
   * @type {jQuery}
   */
  $deleteAllConflictsButton: $('#delete-all-conflicts-button'),

  /**
   * jQuery object for the module status toggle
   * @type {jQuery}
   */
  $statusToggle: $('#module-status-toggle'),

  /**
   * jQuery object for the use TLS selector
   * @type {jQuery}
   */
  $useTlsDropdown: $('.use-tls-dropdown'),

  /**
   * jQuery object for the message no any disabled users
   * @type {jQuery}
   */
  $noAnyDisabledUsersPlaceholder: $('#no-any-disabled-users-placeholder'),

  /**
   * Validation rules for the form fields.
   * @type {Object}
   */
  validateRules: {
    serverName: {
      identifier: 'serverName',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateServerNameIsEmpty
      }]
    },
    serverPort: {
      identifier: 'serverPort',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateServerPortIsEmpty
      }]
    },
    administrativeLogin: {
      identifier: 'administrativeLogin',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateAdministrativeLoginIsEmpty
      }]
    },
    administrativePasswordHidden: {
      identifier: 'administrativePasswordHidden',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateAdministrativePasswordIsEmpty
      }]
    },
    baseDN: {
      identifier: 'baseDN',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateBaseDNIsEmpty
      }]
    },
    userNameAttribute: {
      identifier: 'userNameAttribute',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserNameAttributeIsEmpty
      }]
    },
    userMobileAttribute: {
      identifier: 'userMobileAttribute',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserMobileAttributeIsEmpty
      }]
    },
    userExtensionAttribute: {
      identifier: 'userExtensionAttribute',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserExtensionAttributeIsEmpty
      }]
    },
    userEmailAttribute: {
      identifier: 'userEmailAttribute',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserEmailAttributeIsEmpty
      }]
    },
    userAccountControl: {
      identifier: 'userAccountControl',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserAccountControlIsEmpty
      }]
    }
  },

  /**
   * Initializes the module.
   */
  initialize: function initialize() {
    ModuleLdapSyncModify.$ldapTypeDropdown.dropdown({
      onChange: ModuleLdapSyncModify.onChangeLdapType
    });
    ModuleLdapSyncModify.initializeForm(); // Handle get users list button click

    ModuleLdapSyncModify.$checkGetUsersButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallGetLdapUsers();
    }); // Handle sync users button click

    ModuleLdapSyncModify.$syncUsersButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallSyncUsers();
    });
    ModuleLdapSyncModify.$mainTabMenu.tab(); // Handle delete conflict button click

    $('body').on('click', '.delete-conflict', function (e) {
      e.preventDefault();
      var recordId = $(e.target).closest('tr').data('value');
      ModuleLdapSyncModify.apiCallDeleteConflict(recordId);
    });
    ModuleLdapSyncModify.apiCallGetConflicts(); // Handle sync users button click

    ModuleLdapSyncModify.$deleteAllConflictsButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallDeleteConflicts();
    });
    ModuleLdapSyncModify.updateConflictsView(); // Handle change TLS protocol

    ModuleLdapSyncModify.$useTlsDropdown.dropdown({
      values: [{
        name: 'ldap://',
        value: '0',
        selected: ModuleLdapSyncModify.$formObj.form('get value', 'useTLS') === '0'
      }, {
        name: 'ldaps://',
        value: '1',
        selected: ModuleLdapSyncModify.$formObj.form('get value', 'useTLS') === '1'
      }]
    });
    ModuleLdapSyncModify.updateDisabledUsersView();
    ModuleLdapSyncModify.apiCallGetDisabledUsers(); // Handle find user in conflict row click

    $('body').on('click', 'tr.find-user-row', function (e) {
      e.preventDefault();
      var recordId = $(e.target).closest('tr').data('value');
      var searchValue = "id:".concat(recordId);
      window.open("".concat(globalRootUrl, "extensions/index/?search=").concat(encodeURIComponent(searchValue)), '_blank');
    }); // Handle open user in sync table row click

    $('body').on('click', 'tr.open-user-row', function (e) {
      e.preventDefault();
      var recordId = $(e.target).closest('tr').data('value');
      window.open("".concat(globalRootUrl, "extensions/modify/").concat(encodeURIComponent(recordId)), '_blank');
    });
  },

  /**
   * Handles change LDAP dropdown.
   */
  onChangeLdapType: function onChangeLdapType(value) {
    if (value === 'OpenLDAP') {
      ModuleLdapSyncModify.$formObj.form('set value', 'userIdAttribute', 'uid');
      ModuleLdapSyncModify.$formObj.form('set value', 'administrativeLogin', 'cn=admin,dc=example,dc=com');
      ModuleLdapSyncModify.$formObj.form('set value', 'userFilter', '(objectClass=inetOrgPerson)');
      ModuleLdapSyncModify.$formObj.form('set value', 'baseDN', 'dc=example,dc=com');
      ModuleLdapSyncModify.$formObj.form('set value', 'organizationalUnit', 'ou=users, dc=domain, dc=com');
    } else if (value === 'ActiveDirectory') {
      ModuleLdapSyncModify.$formObj.form('set value', 'administrativeLogin', 'admin');
      ModuleLdapSyncModify.$formObj.form('set value', 'userIdAttribute', 'samaccountname');
      ModuleLdapSyncModify.$formObj.form('set value', 'userFilter', '(&(objectClass=user)(objectCategory=PERSON))');
      ModuleLdapSyncModify.$formObj.form('set value', 'baseDN', 'dc=example,dc=com');
      ModuleLdapSyncModify.$formObj.form('set value', 'organizationalUnit', 'ou=users, dc=domain, dc=com');
    }
  },

  /**
   * Make an API call to get disabled/deleted users
   */
  apiCallGetDisabledUsers: function apiCallGetDisabledUsers() {
    var serverID = ModuleLdapSyncModify.$formObj.form('get value', 'id');

    if (!serverID) {
      return;
    }

    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/get-disabled-ldap-users"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        settings.data.id = serverID;
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'get-disabled-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        $('#disabled-users-result').remove();
        $('.ui.message.ajax').remove();
        ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.hide();
        var html = ModuleLdapSyncModify.buildTableFromDisabledUsersList(response.data);
        ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.after(html);
        ModuleLdapSyncModify.updateDisabledUsersView();
      },

      /**
       * Handles the failure response of the 'get-disabled-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        $('.ui.message.ajax').remove();
        $('#disabled-users-result').remove();
        UserMessage.showMultiString(response.messages);
        ModuleLdapSyncModify.updateDisabledUsersView();
      }
    });
  },

  /**
   * Build table from the disabled users list
   *
   * @param {Array} records - The list of disabled users
   * @returns {string} The HTML table
   */
  buildTableFromDisabledUsersList: function buildTableFromDisabledUsersList(records) {
    var html = '<table class="ui very compact selectable table" id="disabled-users-result">'; // Generate the HTML table head conflicts data attributes

    html += '<thead><tr>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('UserName') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('UserNumber') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('UserEmail') + '</th>';
    html += '</tr></thead><tbody>'; // Generate the HTML table with conflicts data

    $.each(records, function (index, record) {
      html += "<tr class=\"item find-user-row\" data-value=\"".concat(record['extension_id'], "\">");
      html += '<td><i class="icon user outline"></i>' + record['name'] + '</td>';
      html += '<td>' + record['number'] + '</td>';
      html += '<td>' + record['email'] + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  },

  /**
   * Update the disabled users view.
   */
  updateDisabledUsersView: function updateDisabledUsersView() {
    if ($("#disabled-users-result tbody tr").length === 0) {
      ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.show();
      $('#disabled-users-result').remove();
    }
  },

  /**
   * Handles delete sync conflicts request and delete conflicts table
   * @returns {*}
   */
  apiCallDeleteConflicts: function apiCallDeleteConflicts() {
    var serverID = ModuleLdapSyncModify.$formObj.form('get value', 'id');

    if (!serverID) {
      return;
    }

    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/delete-server-conflicts"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        settings.data.id = serverID;
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'delete-server-conflicts' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        $('.ui.message.ajax').remove();
        $('#conflicts-result').remove();
        ModuleLdapSyncModify.updateConflictsView();
      },

      /**
       * Handles the failure response of the 'delete-server-conflicts' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        $('.ui.message.ajax').remove();
        UserMessage.showMultiString(response.messages);
      }
    });
  },

  /**
   * Handles delete sync conflict request and delete conflict row on the table
   * @param recordId
   * @returns {*}
   */
  apiCallDeleteConflict: function apiCallDeleteConflict(recordId) {
    if (!recordId) {
      return;
    }

    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/delete-server-conflict"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        settings.data.recordId = recordId;
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'delete-server-conflict' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        $('.ui.message.ajax').remove();
        $("#conflicts-result tr[data-value=\"".concat(recordId, "\"]")).remove();
        ModuleLdapSyncModify.updateConflictsView();
      },

      /**
       * Handles the failure response of the 'delete-server-conflict' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        $('.ui.message.ajax').remove();
        UserMessage.showMultiString(response.messages);
      }
    });
  },

  /**
   * Make an API call to get last sync conflicts
   */
  apiCallGetConflicts: function apiCallGetConflicts() {
    var serverID = ModuleLdapSyncModify.$formObj.form('get value', 'id');

    if (!serverID) {
      return;
    }

    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/get-server-conflicts"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        settings.data.id = serverID;
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'get-server-conflicts' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        $('#conflicts-result').remove();
        $('.ui.message.ajax').remove();
        ModuleLdapSyncModify.$noAnyConflictsPlaceholder.hide();
        var html = ModuleLdapSyncModify.buildTableFromConflictsList(response.data);
        ModuleLdapSyncModify.$noAnyConflictsPlaceholder.after(html);
        ModuleLdapSyncModify.updateConflictsView();
      },

      /**
       * Handles the failure response of the 'get-server-conflicts' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        $('.ui.message.ajax').remove();
        $('#conflicts-result').remove();
        UserMessage.showMultiString(response.messages);
      }
    });
  },

  /**
   * Update the conflicts view.
   * @return {void}
   */
  updateConflictsView: function updateConflictsView() {
    if ($("#conflicts-result tbody tr").length === 0) {
      ModuleLdapSyncModify.$noAnyConflictsPlaceholder.show();
      ModuleLdapSyncModify.$deleteAllConflictsButton.hide();
      $('#conflicts-result').remove();
    } else {
      ModuleLdapSyncModify.$deleteAllConflictsButton.show();
    }
  },

  /**
   * Make an API call to get LDAP users
   */
  apiCallGetLdapUsers: function apiCallGetLdapUsers() {
    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/get-available-ldap-users"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        ModuleLdapSyncModify.$checkGetUsersButton.addClass('loading disabled');
        settings.data = ModuleLdapSyncModify.$formObj.form('get values');
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'get-available-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        ModuleLdapSyncModify.$checkGetUsersButton.removeClass('loading disabled');
        $('#ldap-result').remove();
        $('.ui.message.ajax').remove();
        var html = ModuleLdapSyncModify.buildTableFromUsersList(response.data);
        ModuleLdapSyncModify.$ldapCheckGetUsersSegment.after(html);
      },

      /**
       * Handles the failure response of the 'get-available-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        ModuleLdapSyncModify.$checkGetUsersButton.removeClass('loading disabled');
        $('.ui.message.ajax').remove();
        $('#ldap-result').remove();
        UserMessage.showMultiString(response.messages);
      }
    });
  },

  /**
   * Make an API call to sync LDAP users
   */
  apiCallSyncUsers: function apiCallSyncUsers() {
    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/sync-ldap-users"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        ModuleLdapSyncModify.$syncUsersButton.addClass('loading disabled');
        settings.data = ModuleLdapSyncModify.$formObj.form('get values');
        return settings;
      },
      successTest: PbxApi.successTest,

      /**
       * Handles the successful response of the 'sync-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        ModuleLdapSyncModify.$syncUsersButton.removeClass('loading disabled');
        $('#ldap-result').remove();
        $('.ui.message.ajax').remove();
        var html = ModuleLdapSyncModify.buildTableFromUsersList(response.data);
        ModuleLdapSyncModify.$syncUsersSegment.after(html);
        ModuleLdapSyncModify.apiCallGetConflicts();
        ModuleLdapSyncModify.apiCallGetDisabledUsers();
      },

      /**
       * Handles the failure response of the 'sync-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onFailure: function onFailure(response) {
        ModuleLdapSyncModify.$syncUsersButton.removeClass('loading disabled');
        $('.ui.message.ajax').remove();
        $('#ldap-result').remove();
        UserMessage.showMultiString(response.messages);
      }
    });
  },

  /**
   * Build table from the user's list
   *
   * @param {Array} usersList - The list of users
   * @returns {string} The HTML table
   */
  buildTableFromUsersList: function buildTableFromUsersList(usersList) {
    var html = '<table class="ui very compact selectable table" id="ldap-result">';
    var uniqueAttributes = {}; // Extract unique attributes from the response data

    $.each(usersList, function (userKey, userValue) {
      $.each(userValue, function (index, value) {
        if (ModuleLdapSyncModify.hiddenAttributes.includes(index)) {
          return;
        }

        uniqueAttributes[index] = true;
      });
    }); // Generate the HTML table head user data attributes

    html += '<thead><tr>';
    $.each(uniqueAttributes, function (index, value) {
      if (index === 'usersSyncResult' || index === 'userHadChangesOnTheSide') {
        html += '<th>' + ModuleLdapSyncModify.getTranslation(index) + '</th>';
      } else {
        var columnName = $("input").filter(function () {
          return $(this).val() === index;
        }).closest('.field').find('label').text();
        html += '<th>' + columnName + '</th>';
      }
    });
    html += '</tr></thead>'; // Generate the HTML table with user data

    $.each(usersList, function (index, user) {
      // Determine the row class based on whether the user is disabled
      var rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item'; // Check if usersSyncResult is 'conflict' and add a class to highlight the row

      if (user['usersSyncResult'] === 'CONFLICT') {
        rowClass += ' negative';
      } else if (user['usersSyncResult'] === 'UPDATED') {
        rowClass += ' positive';
      }

      html += "<tr data-value=\"".concat(user['extensionIdInMikoPBX'], "\" class=\"").concat(rowClass, " open-user-row\">");
      $.each(uniqueAttributes, function (attrIndex, attrValue) {
        var cellValue = user[attrIndex] || '';

        if (attrIndex === 'usersSyncResult' || attrIndex === 'userHadChangesOnTheSide') {
          html += '<td>' + ModuleLdapSyncModify.getTranslation(cellValue) + '</td>';
        } else {
          html += '<td>' + cellValue + '</td>';
        }
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  },

  /**
   * Build table from the conflicts list
   *
   * @param {Array} conflicts - The list of conflicts
   * @returns {string} The HTML table
   */
  buildTableFromConflictsList: function buildTableFromConflictsList(conflicts) {
    var html = '<table class="ui very compact selectable table" id="conflicts-result">'; // Generate the HTML table head conflicts data attributes

    html += '<thead><tr>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictTime') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictSide') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictErrorMessages') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictUserData') + '</th>';
    html += '<th></th>';
    html += '</tr></thead><tbody>'; // Generate the HTML table with conflicts data

    $.each(conflicts, function (index, record) {
      var prettyJSON = JSON.stringify(record['params'], null, 2);
      html += "<tr class=\"item\" data-value=\"".concat(record['id'], "\">");
      html += '<td>' + record['lastTime'] + '</td>';
      html += '<td>' + ModuleLdapSyncModify.getTranslation(record['side']) + '</td>';
      html += '<td>' + record['errors'] + '</td>';
      html += '<td><pre>' + prettyJSON + '</pre></td>';
      html += "<td><div class=\"ui icon basic button popuped delete-conflict\" data-content=\"".concat(ModuleLdapSyncModify.getTranslation('deleteCurrentConflict'), "\"><i class=\"icon trash red\"></i></div></td>");
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  },

  /**
   * Translates the given text using the global translation object.
   *
   * @param {string} text - The text to be translated.
   * @returns {string} The translated text if available, or the original text.
   */
  getTranslation: function getTranslation(text) {
    if (text.length === 0) {
      return text;
    }

    var nameTemplate = "module_ldap_".concat(text);
    var name = globalTranslate[nameTemplate];

    if (name !== undefined) {
      return name;
    }

    return text;
  },

  /**
   * Callback function before sending the form.
   * @param {object} settings - The settings object.
   * @returns {object} - The modified settings object.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = ModuleLdapSyncModify.$formObj.form('get values');
    ModuleLdapSyncModify.$formObj.find('.checkbox').each(function (index, obj) {
      var input = $(obj).find('input');
      var id = input.attr('id');

      if ($(obj).checkbox('is checked')) {
        result.data[id] = '1';
      } else {
        result.data[id] = '0';
      }
    });
    return result;
  },

  /**
   * Callback function after sending the form.
   */
  cbAfterSendForm: function cbAfterSendForm() {// Callback implementation
  },

  /**
   * Initializes the form.
   */
  initializeForm: function initializeForm() {
    Form.$formObj = ModuleLdapSyncModify.$formObj;
    Form.url = "".concat(globalRootUrl, "module-ldap-sync/module-ldap-sync/save");
    Form.validateRules = ModuleLdapSyncModify.validateRules;
    Form.cbBeforeSendForm = ModuleLdapSyncModify.cbBeforeSendForm;
    Form.cbAfterSendForm = ModuleLdapSyncModify.cbAfterSendForm;
    Form.initialize();
  }
};
$(document).ready(function () {
  ModuleLdapSyncModify.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRsc0Ryb3Bkb3duIiwiJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyIiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJOYW1lQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyTW9iaWxlQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFeHRlbnNpb25BdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5IiwidXNlckVtYWlsQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckFjY291bnRDb250cm9sIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwib25DaGFuZ2UiLCJvbkNoYW5nZUxkYXBUeXBlIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwidGFiIiwicmVjb3JkSWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YSIsImFwaUNhbGxEZWxldGVDb25mbGljdCIsImFwaUNhbGxHZXRDb25mbGljdHMiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3RzIiwidXBkYXRlQ29uZmxpY3RzVmlldyIsInZhbHVlcyIsIm5hbWUiLCJ2YWx1ZSIsInNlbGVjdGVkIiwiZm9ybSIsInVwZGF0ZURpc2FibGVkVXNlcnNWaWV3IiwiYXBpQ2FsbEdldERpc2FibGVkVXNlcnMiLCJzZWFyY2hWYWx1ZSIsIndpbmRvdyIsIm9wZW4iLCJnbG9iYWxSb290VXJsIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VydmVySUQiLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJpZCIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmUiLCJoaWRlIiwiaHRtbCIsImJ1aWxkVGFibGVGcm9tRGlzYWJsZWRVc2Vyc0xpc3QiLCJhZnRlciIsIm9uRmFpbHVyZSIsIlVzZXJNZXNzYWdlIiwic2hvd011bHRpU3RyaW5nIiwibWVzc2FnZXMiLCJyZWNvcmRzIiwiZ2V0VHJhbnNsYXRpb24iLCJlYWNoIiwiaW5kZXgiLCJyZWNvcmQiLCJsZW5ndGgiLCJzaG93IiwiYnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0IiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0IiwidXNlcnNMaXN0IiwidW5pcXVlQXR0cmlidXRlcyIsInVzZXJLZXkiLCJ1c2VyVmFsdWUiLCJpbmNsdWRlcyIsImNvbHVtbk5hbWUiLCJmaWx0ZXIiLCJ2YWwiLCJmaW5kIiwidGV4dCIsInVzZXIiLCJyb3dDbGFzcyIsImF0dHJJbmRleCIsImF0dHJWYWx1ZSIsImNlbGxWYWx1ZSIsImNvbmZsaWN0cyIsInByZXR0eUpTT04iLCJzdHJpbmdpZnkiLCJuYW1lVGVtcGxhdGUiLCJ1bmRlZmluZWQiLCJjYkJlZm9yZVNlbmRGb3JtIiwicmVzdWx0Iiwib2JqIiwiaW5wdXQiLCJhdHRyIiwiY2hlY2tib3giLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLG9CQUFvQixHQUFHO0FBRTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLHdCQUFELENBTmlCOztBQVE1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLG9CQUFELENBWlE7O0FBYzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NFLEVBQUFBLG9CQUFvQixF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Q0EsVUFBSXBJLENBQUMsQ0FBQ2tJLEdBQUQsQ0FBRCxDQUFPRyxRQUFQLENBQWdCLFlBQWhCLENBQUosRUFBbUM7QUFDbENKLFFBQUFBLE1BQU0sQ0FBQ3ZFLElBQVAsQ0FBWXlCLEVBQVosSUFBZ0IsR0FBaEI7QUFDQSxPQUZELE1BRU87QUFDTjhDLFFBQUFBLE1BQU0sQ0FBQ3ZFLElBQVAsQ0FBWXlCLEVBQVosSUFBZ0IsR0FBaEI7QUFDQTtBQUNELEtBUkQ7QUFVQSxXQUFPOEMsTUFBUDtBQUNBLEdBN3JCMkI7O0FBK3JCNUI7QUFDRDtBQUNBO0FBQ0NLLEVBQUFBLGVBbHNCNEIsNkJBa3NCVixDQUNqQjtBQUNBLEdBcHNCMkI7O0FBc3NCNUI7QUFDRDtBQUNBO0FBQ0N0RixFQUFBQSxjQXpzQjRCLDRCQXlzQlg7QUFDaEJ1RixJQUFBQSxJQUFJLENBQUN4SSxRQUFMLEdBQWdCRCxvQkFBb0IsQ0FBQ0MsUUFBckM7QUFDQXdJLElBQUFBLElBQUksQ0FBQzFELEdBQUwsYUFBY0osYUFBZDtBQUNBOEQsSUFBQUEsSUFBSSxDQUFDckgsYUFBTCxHQUFxQnBCLG9CQUFvQixDQUFDb0IsYUFBMUM7QUFDQXFILElBQUFBLElBQUksQ0FBQ1AsZ0JBQUwsR0FBd0JsSSxvQkFBb0IsQ0FBQ2tJLGdCQUE3QztBQUNBTyxJQUFBQSxJQUFJLENBQUNELGVBQUwsR0FBdUJ4SSxvQkFBb0IsQ0FBQ3dJLGVBQTVDO0FBQ0FDLElBQUFBLElBQUksQ0FBQzNGLFVBQUw7QUFDQTtBQWh0QjJCLENBQTdCO0FBbXRCQTVDLENBQUMsQ0FBQ3dJLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkIzSSxFQUFBQSxvQkFBb0IsQ0FBQzhDLFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSwgbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLCBtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzLCBDb25maWcsIFVzZXJNZXNzYWdlICovXG5cbi8qKlxuICogTW9kdWxlTGRhcFN5bmNNb2RpZnlcbiAqXG4gKiBUaGlzIG9iamVjdCBoYW5kbGVzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHN5bmNocm9uaXppbmcgTERBUCB1c2VycyBhbmRcbiAqIG90aGVyIHJlbGF0ZWQgZmVhdHVyZXMuXG4gKi9cbmNvbnN0IE1vZHVsZUxkYXBTeW5jTW9kaWZ5ID0ge1xuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLWxkYXAtc3luYy1mb3JtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzZXJ2ZXIgdHlwZSBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwVHlwZURyb3Bkb3duOiAkKCcuc2VsZWN0LWxkYXAtZmllbGQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGdldHRpbmcgTERBUCB1c2VycyBsaXN0IGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjaGVja0dldFVzZXJzQnV0dG9uOiAkKCcuY2hlY2stbGRhcC1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgY2hlY2sgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLWNoZWNrLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3luYyBMREFQIHVzZXJzIGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNCdXR0b246ICQoJy5sZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgc3luYyB1c2VycyBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCB1c2VyIGRpc2FibGVkIGF0dHJpYnV0ZSBpZFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0dXNlckRpc2FibGVkQXR0cmlidXRlOiBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggaGlkZGVuIHVzZXJzIGF0dHJpYnV0ZXNcblx0ICogQHR5cGUge2FycmF5fVxuXHQgKi9cblx0aGlkZGVuQXR0cmlidXRlczogSlNPTi5wYXJzZShtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1hbiB0YWIgbWVudS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRtYWluVGFiTWVudTogJCgnI21vZHVsZS1sZGFwLXN5bmMtbW9kaWZ5LW1lbnUgIC5pdGVtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtZXNzYWdlIG5vIGFueSBjb25mbGljdHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyOiAkKCcjbm8tYW55LWNvbmZsaWN0cy1wbGFjZWhvbGRlcicpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgYnV0dG9uIHRvIGRlbGV0ZSBhbGwgY29uZmxpY3RzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uOiAkKCcjZGVsZXRlLWFsbC1jb25mbGljdHMtYnV0dG9uJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtb2R1bGUgc3RhdHVzIHRvZ2dsZVxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB1c2UgVExTIHNlbGVjdG9yXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlVGxzRHJvcGRvd246ICQoJy51c2UtdGxzLWRyb3Bkb3duJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtZXNzYWdlIG5vIGFueSBkaXNhYmxlZCB1c2Vyc1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyOiAkKCcjbm8tYW55LWRpc2FibGVkLXVzZXJzLXBsYWNlaG9sZGVyJyksXG5cblxuXHQvKipcblx0ICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzLlxuXHQgKiBAdHlwZSB7T2JqZWN0fVxuXHQgKi9cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdHNlcnZlck5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJOYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0c2VydmVyUG9ydDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlclBvcnQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZUxvZ2luOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVMb2dpbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YmFzZUROOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYmFzZUROJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyTmFtZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJOYW1lQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck5hbWVBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJNb2JpbGVBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyTW9iaWxlQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck1vYmlsZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckV4dGVuc2lvbkF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFeHRlbnNpb25BdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRXh0ZW5zaW9uQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRW1haWxBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyRW1haWxBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJBY2NvdW50Q29udHJvbDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJBY2NvdW50Q29udHJvbCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJBY2NvdW50Q29udHJvbElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwVHlwZURyb3Bkb3duLmRyb3Bkb3duKHtcblx0XHRcdG9uQ2hhbmdlOiBNb2R1bGVMZGFwU3luY01vZGlmeS5vbkNoYW5nZUxkYXBUeXBlLFxuXHRcdH0pO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZUZvcm0oKTtcblxuXHRcdC8vIEhhbmRsZSBnZXQgdXNlcnMgbGlzdCBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0TGRhcFVzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxTeW5jVXNlcnMoKTtcblx0XHR9KTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRtYWluVGFiTWVudS50YWIoKTtcblxuXHRcdC8vIEhhbmRsZSBkZWxldGUgY29uZmxpY3QgYnV0dG9uIGNsaWNrXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuZGVsZXRlLWNvbmZsaWN0JywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgcmVjb3JkSWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmRhdGEoJ3ZhbHVlJyk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsRGVsZXRlQ29uZmxpY3QocmVjb3JkSWQpO1xuXHRcdH0pO1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRDb25mbGljdHMoKTtcblxuXHRcdC8vIEhhbmRsZSBzeW5jIHVzZXJzIGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbERlbGV0ZUNvbmZsaWN0cygpO1xuXHRcdH0pO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXG5cdFx0Ly8gSGFuZGxlIGNoYW5nZSBUTFMgcHJvdG9jb2xcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdXNlVGxzRHJvcGRvd24uZHJvcGRvd24oe1xuXHRcdFx0dmFsdWVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lOiAnbGRhcDovLycsXG5cdFx0XHRcdFx0dmFsdWU6ICcwJyxcblx0XHRcdFx0XHRzZWxlY3RlZCA6IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ3VzZVRMUycpPT09JzAnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lICAgICA6ICdsZGFwczovLycsXG5cdFx0XHRcdFx0dmFsdWUgICAgOiAnMScsXG5cdFx0XHRcdFx0c2VsZWN0ZWQgOiBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCd1c2VUTFMnKT09PScxJ1xuXHRcdFx0XHR9XG5cdFx0XHRdLFxuXHRcdH0pO1xuXG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXREaXNhYmxlZFVzZXJzKCk7XG5cblx0XHQvLyBIYW5kbGUgZmluZCB1c2VyIGluIGNvbmZsaWN0IHJvdyBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAndHIuZmluZC11c2VyLXJvdycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0Y29uc3Qgc2VhcmNoVmFsdWUgPSAgYGlkOiR7cmVjb3JkSWR9YDtcblx0XHRcdHdpbmRvdy5vcGVuKCBgJHtnbG9iYWxSb290VXJsfWV4dGVuc2lvbnMvaW5kZXgvP3NlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWFyY2hWYWx1ZSl9YCwgJ19ibGFuaycpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIG9wZW4gdXNlciBpbiBzeW5jIHRhYmxlIHJvdyBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAndHIub3Blbi11c2VyLXJvdycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0d2luZG93Lm9wZW4oIGAke2dsb2JhbFJvb3RVcmx9ZXh0ZW5zaW9ucy9tb2RpZnkvJHtlbmNvZGVVUklDb21wb25lbnQocmVjb3JkSWQpfWAsICdfYmxhbmsnKTtcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBjaGFuZ2UgTERBUCBkcm9wZG93bi5cblx0ICovXG5cdG9uQ2hhbmdlTGRhcFR5cGUodmFsdWUpe1xuXHRcdGlmKHZhbHVlPT09J09wZW5MREFQJyl7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdzZXQgdmFsdWUnLCd1c2VySWRBdHRyaWJ1dGUnLCd1aWQnKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsJ2FkbWluaXN0cmF0aXZlTG9naW4nLCdjbj1hZG1pbixkYz1leGFtcGxlLGRjPWNvbScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywndXNlckZpbHRlcicsJyhvYmplY3RDbGFzcz1pbmV0T3JnUGVyc29uKScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywnYmFzZUROJywnZGM9ZXhhbXBsZSxkYz1jb20nKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsJ29yZ2FuaXphdGlvbmFsVW5pdCcsJ291PXVzZXJzLCBkYz1kb21haW4sIGRjPWNvbScpO1xuXHRcdH0gZWxzZSBpZih2YWx1ZT09PSdBY3RpdmVEaXJlY3RvcnknKXtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsJ2FkbWluaXN0cmF0aXZlTG9naW4nLCdhZG1pbicpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywndXNlcklkQXR0cmlidXRlJywnc2FtYWNjb3VudG5hbWUnKVxuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywndXNlckZpbHRlcicsJygmKG9iamVjdENsYXNzPXVzZXIpKG9iamVjdENhdGVnb3J5PVBFUlNPTikpJyk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdzZXQgdmFsdWUnLCdiYXNlRE4nLCdkYz1leGFtcGxlLGRjPWNvbScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywnb3JnYW5pemF0aW9uYWxVbml0Jywnb3U9dXNlcnMsIGRjPWRvbWFpbiwgZGM9Y29tJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBkaXNhYmxlZC9kZWxldGVkIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0RGlzYWJsZWRVc2Vycygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtZGlzYWJsZWQtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJyNkaXNhYmxlZC11c2Vycy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXIuaGlkZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjZGlzYWJsZWQtdXNlcnMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZURpc2FibGVkVXNlcnNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBkaXNhYmxlZCB1c2VycyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHJlY29yZHMgLSBUaGUgbGlzdCBvZiBkaXNhYmxlZCB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZWNvcmRzKXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwiZGlzYWJsZWQtdXNlcnMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdVc2VyTmFtZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlck51bWJlcicpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlckVtYWlsJykrJzwvdGg+Jztcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+PHRib2R5PidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggY29uZmxpY3RzIGRhdGFcblx0XHQkLmVhY2gocmVjb3JkcywgKGluZGV4LCByZWNvcmQpID0+IHtcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIml0ZW0gZmluZC11c2VyLXJvd1wiIGRhdGEtdmFsdWU9XCIke3JlY29yZFsnZXh0ZW5zaW9uX2lkJ119XCI+YDtcblx0XHRcdGh0bWwgKz0gJzx0ZD48aSBjbGFzcz1cImljb24gdXNlciBvdXRsaW5lXCI+PC9pPicrcmVjb3JkWyduYW1lJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnbnVtYmVyJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnZW1haWwnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBkaXNhYmxlZCB1c2VycyB2aWV3LlxuXHQgKi9cblx0dXBkYXRlRGlzYWJsZWRVc2Vyc1ZpZXcoKXtcblx0XHRpZiAoJChgI2Rpc2FibGVkLXVzZXJzLXJlc3VsdCB0Ym9keSB0cmApLmxlbmd0aD09PTApe1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLnNob3coKTtcblx0XHRcdCQoJyNkaXNhYmxlZC11c2Vycy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZGVsZXRlIHN5bmMgY29uZmxpY3RzIHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdHMgdGFibGVcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3RzKCl7XG5cdFx0Y29uc3Qgc2VydmVySUQgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCdpZCcpO1xuXHRcdGlmICghc2VydmVySUQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlcyBkZWxldGUgc3luYyBjb25mbGljdCByZXF1ZXN0IGFuZCBkZWxldGUgY29uZmxpY3Qgcm93IG9uIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gcmVjb3JkSWRcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3QocmVjb3JkSWQpe1xuXHRcdGlmICghcmVjb3JkSWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZGVsZXRlLXNlcnZlci1jb25mbGljdGAsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5yZWNvcmRJZCA9IHJlY29yZElkO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdCcgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JChgI2NvbmZsaWN0cy1yZXN1bHQgdHJbZGF0YS12YWx1ZT1cIiR7cmVjb3JkSWR9XCJdYCkucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0JyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgbGFzdCBzeW5jIGNvbmZsaWN0c1xuXHQgKi9cblx0YXBpQ2FsbEdldENvbmZsaWN0cygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuaGlkZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGNvbmZsaWN0cyB2aWV3LlxuXHQgKiBAcmV0dXJuIHt2b2lkfVxuXHQgKi9cblx0dXBkYXRlQ29uZmxpY3RzVmlldygpe1xuXHRcdGlmICgkKGAjY29uZmxpY3RzLXJlc3VsdCB0Ym9keSB0cmApLmxlbmd0aD09PTApe1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuc2hvdygpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5oaWRlKCk7XG5cdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLnNob3coKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0TGRhcFVzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1hdmFpbGFibGUtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBDaGVja0dldFVzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIHN5bmMgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbFN5bmNVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9zeW5jLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldENvbmZsaWN0cygpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0RGlzYWJsZWRVc2VycygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgdXNlcidzIGxpc3Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gdXNlcnNMaXN0IC0gVGhlIGxpc3Qgb2YgdXNlcnNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHVzZXJzTGlzdCl7XG5cblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBpbmRleD09PSd1c2VySGFkQ2hhbmdlc09uVGhlU2lkZScpe1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGluZGV4KSsnPC90aD4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGNvbHVtbk5hbWUgPSAkKGBpbnB1dGApLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gJCh0aGlzKS52YWwoKSA9PT0gaW5kZXg7XG5cdFx0XHRcdH0pLmNsb3Nlc3QoJy5maWVsZCcpLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK2NvbHVtbk5hbWUrJzwvdGg+Jztcblx0XHRcdH1cblxuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Ly8gRGV0ZXJtaW5lIHRoZSByb3cgY2xhc3MgYmFzZWQgb24gd2hldGhlciB0aGUgdXNlciBpcyBkaXNhYmxlZFxuXHRcdFx0bGV0IHJvd0NsYXNzID0gdXNlcltNb2R1bGVMZGFwU3luY01vZGlmeS51c2VyRGlzYWJsZWRBdHRyaWJ1dGVdID09PSB0cnVlID8gJ2Rpc2FibGVkJyA6ICdpdGVtJztcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdXNlcnNTeW5jUmVzdWx0IGlzICdjb25mbGljdCcgYW5kIGFkZCBhIGNsYXNzIHRvIGhpZ2hsaWdodCB0aGUgcm93XG5cdFx0XHRpZiAodXNlclsndXNlcnNTeW5jUmVzdWx0J10gPT09ICdDT05GTElDVCcpIHtcblx0XHRcdFx0cm93Q2xhc3MgKz0gJyBuZWdhdGl2ZSc7XG5cdFx0XHR9IGVsc2UgaWYodXNlclsndXNlcnNTeW5jUmVzdWx0J10gPT09ICdVUERBVEVEJyl7XG5cdFx0XHRcdHJvd0NsYXNzICs9ICcgcG9zaXRpdmUnO1xuXHRcdFx0fVxuXG5cdFx0XHRodG1sICs9IGA8dHIgZGF0YS12YWx1ZT1cIiR7dXNlclsnZXh0ZW5zaW9uSWRJbk1pa29QQlgnXX1cIiBjbGFzcz1cIiR7cm93Q2xhc3N9IG9wZW4tdXNlci1yb3dcIj5gO1xuXG5cdFx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGF0dHJJbmRleCwgYXR0clZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNlbGxWYWx1ZSA9IHVzZXJbYXR0ckluZGV4XSB8fCAnJztcblx0XHRcdFx0aWYgKGF0dHJJbmRleCA9PT0gJ3VzZXJzU3luY1Jlc3VsdCcgfHwgYXR0ckluZGV4ID09PSAndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKSB7XG5cdFx0XHRcdFx0aHRtbCArPSAnPHRkPicgKyBNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihjZWxsVmFsdWUpICsgJzwvdGQ+Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRodG1sICs9ICc8dGQ+JyArIGNlbGxWYWx1ZSArICc8L3RkPic7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXG5cdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBjb25mbGljdHMgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb25mbGljdHMgLSBUaGUgbGlzdCBvZiBjb25mbGljdHNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdChjb25mbGljdHMpe1xuXHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJjb25mbGljdHMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFRpbWUnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0U2lkZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RFcnJvck1lc3NhZ2VzJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFVzZXJEYXRhJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD48L3RoPic7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPjx0Ym9keT4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIGNvbmZsaWN0cyBkYXRhXG5cdFx0JC5lYWNoKGNvbmZsaWN0cywgKGluZGV4LCByZWNvcmQpID0+IHtcblx0XHRcdGNvbnN0IHByZXR0eUpTT04gPSBKU09OLnN0cmluZ2lmeShyZWNvcmRbJ3BhcmFtcyddLCBudWxsLCAyKTtcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIml0ZW1cIiBkYXRhLXZhbHVlPVwiJHtyZWNvcmRbJ2lkJ119XCI+YDtcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnbGFzdFRpbWUnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24ocmVjb3JkWydzaWRlJ10pKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2Vycm9ycyddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+PHByZT4nK3ByZXR0eUpTT04rJzwvcHJlPjwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gYDx0ZD48ZGl2IGNsYXNzPVwidWkgaWNvbiBiYXNpYyBidXR0b24gcG9wdXBlZCBkZWxldGUtY29uZmxpY3RcIiBkYXRhLWNvbnRlbnQ9XCIke01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdkZWxldGVDdXJyZW50Q29uZmxpY3QnKX1cIj48aSBjbGFzcz1cImljb24gdHJhc2ggcmVkXCI+PC9pPjwvZGl2PjwvdGQ+YDtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3Rib2R5PjwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gdGV4dCB1c2luZyB0aGUgZ2xvYmFsIHRyYW5zbGF0aW9uIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBiZSB0cmFuc2xhdGVkLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgdHJhbnNsYXRlZCB0ZXh0IGlmIGF2YWlsYWJsZSwgb3IgdGhlIG9yaWdpbmFsIHRleHQuXG5cdCAqL1xuXHRnZXRUcmFuc2xhdGlvbih0ZXh0KXtcblx0XHRpZiAodGV4dC5sZW5ndGg9PT0wKXtcblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH1cblx0XHRjb25zdCBuYW1lVGVtcGxhdGUgPSBgbW9kdWxlX2xkYXBfJHt0ZXh0fWA7XG5cdFx0Y29uc3QgbmFtZSA9IGdsb2JhbFRyYW5zbGF0ZVtuYW1lVGVtcGxhdGVdO1xuXHRcdGlmIChuYW1lIT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=