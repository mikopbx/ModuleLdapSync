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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRsc0Ryb3Bkb3duIiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJOYW1lQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyTW9iaWxlQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFeHRlbnNpb25BdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5IiwidXNlckVtYWlsQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckFjY291bnRDb250cm9sIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwidGFiIiwicmVjb3JkSWQiLCJ0YXJnZXQiLCJjbG9zZXN0IiwiZGF0YSIsImFwaUNhbGxEZWxldGVDb25mbGljdCIsImFwaUNhbGxHZXRDb25mbGljdHMiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3RzIiwidXBkYXRlQ29uZmxpY3RzVmlldyIsInZhbHVlcyIsIm5hbWUiLCJ2YWx1ZSIsInNlbGVjdGVkIiwiZm9ybSIsInNlcnZlcklEIiwiYXBpIiwidXJsIiwiQ29uZmlnIiwicGJ4VXJsIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiaWQiLCJzdWNjZXNzVGVzdCIsIlBieEFwaSIsIm9uU3VjY2VzcyIsInJlc3BvbnNlIiwicmVtb3ZlIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsImhpZGUiLCJodG1sIiwiYnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0IiwiYWZ0ZXIiLCJsZW5ndGgiLCJzaG93IiwiYWRkQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0IiwidXNlcnNMaXN0IiwidW5pcXVlQXR0cmlidXRlcyIsImVhY2giLCJ1c2VyS2V5IiwidXNlclZhbHVlIiwiaW5kZXgiLCJpbmNsdWRlcyIsImdldFRyYW5zbGF0aW9uIiwiY29sdW1uTmFtZSIsImZpbHRlciIsInZhbCIsImZpbmQiLCJ0ZXh0IiwidXNlciIsInJvd0NsYXNzIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwiY29uZmxpY3RzIiwicmVjb3JkIiwicHJldHR5SlNPTiIsInN0cmluZ2lmeSIsIm5hbWVUZW1wbGF0ZSIsInVuZGVmaW5lZCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJvYmoiLCJpbnB1dCIsImF0dHIiLCJjaGVja2JveCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJnbG9iYWxSb290VXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLG9CQUFvQixHQUFHO0FBRTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLHdCQUFELENBTmlCOztBQVE1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLG9CQUFELENBWlE7O0FBYzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NFLEVBQUFBLG9CQUFvQixFQUFFRixDQUFDLENBQUMsdUJBQUQsQ0FsQks7O0FBb0I1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDRyxFQUFBQSx5QkFBeUIsRUFBRUgsQ0FBQyxDQUFDLHVCQUFELENBeEJBOztBQTBCNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0ksRUFBQUEsZ0JBQWdCLEVBQUVKLENBQUMsQ0FBQyxrQkFBRCxDQTlCUzs7QUFnQzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NLLEVBQUFBLGlCQUFpQixF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QW1DO0FBQ2xDSixRQUFBQSxNQUFNLENBQUM5RCxJQUFQLENBQVlrQixFQUFaLElBQWdCLEdBQWhCO0FBQ0EsT0FGRCxNQUVPO0FBQ040QyxRQUFBQSxNQUFNLENBQUM5RCxJQUFQLENBQVlrQixFQUFaLElBQWdCLEdBQWhCO0FBQ0E7QUFDRCxLQVJEO0FBVUEsV0FBTzRDLE1BQVA7QUFDQSxHQWpqQjJCOztBQW1qQjVCO0FBQ0Q7QUFDQTtBQUNDSyxFQUFBQSxlQXRqQjRCLDZCQXNqQlYsQ0FDakI7QUFDQSxHQXhqQjJCOztBQTBqQjVCO0FBQ0Q7QUFDQTtBQUNDN0UsRUFBQUEsY0E3akI0Qiw0QkE2akJYO0FBQ2hCOEUsSUFBQUEsSUFBSSxDQUFDNUgsUUFBTCxHQUFnQkQsb0JBQW9CLENBQUNDLFFBQXJDO0FBQ0E0SCxJQUFBQSxJQUFJLENBQUN4RCxHQUFMLGFBQWN5RCxhQUFkO0FBQ0FELElBQUFBLElBQUksQ0FBQzFHLGFBQUwsR0FBcUJuQixvQkFBb0IsQ0FBQ21CLGFBQTFDO0FBQ0EwRyxJQUFBQSxJQUFJLENBQUNQLGdCQUFMLEdBQXdCdEgsb0JBQW9CLENBQUNzSCxnQkFBN0M7QUFDQU8sSUFBQUEsSUFBSSxDQUFDRCxlQUFMLEdBQXVCNUgsb0JBQW9CLENBQUM0SCxlQUE1QztBQUNBQyxJQUFBQSxJQUFJLENBQUNoRixVQUFMO0FBQ0E7QUFwa0IyQixDQUE3QjtBQXVrQkEzQyxDQUFDLENBQUM2SCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCaEksRUFBQUEsb0JBQW9CLENBQUM2QyxVQUFyQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwgZ2xvYmFsVHJhbnNsYXRlLCBGb3JtLCBQYnhBcGksIG1vZHVsZV9sZGFwX3VzZXJEaXNhYmxlZEF0dHJpYnV0ZSwgbW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcywgQ29uZmlnLCBVc2VyTWVzc2FnZSAqL1xuXG4vKipcbiAqIE1vZHVsZUxkYXBTeW5jTW9kaWZ5XG4gKlxuICogVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBzeW5jaHJvbml6aW5nIExEQVAgdXNlcnMgYW5kXG4gKiBvdGhlciByZWxhdGVkIGZlYXR1cmVzLlxuICovXG5jb25zdCBNb2R1bGVMZGFwU3luY01vZGlmeSA9IHtcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGZvcm0uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS1sZGFwLXN5bmMtZm9ybScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc2VydmVyIHR5cGUgZHJvcGRvd24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcFR5cGVEcm9wZG93bjogJCgnLnNlbGVjdC1sZGFwLWZpZWxkJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBnZXR0aW5nIExEQVAgdXNlcnMgbGlzdCBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkY2hlY2tHZXRVc2Vyc0J1dHRvbjogJCgnLmNoZWNrLWxkYXAtZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIGNoZWNrIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50OiAkKCcjbGRhcC1jaGVjay1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN5bmMgTERBUCB1c2VycyBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzQnV0dG9uOiAkKCcubGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIHN5bmMgdXNlcnMgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNTZWdtZW50OiAkKCcjbGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggdXNlciBkaXNhYmxlZCBhdHRyaWJ1dGUgaWRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdHVzZXJEaXNhYmxlZEF0dHJpYnV0ZTogbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIGhpZGRlbiB1c2VycyBhdHRyaWJ1dGVzXG5cdCAqIEB0eXBlIHthcnJheX1cblx0ICovXG5cdGhpZGRlbkF0dHJpYnV0ZXM6IEpTT04ucGFyc2UobW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtYW4gdGFiIG1lbnUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbWFpblRhYk1lbnU6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS1tZW51ICAuaXRlbScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbWVzc2FnZSBubyBhbnkgY29uZmxpY3RzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlcjogJCgnI25vLWFueS1jb25mbGljdHMtcGxhY2Vob2xkZXInKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGJ1dHRvbiB0byBkZWxldGUgYWxsIGNvbmZsaWN0c1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbjogJCgnI2RlbGV0ZS1hbGwtY29uZmxpY3RzLWJ1dHRvbicpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbW9kdWxlIHN0YXR1cyB0b2dnbGVcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzdGF0dXNUb2dnbGU6ICQoJyNtb2R1bGUtc3RhdHVzLXRvZ2dsZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgdXNlIFRMUyBzZWxlY3RvclxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHVzZVRsc0Ryb3Bkb3duOiAkKCcudXNlLXRscy1kcm9wZG93bicpLFxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgZm9ybSBmaWVsZHMuXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0c2VydmVyTmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlck5hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZXJ2ZXJQb3J0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyUG9ydCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlTG9naW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZUxvZ2luJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRiYXNlRE46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYXNlRE4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJOYW1lQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlck5hbWVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlck1vYmlsZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJNb2JpbGVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRXh0ZW5zaW9uQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckV4dGVuc2lvbkF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJFbWFpbEF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFbWFpbEF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFbWFpbEF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckFjY291bnRDb250cm9sOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckFjY291bnRDb250cm9sJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHQvLyBIYW5kbGUgZ2V0IHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldExkYXBVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsU3luY1VzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbWFpblRhYk1lbnUudGFiKCk7XG5cblx0XHQvLyBIYW5kbGUgZGVsZXRlIGNvbmZsaWN0IGJ1dHRvbiBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRlbGV0ZS1jb25mbGljdCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbERlbGV0ZUNvbmZsaWN0KHJlY29yZElkKTtcblx0XHR9KTtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0Q29uZmxpY3RzKCk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxEZWxldGVDb25mbGljdHMoKTtcblx0XHR9KTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblxuXHRcdC8vIEhhbmRsZSBjaGFuZ2UgVExTIHByb3RvY29sXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHVzZVRsc0Ryb3Bkb3duLmRyb3Bkb3duKHtcblx0XHRcdHZhbHVlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZTogJ2xkYXA6Ly8nLFxuXHRcdFx0XHRcdHZhbHVlOiAnMCcsXG5cdFx0XHRcdFx0c2VsZWN0ZWQgOiBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCd1c2VUTFMnKT09PScwJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZSAgICAgOiAnbGRhcHM6Ly8nLFxuXHRcdFx0XHRcdHZhbHVlICAgIDogJzEnLFxuXHRcdFx0XHRcdHNlbGVjdGVkIDogTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywndXNlVExTJyk9PT0nMSdcblx0XHRcdFx0fVxuXHRcdFx0XSxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogSGFuZGxlcyBkZWxldGUgc3luYyBjb25mbGljdHMgcmVxdWVzdCBhbmQgZGVsZXRlIGNvbmZsaWN0cyB0YWJsZVxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGFwaUNhbGxEZWxldGVDb25mbGljdHMoKXtcblx0XHRjb25zdCBzZXJ2ZXJJRCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ2lkJyk7XG5cdFx0aWYgKCFzZXJ2ZXJJRCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZGVsZXRlLXNlcnZlci1jb25mbGljdHNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEuaWQgPSBzZXJ2ZXJJRDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGRlbGV0ZSBzeW5jIGNvbmZsaWN0IHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdCByb3cgb24gdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSByZWNvcmRJZFxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGFwaUNhbGxEZWxldGVDb25mbGljdChyZWNvcmRJZCl7XG5cdFx0aWYgKCFyZWNvcmRJZCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9kZWxldGUtc2VydmVyLWNvbmZsaWN0YCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLnJlY29yZElkID0gcmVjb3JkSWQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0JyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKGAjY29uZmxpY3RzLXJlc3VsdCB0cltkYXRhLXZhbHVlPVwiJHtyZWNvcmRJZH1cIl1gKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3QnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBsYXN0IHN5bmMgY29uZmxpY3RzXG5cdCAqL1xuXHRhcGlDYWxsR2V0Q29uZmxpY3RzKCl7XG5cblx0XHRjb25zdCBzZXJ2ZXJJRCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsJ2lkJyk7XG5cdFx0aWYgKCFzZXJ2ZXJJRCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtc2VydmVyLWNvbmZsaWN0c2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5pZCA9IHNlcnZlcklEO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLmhpZGUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuYWZ0ZXIoaHRtbCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHR1cGRhdGVDb25mbGljdHNWaWV3KCl7XG5cdFx0aWYgKCQoYCNjb25mbGljdHMtcmVzdWx0IHRib2R5IHRyYCkubGVuZ3RoPT09MCl7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5zaG93KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLmhpZGUoKTtcblx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24uc2hvdygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gZ2V0IExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxHZXRMZGFwVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gc3luYyBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsU3luY1VzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0Q29uZmxpY3RzKCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSB1c2VyJ3MgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB1c2Vyc0xpc3QgLSBUaGUgbGlzdCBvZiB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QodXNlcnNMaXN0KXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBpbmRleD09PSd1c2VySGFkQ2hhbmdlc09uVGhlU2lkZScpe1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGluZGV4KSsnPC90aD4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGNvbHVtbk5hbWUgPSAkKGBpbnB1dGApLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gJCh0aGlzKS52YWwoKSA9PT0gaW5kZXg7XG5cdFx0XHRcdH0pLmNsb3Nlc3QoJy5maWVsZCcpLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK2NvbHVtbk5hbWUrJzwvdGg+Jztcblx0XHRcdH1cblxuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Y29uc3Qgcm93Q2xhc3MgPSB1c2VyW01vZHVsZUxkYXBTeW5jTW9kaWZ5LnVzZXJEaXNhYmxlZEF0dHJpYnV0ZV09PT10cnVlPydkaXNhYmxlZCc6J2l0ZW0nO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiJHtyb3dDbGFzc31cIj5gO1xuXHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjZWxsVmFsdWUgPSB1c2VyW2F0dHJJbmRleF0gfHwgJyc7XG5cdFx0XHRcdGlmIChhdHRySW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBhdHRySW5kZXg9PT0ndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKXtcblx0XHRcdFx0XHRodG1sICs9Jzx0ZD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGNlbGxWYWx1ZSkrJzwvdGQ+Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRodG1sICs9ICc8dGQ+JytjZWxsVmFsdWUrJzwvdGQ+Jztcblx0XHRcdFx0fVxuXG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIHRhYmxlIGZyb20gdGhlIGNvbmZsaWN0cyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvbmZsaWN0cyAtIFRoZSBsaXN0IG9mIGNvbmZsaWN0c1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0KGNvbmZsaWN0cyl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImNvbmZsaWN0cy1yZXN1bHRcIj4nO1xuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgY29uZmxpY3RzIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0VGltZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RTaWRlJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdEVycm9yTWVzc2FnZXMnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0VXNlckRhdGEnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPjwvdGg+Jztcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+PHRib2R5PidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggY29uZmxpY3RzIGRhdGFcblx0XHQkLmVhY2goY29uZmxpY3RzLCAoaW5kZXgsIHJlY29yZCkgPT4ge1xuXHRcdFx0Y29uc3QgcHJldHR5SlNPTiA9IEpTT04uc3RyaW5naWZ5KHJlY29yZFsncGFyYW1zJ10sIG51bGwsIDIpO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiaXRlbVwiIGRhdGEtdmFsdWU9XCIke3JlY29yZFsnaWQnXX1cIj5gO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydsYXN0VGltZSddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihyZWNvcmRbJ3NpZGUnXSkrJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnZXJyb3JzJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD48cHJlPicrcHJldHR5SlNPTisnPC9wcmU+PC90ZD4nO1xuXHRcdFx0aHRtbCArPSBgPHRkPjxkaXYgY2xhc3M9XCJ1aSBpY29uIGJhc2ljIGJ1dHRvbiBwb3B1cGVkIGRlbGV0ZS1jb25mbGljdFwiIGRhdGEtY29udGVudD1cIiR7TW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ2RlbGV0ZUN1cnJlbnRDb25mbGljdCcpfVwiPjxpIGNsYXNzPVwiaWNvbiB0cmFzaCByZWRcIj48L2k+PC9kaXY+PC90ZD5gO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmFuc2xhdGVzIHRoZSBnaXZlbiB0ZXh0IHVzaW5nIHRoZSBnbG9iYWwgdHJhbnNsYXRpb24gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHRyYW5zbGF0ZWQuXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmFuc2xhdGVkIHRleHQgaWYgYXZhaWxhYmxlLCBvciB0aGUgb3JpZ2luYWwgdGV4dC5cblx0ICovXG5cdGdldFRyYW5zbGF0aW9uKHRleHQpe1xuXHRcdGlmICh0ZXh0Lmxlbmd0aD09PTApe1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXHRcdGNvbnN0IG5hbWVUZW1wbGF0ZSA9IGBtb2R1bGVfbGRhcF8ke3RleHR9YDtcblx0XHRjb25zdCBuYW1lID0gZ2xvYmFsVHJhbnNsYXRlW25hbWVUZW1wbGF0ZV07XG5cdFx0aWYgKG5hbWUhPT11bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBuYW1lO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBUaGUgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBzZXR0aW5ncyBvYmplY3QuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5maW5kKCcuY2hlY2tib3gnKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRjb25zdCBpbnB1dCA9ICQob2JqKS5maW5kKCdpbnB1dCcpO1xuXHRcdFx0Y29uc3QgaWQgPSBpbnB1dC5hdHRyKCdpZCcpO1xuXHRcdFx0aWYgKCQob2JqKS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRcdHJlc3VsdC5kYXRhW2lkXT0nMSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzAnO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblx0XHQvLyBDYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==