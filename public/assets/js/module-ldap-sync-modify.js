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
    ModuleLdapSyncModify.$ldapTypeDropdown.dropdown();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRsc0Ryb3Bkb3duIiwiJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyIiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJOYW1lQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyTW9iaWxlQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFeHRlbnNpb25BdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5IiwidXNlckVtYWlsQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckFjY291bnRDb250cm9sIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwidGFiIiwicmVjb3JkSWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YSIsImFwaUNhbGxEZWxldGVDb25mbGljdCIsImFwaUNhbGxHZXRDb25mbGljdHMiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3RzIiwidXBkYXRlQ29uZmxpY3RzVmlldyIsInZhbHVlcyIsIm5hbWUiLCJ2YWx1ZSIsInNlbGVjdGVkIiwiZm9ybSIsInVwZGF0ZURpc2FibGVkVXNlcnNWaWV3IiwiYXBpQ2FsbEdldERpc2FibGVkVXNlcnMiLCJzZWFyY2hWYWx1ZSIsIndpbmRvdyIsIm9wZW4iLCJnbG9iYWxSb290VXJsIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwic2VydmVySUQiLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJpZCIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmUiLCJoaWRlIiwiaHRtbCIsImJ1aWxkVGFibGVGcm9tRGlzYWJsZWRVc2Vyc0xpc3QiLCJhZnRlciIsIm9uRmFpbHVyZSIsIlVzZXJNZXNzYWdlIiwic2hvd011bHRpU3RyaW5nIiwibWVzc2FnZXMiLCJyZWNvcmRzIiwiZ2V0VHJhbnNsYXRpb24iLCJlYWNoIiwiaW5kZXgiLCJyZWNvcmQiLCJsZW5ndGgiLCJzaG93IiwiYnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0IiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0IiwidXNlcnNMaXN0IiwidW5pcXVlQXR0cmlidXRlcyIsInVzZXJLZXkiLCJ1c2VyVmFsdWUiLCJpbmNsdWRlcyIsImNvbHVtbk5hbWUiLCJmaWx0ZXIiLCJ2YWwiLCJmaW5kIiwidGV4dCIsInVzZXIiLCJyb3dDbGFzcyIsImF0dHJJbmRleCIsImF0dHJWYWx1ZSIsImNlbGxWYWx1ZSIsImNvbmZsaWN0cyIsInByZXR0eUpTT04iLCJzdHJpbmdpZnkiLCJuYW1lVGVtcGxhdGUiLCJ1bmRlZmluZWQiLCJjYkJlZm9yZVNlbmRGb3JtIiwicmVzdWx0Iiwib2JqIiwiaW5wdXQiLCJhdHRyIiwiY2hlY2tib3giLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLG9CQUFvQixHQUFHO0FBRTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLHdCQUFELENBTmlCOztBQVE1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLG9CQUFELENBWlE7O0FBYzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NFLEVBQUFBLG9CQUFvQixFQUFFRixDQUFDLENBQUMsdUJBQUQsQ0FsQks7O0FB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QWdCLEdBQWhCO0FBQ0E7QUFDRCxLQVJEO0FBVUEsV0FBTzhDLE1BQVA7QUFDQSxHQXhxQjJCOztBQTBxQjVCO0FBQ0Q7QUFDQTtBQUNDSyxFQUFBQSxlQTdxQjRCLDZCQTZxQlYsQ0FDakI7QUFDQSxHQS9xQjJCOztBQWlyQjVCO0FBQ0Q7QUFDQTtBQUNDdEYsRUFBQUEsY0FwckI0Qiw0QkFvckJYO0FBQ2hCdUYsSUFBQUEsSUFBSSxDQUFDdEksUUFBTCxHQUFnQkQsb0JBQW9CLENBQUNDLFFBQXJDO0FBQ0FzSSxJQUFBQSxJQUFJLENBQUMxRCxHQUFMLGFBQWNKLGFBQWQ7QUFDQThELElBQUFBLElBQUksQ0FBQ25ILGFBQUwsR0FBcUJwQixvQkFBb0IsQ0FBQ29CLGFBQTFDO0FBQ0FtSCxJQUFBQSxJQUFJLENBQUNQLGdCQUFMLEdBQXdCaEksb0JBQW9CLENBQUNnSSxnQkFBN0M7QUFDQU8sSUFBQUEsSUFBSSxDQUFDRCxlQUFMLEdBQXVCdEksb0JBQW9CLENBQUNzSSxlQUE1QztBQUNBQyxJQUFBQSxJQUFJLENBQUN6RixVQUFMO0FBQ0E7QUEzckIyQixDQUE3QjtBQThyQkE1QyxDQUFDLENBQUNzSSxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCekksRUFBQUEsb0JBQW9CLENBQUM4QyxVQUFyQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwgZ2xvYmFsVHJhbnNsYXRlLCBGb3JtLCBQYnhBcGksIG1vZHVsZV9sZGFwX3VzZXJEaXNhYmxlZEF0dHJpYnV0ZSwgbW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcywgQ29uZmlnLCBVc2VyTWVzc2FnZSAqL1xuXG4vKipcbiAqIE1vZHVsZUxkYXBTeW5jTW9kaWZ5XG4gKlxuICogVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBzeW5jaHJvbml6aW5nIExEQVAgdXNlcnMgYW5kXG4gKiBvdGhlciByZWxhdGVkIGZlYXR1cmVzLlxuICovXG5jb25zdCBNb2R1bGVMZGFwU3luY01vZGlmeSA9IHtcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGZvcm0uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS1sZGFwLXN5bmMtZm9ybScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc2VydmVyIHR5cGUgZHJvcGRvd24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcFR5cGVEcm9wZG93bjogJCgnLnNlbGVjdC1sZGFwLWZpZWxkJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBnZXR0aW5nIExEQVAgdXNlcnMgbGlzdCBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkY2hlY2tHZXRVc2Vyc0J1dHRvbjogJCgnLmNoZWNrLWxkYXAtZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIGNoZWNrIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50OiAkKCcjbGRhcC1jaGVjay1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN5bmMgTERBUCB1c2VycyBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzQnV0dG9uOiAkKCcubGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIHN5bmMgdXNlcnMgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNTZWdtZW50OiAkKCcjbGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggdXNlciBkaXNhYmxlZCBhdHRyaWJ1dGUgaWRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdHVzZXJEaXNhYmxlZEF0dHJpYnV0ZTogbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIGhpZGRlbiB1c2VycyBhdHRyaWJ1dGVzXG5cdCAqIEB0eXBlIHthcnJheX1cblx0ICovXG5cdGhpZGRlbkF0dHJpYnV0ZXM6IEpTT04ucGFyc2UobW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtYW4gdGFiIG1lbnUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbWFpblRhYk1lbnU6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS1tZW51ICAuaXRlbScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbWVzc2FnZSBubyBhbnkgY29uZmxpY3RzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlcjogJCgnI25vLWFueS1jb25mbGljdHMtcGxhY2Vob2xkZXInKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGJ1dHRvbiB0byBkZWxldGUgYWxsIGNvbmZsaWN0c1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbjogJCgnI2RlbGV0ZS1hbGwtY29uZmxpY3RzLWJ1dHRvbicpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbW9kdWxlIHN0YXR1cyB0b2dnbGVcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlIFRMUyBzZWxlY3RvclxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHVzZVRsc0Ryb3Bkb3duOiAkKCcudXNlLXRscy1kcm9wZG93bicpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbWVzc2FnZSBubyBhbnkgZGlzYWJsZWQgdXNlcnNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRub0FueURpc2FibGVkVXNlcnNQbGFjZWhvbGRlcjogJCgnI25vLWFueS1kaXNhYmxlZC11c2Vycy1wbGFjZWhvbGRlcicpLFxuXG5cblx0LyoqXG5cdCAqIFZhbGlkYXRpb24gcnVsZXMgZm9yIHRoZSBmb3JtIGZpZWxkcy5cblx0ICogQHR5cGUge09iamVjdH1cblx0ICovXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRzZXJ2ZXJOYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyTmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHNlcnZlclBvcnQ6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJQb3J0Jyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVMb2dpbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlTG9naW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGJhc2VETjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2Jhc2VETicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUJhc2VETklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlck5hbWVBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyTmFtZUF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJOYW1lQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyTW9iaWxlQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlck1vYmlsZUF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJNb2JpbGVBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJFeHRlbnNpb25BdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyRXh0ZW5zaW9uQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckV4dGVuc2lvbkF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckVtYWlsQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckVtYWlsQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckVtYWlsQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyQWNjb3VudENvbnRyb2w6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyQWNjb3VudENvbnRyb2wnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcFR5cGVEcm9wZG93bi5kcm9wZG93bigpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZUZvcm0oKTtcblxuXHRcdC8vIEhhbmRsZSBnZXQgdXNlcnMgbGlzdCBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0TGRhcFVzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxTeW5jVXNlcnMoKTtcblx0XHR9KTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRtYWluVGFiTWVudS50YWIoKTtcblxuXHRcdC8vIEhhbmRsZSBkZWxldGUgY29uZmxpY3QgYnV0dG9uIGNsaWNrXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICcuZGVsZXRlLWNvbmZsaWN0JywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgcmVjb3JkSWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmRhdGEoJ3ZhbHVlJyk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsRGVsZXRlQ29uZmxpY3QocmVjb3JkSWQpO1xuXHRcdH0pO1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRDb25mbGljdHMoKTtcblxuXHRcdC8vIEhhbmRsZSBzeW5jIHVzZXJzIGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbERlbGV0ZUNvbmZsaWN0cygpO1xuXHRcdH0pO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXG5cdFx0Ly8gSGFuZGxlIGNoYW5nZSBUTFMgcHJvdG9jb2xcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdXNlVGxzRHJvcGRvd24uZHJvcGRvd24oe1xuXHRcdFx0dmFsdWVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lOiAnbGRhcDovLycsXG5cdFx0XHRcdFx0dmFsdWU6ICcwJyxcblx0XHRcdFx0XHRzZWxlY3RlZCA6IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ3VzZVRMUycpPT09JzAnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lICAgICA6ICdsZGFwczovLycsXG5cdFx0XHRcdFx0dmFsdWUgICAgOiAnMScsXG5cdFx0XHRcdFx0c2VsZWN0ZWQgOiBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCd1c2VUTFMnKT09PScxJ1xuXHRcdFx0XHR9XG5cdFx0XHRdLFxuXHRcdH0pO1xuXG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXREaXNhYmxlZFVzZXJzKCk7XG5cblx0XHQvLyBIYW5kbGUgZmluZCB1c2VyIGluIGNvbmZsaWN0IHJvdyBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAndHIuZmluZC11c2VyLXJvdycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0Y29uc3Qgc2VhcmNoVmFsdWUgPSAgYGlkOiR7cmVjb3JkSWR9YDtcblx0XHRcdHdpbmRvdy5vcGVuKCBgJHtnbG9iYWxSb290VXJsfWV4dGVuc2lvbnMvaW5kZXgvP3NlYXJjaD0ke2VuY29kZVVSSUNvbXBvbmVudChzZWFyY2hWYWx1ZSl9YCwgJ19ibGFuaycpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIG9wZW4gdXNlciBpbiBzeW5jIHRhYmxlIHJvdyBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAndHIub3Blbi11c2VyLXJvdycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0d2luZG93Lm9wZW4oIGAke2dsb2JhbFJvb3RVcmx9ZXh0ZW5zaW9ucy9tb2RpZnkvJHtlbmNvZGVVUklDb21wb25lbnQocmVjb3JkSWQpfWAsICdfYmxhbmsnKTtcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgZGlzYWJsZWQvZGVsZXRlZCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbEdldERpc2FibGVkVXNlcnMoKXtcblx0XHRjb25zdCBzZXJ2ZXJJRCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ2lkJyk7XG5cdFx0aWYgKCFzZXJ2ZXJJRCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtZGlzYWJsZWQtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5pZCA9IHNlcnZlcklEO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWRpc2FibGVkLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcjZGlzYWJsZWQtdXNlcnMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLmhpZGUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tRGlzYWJsZWRVc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueURpc2FibGVkVXNlcnNQbGFjZWhvbGRlci5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlRGlzYWJsZWRVc2Vyc1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtZGlzYWJsZWQtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2Rpc2FibGVkLXVzZXJzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgZGlzYWJsZWQgdXNlcnMgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSByZWNvcmRzIC0gVGhlIGxpc3Qgb2YgZGlzYWJsZWQgdXNlcnNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tRGlzYWJsZWRVc2Vyc0xpc3QocmVjb3Jkcyl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImRpc2FibGVkLXVzZXJzLXJlc3VsdFwiPic7XG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCBjb25mbGljdHMgZGF0YSBhdHRyaWJ1dGVzXG5cdFx0aHRtbCArPSAnPHRoZWFkPjx0cj4nXG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlck5hbWUnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ1VzZXJOdW1iZXInKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ1VzZXJFbWFpbCcpKyc8L3RoPic7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPjx0Ym9keT4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIGNvbmZsaWN0cyBkYXRhXG5cdFx0JC5lYWNoKHJlY29yZHMsIChpbmRleCwgcmVjb3JkKSA9PiB7XG5cdFx0XHRodG1sICs9IGA8dHIgY2xhc3M9XCJpdGVtIGZpbmQtdXNlci1yb3dcIiBkYXRhLXZhbHVlPVwiJHtyZWNvcmRbJ2V4dGVuc2lvbl9pZCddfVwiPmA7XG5cdFx0XHRodG1sICs9ICc8dGQ+PGkgY2xhc3M9XCJpY29uIHVzZXIgb3V0bGluZVwiPjwvaT4nK3JlY29yZFsnbmFtZSddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ251bWJlciddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2VtYWlsJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3Rib2R5PjwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblx0LyoqXG5cdCAqIFVwZGF0ZSB0aGUgZGlzYWJsZWQgdXNlcnMgdmlldy5cblx0ICovXG5cdHVwZGF0ZURpc2FibGVkVXNlcnNWaWV3KCl7XG5cdFx0aWYgKCQoYCNkaXNhYmxlZC11c2Vycy1yZXN1bHQgdGJvZHkgdHJgKS5sZW5ndGg9PT0wKXtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueURpc2FibGVkVXNlcnNQbGFjZWhvbGRlci5zaG93KCk7XG5cdFx0XHQkKCcjZGlzYWJsZWQtdXNlcnMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGRlbGV0ZSBzeW5jIGNvbmZsaWN0cyByZXF1ZXN0IGFuZCBkZWxldGUgY29uZmxpY3RzIHRhYmxlXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0YXBpQ2FsbERlbGV0ZUNvbmZsaWN0cygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9kZWxldGUtc2VydmVyLWNvbmZsaWN0c2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5pZCA9IHNlcnZlcklEO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblx0LyoqXG5cdCAqIEhhbmRsZXMgZGVsZXRlIHN5bmMgY29uZmxpY3QgcmVxdWVzdCBhbmQgZGVsZXRlIGNvbmZsaWN0IHJvdyBvbiB0aGUgdGFibGVcblx0ICogQHBhcmFtIHJlY29yZElkXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKi9cblx0YXBpQ2FsbERlbGV0ZUNvbmZsaWN0KHJlY29yZElkKXtcblx0XHRpZiAoIXJlY29yZElkKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEucmVjb3JkSWQgPSByZWNvcmRJZDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3QnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoYCNjb25mbGljdHMtcmVzdWx0IHRyW2RhdGEtdmFsdWU9XCIke3JlY29yZElkfVwiXWApLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdCcgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gZ2V0IGxhc3Qgc3luYyBjb25mbGljdHNcblx0ICovXG5cdGFwaUNhbGxHZXRDb25mbGljdHMoKXtcblx0XHRjb25zdCBzZXJ2ZXJJRCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ2lkJyk7XG5cdFx0aWYgKCFzZXJ2ZXJJRCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtc2VydmVyLWNvbmZsaWN0c2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5pZCA9IHNlcnZlcklEO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLmhpZGUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuYWZ0ZXIoaHRtbCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBjb25mbGljdHMgdmlldy5cblx0ICogQHJldHVybiB7dm9pZH1cblx0ICovXG5cdHVwZGF0ZUNvbmZsaWN0c1ZpZXcoKXtcblx0XHRpZiAoJChgI2NvbmZsaWN0cy1yZXN1bHQgdGJvZHkgdHJgKS5sZW5ndGg9PT0wKXtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLnNob3coKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24uaGlkZSgpO1xuXHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5zaG93KCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbEdldExkYXBVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBzeW5jIExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxTeW5jVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvc3luYy1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdzeW5jLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRDb25mbGljdHMoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldERpc2FibGVkVXNlcnMoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdzeW5jLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIHRhYmxlIGZyb20gdGhlIHVzZXIncyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHVzZXJzTGlzdCAtIFRoZSBsaXN0IG9mIHVzZXJzXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBIVE1MIHRhYmxlXG5cdCAqL1xuXHRidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCh1c2Vyc0xpc3Qpe1xuXG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImxkYXAtcmVzdWx0XCI+Jztcblx0XHRjb25zdCB1bmlxdWVBdHRyaWJ1dGVzID0ge307XG5cblx0XHQvLyBFeHRyYWN0IHVuaXF1ZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHJlc3BvbnNlIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAodXNlcktleSwgdXNlclZhbHVlKSA9PiB7XG5cdFx0XHQkLmVhY2godXNlclZhbHVlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmIChNb2R1bGVMZGFwU3luY01vZGlmeS5oaWRkZW5BdHRyaWJ1dGVzLmluY2x1ZGVzKGluZGV4KSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmlxdWVBdHRyaWJ1dGVzW2luZGV4XSA9IHRydWU7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgdXNlciBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0aWYgKGluZGV4PT09J3VzZXJzU3luY1Jlc3VsdCcgfHwgaW5kZXg9PT0ndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKXtcblx0XHRcdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihpbmRleCkrJzwvdGg+Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxldCBjb2x1bW5OYW1lID0gJChgaW5wdXRgKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQodGhpcykudmFsKCkgPT09IGluZGV4O1xuXHRcdFx0XHR9KS5jbG9zZXN0KCcuZmllbGQnKS5maW5kKCdsYWJlbCcpLnRleHQoKTtcblx0XHRcdFx0aHRtbCArPSc8dGg+Jytjb2x1bW5OYW1lKyc8L3RoPic7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCB1c2VyIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAoaW5kZXgsIHVzZXIpID0+IHtcblx0XHRcdC8vIERldGVybWluZSB0aGUgcm93IGNsYXNzIGJhc2VkIG9uIHdoZXRoZXIgdGhlIHVzZXIgaXMgZGlzYWJsZWRcblx0XHRcdGxldCByb3dDbGFzcyA9IHVzZXJbTW9kdWxlTGRhcFN5bmNNb2RpZnkudXNlckRpc2FibGVkQXR0cmlidXRlXSA9PT0gdHJ1ZSA/ICdkaXNhYmxlZCcgOiAnaXRlbSc7XG5cblx0XHRcdC8vIENoZWNrIGlmIHVzZXJzU3luY1Jlc3VsdCBpcyAnY29uZmxpY3QnIGFuZCBhZGQgYSBjbGFzcyB0byBoaWdobGlnaHQgdGhlIHJvd1xuXHRcdFx0aWYgKHVzZXJbJ3VzZXJzU3luY1Jlc3VsdCddID09PSAnQ09ORkxJQ1QnKSB7XG5cdFx0XHRcdHJvd0NsYXNzICs9ICcgbmVnYXRpdmUnO1xuXHRcdFx0fSBlbHNlIGlmKHVzZXJbJ3VzZXJzU3luY1Jlc3VsdCddID09PSAnVVBEQVRFRCcpe1xuXHRcdFx0XHRyb3dDbGFzcyArPSAnIHBvc2l0aXZlJztcblx0XHRcdH1cblxuXHRcdFx0aHRtbCArPSBgPHRyIGRhdGEtdmFsdWU9XCIke3VzZXJbJ2V4dGVuc2lvbklkSW5NaWtvUEJYJ119XCIgY2xhc3M9XCIke3Jvd0NsYXNzfSBvcGVuLXVzZXItcm93XCI+YDtcblxuXHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjZWxsVmFsdWUgPSB1c2VyW2F0dHJJbmRleF0gfHwgJyc7XG5cdFx0XHRcdGlmIChhdHRySW5kZXggPT09ICd1c2Vyc1N5bmNSZXN1bHQnIHx8IGF0dHJJbmRleCA9PT0gJ3VzZXJIYWRDaGFuZ2VzT25UaGVTaWRlJykge1xuXHRcdFx0XHRcdGh0bWwgKz0gJzx0ZD4nICsgTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oY2VsbFZhbHVlKSArICc8L3RkPic7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aHRtbCArPSAnPHRkPicgKyBjZWxsVmFsdWUgKyAnPC90ZD4nO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblxuXHRcdGh0bWwgKz0gJzwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgY29uZmxpY3RzIGxpc3Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gY29uZmxpY3RzIC0gVGhlIGxpc3Qgb2YgY29uZmxpY3RzXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBIVE1MIHRhYmxlXG5cdCAqL1xuXHRidWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QoY29uZmxpY3RzKXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwiY29uZmxpY3RzLXJlc3VsdFwiPic7XG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCBjb25mbGljdHMgZGF0YSBhdHRyaWJ1dGVzXG5cdFx0aHRtbCArPSAnPHRoZWFkPjx0cj4nXG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RUaW1lJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFNpZGUnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0RXJyb3JNZXNzYWdlcycpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RVc2VyRGF0YScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+PC90aD4nO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD48dGJvZHk+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCBjb25mbGljdHMgZGF0YVxuXHRcdCQuZWFjaChjb25mbGljdHMsIChpbmRleCwgcmVjb3JkKSA9PiB7XG5cdFx0XHRjb25zdCBwcmV0dHlKU09OID0gSlNPTi5zdHJpbmdpZnkocmVjb3JkWydwYXJhbXMnXSwgbnVsbCwgMik7XG5cdFx0XHRodG1sICs9IGA8dHIgY2xhc3M9XCJpdGVtXCIgZGF0YS12YWx1ZT1cIiR7cmVjb3JkWydpZCddfVwiPmA7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2xhc3RUaW1lJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKHJlY29yZFsnc2lkZSddKSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydlcnJvcnMnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPjxwcmU+JytwcmV0dHlKU09OKyc8L3ByZT48L3RkPic7XG5cdFx0XHRodG1sICs9IGA8dGQ+PGRpdiBjbGFzcz1cInVpIGljb24gYmFzaWMgYnV0dG9uIHBvcHVwZWQgZGVsZXRlLWNvbmZsaWN0XCIgZGF0YS1jb250ZW50PVwiJHtNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignZGVsZXRlQ3VycmVudENvbmZsaWN0Jyl9XCI+PGkgY2xhc3M9XCJpY29uIHRyYXNoIHJlZFwiPjwvaT48L2Rpdj48L3RkPmA7XG5cdFx0XHRodG1sICs9ICc8L3RyPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90Ym9keT48L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRyYW5zbGF0ZXMgdGhlIGdpdmVuIHRleHQgdXNpbmcgdGhlIGdsb2JhbCB0cmFuc2xhdGlvbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gYmUgdHJhbnNsYXRlZC5cblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIHRyYW5zbGF0ZWQgdGV4dCBpZiBhdmFpbGFibGUsIG9yIHRoZSBvcmlnaW5hbCB0ZXh0LlxuXHQgKi9cblx0Z2V0VHJhbnNsYXRpb24odGV4dCl7XG5cdFx0aWYgKHRleHQubGVuZ3RoPT09MCl7XG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cdFx0Y29uc3QgbmFtZVRlbXBsYXRlID0gYG1vZHVsZV9sZGFwXyR7dGV4dH1gO1xuXHRcdGNvbnN0IG5hbWUgPSBnbG9iYWxUcmFuc2xhdGVbbmFtZVRlbXBsYXRlXTtcblx0XHRpZiAobmFtZSE9PXVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIG5hbWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRleHQ7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYmVmb3JlIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBzZXR0aW5ncyAtIFRoZSBzZXR0aW5ncyBvYmplY3QuXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IC0gVGhlIG1vZGlmaWVkIHNldHRpbmdzIG9iamVjdC5cblx0ICovXG5cdGNiQmVmb3JlU2VuZEZvcm0oc2V0dGluZ3MpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcblx0XHRyZXN1bHQuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZpbmQoJy5jaGVja2JveCcpLmVhY2goKGluZGV4LCBvYmopID0+IHtcblx0XHRcdGNvbnN0IGlucHV0ID0gJChvYmopLmZpbmQoJ2lucHV0Jyk7XG5cdFx0XHRjb25zdCBpZCA9IGlucHV0LmF0dHIoJ2lkJyk7XG5cdFx0XHRpZiAoJChvYmopLmNoZWNrYm94KCdpcyBjaGVja2VkJykpIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScxJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdC5kYXRhW2lkXT0nMCc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBhZnRlciBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKi9cblx0Y2JBZnRlclNlbmRGb3JtKCkge1xuXHRcdC8vIENhbGxiYWNrIGltcGxlbWVudGF0aW9uXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBmb3JtLlxuXHQgKi9cblx0aW5pdGlhbGl6ZUZvcm0oKSB7XG5cdFx0Rm9ybS4kZm9ybU9iaiA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqO1xuXHRcdEZvcm0udXJsID0gYCR7Z2xvYmFsUm9vdFVybH1tb2R1bGUtbGRhcC1zeW5jL21vZHVsZS1sZGFwLXN5bmMvc2F2ZWA7XG5cdFx0Rm9ybS52YWxpZGF0ZVJ1bGVzID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkudmFsaWRhdGVSdWxlcztcblx0XHRGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkJlZm9yZVNlbmRGb3JtO1xuXHRcdEZvcm0uY2JBZnRlclNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JBZnRlclNlbmRGb3JtO1xuXHRcdEZvcm0uaW5pdGlhbGl6ZSgpO1xuXHR9LFxufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRNb2R1bGVMZGFwU3luY01vZGlmeS5pbml0aWFsaXplKCk7XG59KTtcblxuIl19