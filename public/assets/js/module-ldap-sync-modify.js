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
    ModuleLdapSyncModify.apiCallGetDisabledUsers(); // Handle find user button click

    $('body').on('click', '.find-user', function (e) {
      e.preventDefault();
      var recordId = $(e.target).closest('tr').data('value');
      var searchValue = "id:".concat(recordId);
      window.location.href = "".concat(globalRootUrl, "extensions/index/?search=").concat(encodeURIComponent(searchValue));
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
    html += '<th></th>';
    html += '</tr></thead><tbody>'; // Generate the HTML table with conflicts data

    $.each(records, function (index, record) {
      html += "<tr class=\"item\" data-value=\"".concat(record['id'], "\">");
      html += '<td>' + record['number'] + '</td>';
      html += '<td>' + record['name'] + '</td>';
      html += "<td><div class=\"ui icon basic button popuped find-user\" data-content=\"".concat(ModuleLdapSyncModify.getTranslation('findExtension'), "\"><i class=\"icon user outline\"></i></div></td>");
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
      var rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item';
      html += "<tr class=\"".concat(rowClass, "\">");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRsc0Ryb3Bkb3duIiwiJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyIiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJOYW1lQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyTW9iaWxlQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFeHRlbnNpb25BdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5IiwidXNlckVtYWlsQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckFjY291bnRDb250cm9sIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwidGFiIiwicmVjb3JkSWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YSIsImFwaUNhbGxEZWxldGVDb25mbGljdCIsImFwaUNhbGxHZXRDb25mbGljdHMiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3RzIiwidXBkYXRlQ29uZmxpY3RzVmlldyIsInZhbHVlcyIsIm5hbWUiLCJ2YWx1ZSIsInNlbGVjdGVkIiwiZm9ybSIsInVwZGF0ZURpc2FibGVkVXNlcnNWaWV3IiwiYXBpQ2FsbEdldERpc2FibGVkVXNlcnMiLCJzZWFyY2hWYWx1ZSIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImdsb2JhbFJvb3RVcmwiLCJlbmNvZGVVUklDb21wb25lbnQiLCJzZXJ2ZXJJRCIsImFwaSIsInVybCIsIkNvbmZpZyIsInBieFVybCIsIm1ldGhvZCIsImJlZm9yZVNlbmQiLCJzZXR0aW5ncyIsImlkIiwic3VjY2Vzc1Rlc3QiLCJQYnhBcGkiLCJvblN1Y2Nlc3MiLCJyZXNwb25zZSIsInJlbW92ZSIsImhpZGUiLCJodG1sIiwiYnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdCIsImFmdGVyIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsInJlY29yZHMiLCJnZXRUcmFuc2xhdGlvbiIsImVhY2giLCJpbmRleCIsInJlY29yZCIsImxlbmd0aCIsInNob3ciLCJidWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QiLCJ1c2Vyc0xpc3QiLCJ1bmlxdWVBdHRyaWJ1dGVzIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluY2x1ZGVzIiwiY29sdW1uTmFtZSIsImZpbHRlciIsInZhbCIsImZpbmQiLCJ0ZXh0IiwidXNlciIsInJvd0NsYXNzIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwiY29uZmxpY3RzIiwicHJldHR5SlNPTiIsInN0cmluZ2lmeSIsIm5hbWVUZW1wbGF0ZSIsInVuZGVmaW5lZCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJvYmoiLCJpbnB1dCIsImF0dHIiLCJjaGVja2JveCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsb0JBQW9CLEdBQUc7QUFFNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsd0JBQUQsQ0FOaUI7O0FBUTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGlCQUFpQixFQUFFRCxDQUFDLENBQUMsb0JBQUQsQ0FaUTs7QUFjNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsb0JBQW9CLEVBQUVGLENBQUMsQ0FBQyx1QkFB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IHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgUGJ4QXBpLCBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsIG1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMsIENvbmZpZywgVXNlck1lc3NhZ2UgKi9cblxuLyoqXG4gKiBNb2R1bGVMZGFwU3luY01vZGlmeVxuICpcbiAqIFRoaXMgb2JqZWN0IGhhbmRsZXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2Ygc3luY2hyb25pemluZyBMREFQIHVzZXJzIGFuZFxuICogb3RoZXIgcmVsYXRlZCBmZWF0dXJlcy5cbiAqL1xuY29uc3QgTW9kdWxlTGRhcFN5bmNNb2RpZnkgPSB7XG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBmb3JtLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGZvcm1PYmo6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLWZvcm0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHNlcnZlciB0eXBlIGRyb3Bkb3duLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBUeXBlRHJvcGRvd246ICQoJy5zZWxlY3QtbGRhcC1maWVsZCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZ2V0dGluZyBMREFQIHVzZXJzIGxpc3QgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGNoZWNrR2V0VXNlcnNCdXR0b246ICQoJy5jaGVjay1sZGFwLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBjaGVjayBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBDaGVja0dldFVzZXJzU2VnbWVudDogJCgnI2xkYXAtY2hlY2stZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzeW5jIExEQVAgdXNlcnMgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc0J1dHRvbjogJCgnLmxkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBzeW5jIHVzZXJzIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzU2VnbWVudDogJCgnI2xkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIHVzZXIgZGlzYWJsZWQgYXR0cmlidXRlIGlkXG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHR1c2VyRGlzYWJsZWRBdHRyaWJ1dGU6IG1vZHVsZV9sZGFwX3VzZXJEaXNhYmxlZEF0dHJpYnV0ZSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCBoaWRkZW4gdXNlcnMgYXR0cmlidXRlc1xuXHQgKiBAdHlwZSB7YXJyYXl9XG5cdCAqL1xuXHRoaWRkZW5BdHRyaWJ1dGVzOiBKU09OLnBhcnNlKG1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbWFuIHRhYiBtZW51LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JG1haW5UYWJNZW51OiAkKCcjbW9kdWxlLWxkYXAtc3luYy1tb2RpZnktbWVudSAgLml0ZW0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1lc3NhZ2Ugbm8gYW55IGNvbmZsaWN0c1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXI6ICQoJyNuby1hbnktY29uZmxpY3RzLXBsYWNlaG9sZGVyJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBidXR0b24gdG8gZGVsZXRlIGFsbCBjb25mbGljdHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRkZWxldGVBbGxDb25mbGljdHNCdXR0b246ICQoJyNkZWxldGUtYWxsLWNvbmZsaWN0cy1idXR0b24nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1vZHVsZSBzdGF0dXMgdG9nZ2xlXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHVzZSBUTFMgc2VsZWN0b3Jcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCR1c2VUbHNEcm9wZG93bjogJCgnLnVzZS10bHMtZHJvcGRvd24nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1lc3NhZ2Ugbm8gYW55IGRpc2FibGVkIHVzZXJzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXI6ICQoJyNuby1hbnktZGlzYWJsZWQtdXNlcnMtcGxhY2Vob2xkZXInKSxcblxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgZm9ybSBmaWVsZHMuXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0c2VydmVyTmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlck5hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZXJ2ZXJQb3J0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyUG9ydCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlTG9naW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZUxvZ2luJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRiYXNlRE46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYXNlRE4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJOYW1lQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlck5hbWVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlck1vYmlsZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJNb2JpbGVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRXh0ZW5zaW9uQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckV4dGVuc2lvbkF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJFbWFpbEF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFbWFpbEF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFbWFpbEF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckFjY291bnRDb250cm9sOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckFjY291bnRDb250cm9sJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHQvLyBIYW5kbGUgZ2V0IHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldExkYXBVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsU3luY1VzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbWFpblRhYk1lbnUudGFiKCk7XG5cblx0XHQvLyBIYW5kbGUgZGVsZXRlIGNvbmZsaWN0IGJ1dHRvbiBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRlbGV0ZS1jb25mbGljdCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbERlbGV0ZUNvbmZsaWN0KHJlY29yZElkKTtcblx0XHR9KTtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0Q29uZmxpY3RzKCk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxEZWxldGVDb25mbGljdHMoKTtcblx0XHR9KTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblxuXHRcdC8vIEhhbmRsZSBjaGFuZ2UgVExTIHByb3RvY29sXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHVzZVRsc0Ryb3Bkb3duLmRyb3Bkb3duKHtcblx0XHRcdHZhbHVlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZTogJ2xkYXA6Ly8nLFxuXHRcdFx0XHRcdHZhbHVlOiAnMCcsXG5cdFx0XHRcdFx0c2VsZWN0ZWQgOiBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCd1c2VUTFMnKT09PScwJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZSAgICAgOiAnbGRhcHM6Ly8nLFxuXHRcdFx0XHRcdHZhbHVlICAgIDogJzEnLFxuXHRcdFx0XHRcdHNlbGVjdGVkIDogTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywndXNlVExTJyk9PT0nMSdcblx0XHRcdFx0fVxuXHRcdFx0XSxcblx0XHR9KTtcblxuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlRGlzYWJsZWRVc2Vyc1ZpZXcoKTtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0RGlzYWJsZWRVc2VycygpO1xuXG5cdFx0Ly8gSGFuZGxlIGZpbmQgdXNlciBidXR0b24gY2xpY2tcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5maW5kLXVzZXInLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCByZWNvcmRJZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RyJykuZGF0YSgndmFsdWUnKTtcblx0XHRcdGNvbnN0IHNlYXJjaFZhbHVlID0gIGBpZDoke3JlY29yZElkfWA7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAke2dsb2JhbFJvb3RVcmx9ZXh0ZW5zaW9ucy9pbmRleC8/c2VhcmNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFZhbHVlKX1gO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBkaXNhYmxlZC9kZWxldGVkIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0RGlzYWJsZWRVc2Vycygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtZGlzYWJsZWQtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJyNkaXNhYmxlZC11c2Vycy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXIuaGlkZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjZGlzYWJsZWQtdXNlcnMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZURpc2FibGVkVXNlcnNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBkaXNhYmxlZCB1c2VycyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHJlY29yZHMgLSBUaGUgbGlzdCBvZiBkaXNhYmxlZCB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZWNvcmRzKXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwiZGlzYWJsZWQtdXNlcnMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdVc2VyTmFtZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlck51bWJlcicpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+PC90aD4nO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD48dGJvZHk+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCBjb25mbGljdHMgZGF0YVxuXHRcdCQuZWFjaChyZWNvcmRzLCAoaW5kZXgsIHJlY29yZCkgPT4ge1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiaXRlbVwiIGRhdGEtdmFsdWU9XCIke3JlY29yZFsnaWQnXX1cIj5gO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydudW1iZXInXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWyduYW1lJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gYDx0ZD48ZGl2IGNsYXNzPVwidWkgaWNvbiBiYXNpYyBidXR0b24gcG9wdXBlZCBmaW5kLXVzZXJcIiBkYXRhLWNvbnRlbnQ9XCIke01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdmaW5kRXh0ZW5zaW9uJyl9XCI+PGkgY2xhc3M9XCJpY29uIHVzZXIgb3V0bGluZVwiPjwvaT48L2Rpdj48L3RkPmA7XG5cdFx0XHRodG1sICs9ICc8L3RyPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90Ym9keT48L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGRpc2FibGVkIHVzZXJzIHZpZXcuXG5cdCAqL1xuXHR1cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpe1xuXHRcdGlmICgkKGAjZGlzYWJsZWQtdXNlcnMtcmVzdWx0IHRib2R5IHRyYCkubGVuZ3RoPT09MCl7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXIuc2hvdygpO1xuXHRcdFx0JCgnI2Rpc2FibGVkLXVzZXJzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBkZWxldGUgc3luYyBjb25mbGljdHMgcmVxdWVzdCBhbmQgZGVsZXRlIGNvbmZsaWN0cyB0YWJsZVxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGFwaUNhbGxEZWxldGVDb25mbGljdHMoKXtcblx0XHRjb25zdCBzZXJ2ZXJJRCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ2lkJyk7XG5cdFx0aWYgKCFzZXJ2ZXJJRCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZGVsZXRlLXNlcnZlci1jb25mbGljdHNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEuaWQgPSBzZXJ2ZXJJRDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGRlbGV0ZSBzeW5jIGNvbmZsaWN0IHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdCByb3cgb24gdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSByZWNvcmRJZFxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGFwaUNhbGxEZWxldGVDb25mbGljdChyZWNvcmRJZCl7XG5cdFx0aWYgKCFyZWNvcmRJZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9kZWxldGUtc2VydmVyLWNvbmZsaWN0YCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLnJlY29yZElkID0gcmVjb3JkSWQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0JyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKGAjY29uZmxpY3RzLXJlc3VsdCB0cltkYXRhLXZhbHVlPVwiJHtyZWNvcmRJZH1cIl1gKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3QnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBsYXN0IHN5bmMgY29uZmxpY3RzXG5cdCAqL1xuXHRhcGlDYWxsR2V0Q29uZmxpY3RzKCl7XG5cdFx0Y29uc3Qgc2VydmVySUQgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCdpZCcpO1xuXHRcdGlmICghc2VydmVySUQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZ2V0LXNlcnZlci1jb25mbGljdHNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEuaWQgPSBzZXJ2ZXJJRDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5oaWRlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0aGUgY29uZmxpY3RzIHZpZXcuXG5cdCAqIEByZXR1cm4ge3ZvaWR9XG5cdCAqL1xuXHR1cGRhdGVDb25mbGljdHNWaWV3KCl7XG5cdFx0aWYgKCQoYCNjb25mbGljdHMtcmVzdWx0IHRib2R5IHRyYCkubGVuZ3RoPT09MCl7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5zaG93KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLmhpZGUoKTtcblx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24uc2hvdygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gZ2V0IExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxHZXRMZGFwVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gc3luYyBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsU3luY1VzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0Q29uZmxpY3RzKCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSB1c2VyJ3MgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB1c2Vyc0xpc3QgLSBUaGUgbGlzdCBvZiB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QodXNlcnNMaXN0KXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBpbmRleD09PSd1c2VySGFkQ2hhbmdlc09uVGhlU2lkZScpe1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGluZGV4KSsnPC90aD4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGNvbHVtbk5hbWUgPSAkKGBpbnB1dGApLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gJCh0aGlzKS52YWwoKSA9PT0gaW5kZXg7XG5cdFx0XHRcdH0pLmNsb3Nlc3QoJy5maWVsZCcpLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK2NvbHVtbk5hbWUrJzwvdGg+Jztcblx0XHRcdH1cblxuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Y29uc3Qgcm93Q2xhc3MgPSB1c2VyW01vZHVsZUxkYXBTeW5jTW9kaWZ5LnVzZXJEaXNhYmxlZEF0dHJpYnV0ZV09PT10cnVlPydkaXNhYmxlZCc6J2l0ZW0nO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiJHtyb3dDbGFzc31cIj5gO1xuXHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjZWxsVmFsdWUgPSB1c2VyW2F0dHJJbmRleF0gfHwgJyc7XG5cdFx0XHRcdGlmIChhdHRySW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBhdHRySW5kZXg9PT0ndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKXtcblx0XHRcdFx0XHRodG1sICs9Jzx0ZD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGNlbGxWYWx1ZSkrJzwvdGQ+Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRodG1sICs9ICc8dGQ+JytjZWxsVmFsdWUrJzwvdGQ+Jztcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIHRhYmxlIGZyb20gdGhlIGNvbmZsaWN0cyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvbmZsaWN0cyAtIFRoZSBsaXN0IG9mIGNvbmZsaWN0c1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0KGNvbmZsaWN0cyl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImNvbmZsaWN0cy1yZXN1bHRcIj4nO1xuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgY29uZmxpY3RzIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0VGltZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RTaWRlJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdEVycm9yTWVzc2FnZXMnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0VXNlckRhdGEnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPjwvdGg+Jztcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+PHRib2R5PidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggY29uZmxpY3RzIGRhdGFcblx0XHQkLmVhY2goY29uZmxpY3RzLCAoaW5kZXgsIHJlY29yZCkgPT4ge1xuXHRcdFx0Y29uc3QgcHJldHR5SlNPTiA9IEpTT04uc3RyaW5naWZ5KHJlY29yZFsncGFyYW1zJ10sIG51bGwsIDIpO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiaXRlbVwiIGRhdGEtdmFsdWU9XCIke3JlY29yZFsnaWQnXX1cIj5gO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydsYXN0VGltZSddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihyZWNvcmRbJ3NpZGUnXSkrJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnZXJyb3JzJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD48cHJlPicrcHJldHR5SlNPTisnPC9wcmU+PC90ZD4nO1xuXHRcdFx0aHRtbCArPSBgPHRkPjxkaXYgY2xhc3M9XCJ1aSBpY29uIGJhc2ljIGJ1dHRvbiBwb3B1cGVkIGRlbGV0ZS1jb25mbGljdFwiIGRhdGEtY29udGVudD1cIiR7TW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ2RlbGV0ZUN1cnJlbnRDb25mbGljdCcpfVwiPjxpIGNsYXNzPVwiaWNvbiB0cmFzaCByZWRcIj48L2k+PC9kaXY+PC90ZD5gO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmFuc2xhdGVzIHRoZSBnaXZlbiB0ZXh0IHVzaW5nIHRoZSBnbG9iYWwgdHJhbnNsYXRpb24gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHRyYW5zbGF0ZWQuXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmFuc2xhdGVkIHRleHQgaWYgYXZhaWxhYmxlLCBvciB0aGUgb3JpZ2luYWwgdGV4dC5cblx0ICovXG5cdGdldFRyYW5zbGF0aW9uKHRleHQpe1xuXHRcdGlmICh0ZXh0Lmxlbmd0aD09PTApe1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXHRcdGNvbnN0IG5hbWVUZW1wbGF0ZSA9IGBtb2R1bGVfbGRhcF8ke3RleHR9YDtcblx0XHRjb25zdCBuYW1lID0gZ2xvYmFsVHJhbnNsYXRlW25hbWVUZW1wbGF0ZV07XG5cdFx0aWYgKG5hbWUhPT11bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBuYW1lO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBUaGUgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBzZXR0aW5ncyBvYmplY3QuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5maW5kKCcuY2hlY2tib3gnKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRjb25zdCBpbnB1dCA9ICQob2JqKS5maW5kKCdpbnB1dCcpO1xuXHRcdFx0Y29uc3QgaWQgPSBpbnB1dC5hdHRyKCdpZCcpO1xuXHRcdFx0aWYgKCQob2JqKS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRcdHJlc3VsdC5kYXRhW2lkXT0nMSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzAnO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblx0XHQvLyBDYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==