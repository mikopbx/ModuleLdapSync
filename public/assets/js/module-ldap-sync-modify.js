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
   * jQuery object for the use TLS checkbox
   * @type {jQuery}
   */
  $useTLSToggle: $('#useTLS'),

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
    ModuleLdapSyncModify.updateConflictsView(); // Handle change TLS toggle click

    ModuleLdapSyncModify.$useTLSToggle.checkbox({
      onChange: function onChange(value) {
        if (value) {
          ModuleLdapSyncModify.$formObj.form('set value', 'serverPort', 636);
        } else {
          ModuleLdapSyncModify.$formObj.form('set value', 'serverPort', 389);
        }
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRMU1RvZ2dsZSIsInZhbGlkYXRlUnVsZXMiLCJzZXJ2ZXJOYW1lIiwiaWRlbnRpZmllciIsInJ1bGVzIiwidHlwZSIsInByb21wdCIsImdsb2JhbFRyYW5zbGF0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHkiLCJzZXJ2ZXJQb3J0IiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSIsImFkbWluaXN0cmF0aXZlTG9naW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHkiLCJiYXNlRE4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUJhc2VETklzRW1wdHkiLCJ1c2VyTmFtZUF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck5hbWVBdHRyaWJ1dGVJc0VtcHR5IiwidXNlck1vYmlsZUF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck1vYmlsZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyRXh0ZW5zaW9uQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRXh0ZW5zaW9uQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFbWFpbEF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckVtYWlsQXR0cmlidXRlSXNFbXB0eSIsInVzZXJBY2NvdW50Q29udHJvbCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSIsImluaXRpYWxpemUiLCJkcm9wZG93biIsImluaXRpYWxpemVGb3JtIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJhcGlDYWxsR2V0TGRhcFVzZXJzIiwiYXBpQ2FsbFN5bmNVc2VycyIsInRhYiIsInJlY29yZElkIiwidGFyZ2V0IiwiY2xvc2VzdCIsImRhdGEiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3QiLCJhcGlDYWxsR2V0Q29uZmxpY3RzIiwiYXBpQ2FsbERlbGV0ZUNvbmZsaWN0cyIsInVwZGF0ZUNvbmZsaWN0c1ZpZXciLCJjaGVja2JveCIsIm9uQ2hhbmdlIiwidmFsdWUiLCJmb3JtIiwic2VydmVySUQiLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJpZCIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmUiLCJvbkZhaWx1cmUiLCJVc2VyTWVzc2FnZSIsInNob3dNdWx0aVN0cmluZyIsIm1lc3NhZ2VzIiwiaGlkZSIsImh0bWwiLCJidWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QiLCJhZnRlciIsImxlbmd0aCIsInNob3ciLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QiLCJ1c2Vyc0xpc3QiLCJ1bmlxdWVBdHRyaWJ1dGVzIiwiZWFjaCIsInVzZXJLZXkiLCJ1c2VyVmFsdWUiLCJpbmRleCIsImluY2x1ZGVzIiwiZ2V0VHJhbnNsYXRpb24iLCJjb2x1bW5OYW1lIiwiZmlsdGVyIiwidmFsIiwiZmluZCIsInRleHQiLCJ1c2VyIiwicm93Q2xhc3MiLCJhdHRySW5kZXgiLCJhdHRyVmFsdWUiLCJjZWxsVmFsdWUiLCJjb25mbGljdHMiLCJyZWNvcmQiLCJwcmV0dHlKU09OIiwic3RyaW5naWZ5IiwibmFtZVRlbXBsYXRlIiwibmFtZSIsInVuZGVmaW5lZCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJvYmoiLCJpbnB1dCIsImF0dHIiLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwiZ2xvYmFsUm9vdFVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxvQkFBb0IsR0FBRztBQUU1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQyx3QkFBRCxDQU5pQjs7QUFRNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsaUJBQWlCLEVBQUVELENBQUMsQ0FBQyxvQkFBRCxDQVpROztBQWM1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDRSxFQUFBQSxvQkFBb0IsRUFBRUYsQ0FBQyxDQUFDLHVCQUFELENBbEJLOztBQW9CNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0csRUFBQUEseUJBQXlCLEVBQUVILENBQUMsQ0FBQyx1QkFBRCxDQXhCQTs7QUEwQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLGdCQUFnQixFQUFFSixDQUFDLENBQUMsa0JBQUQsQ0E5QlM7O0FBZ0M1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDSyxFQUFBQSxpQkFBaUIsRUFBRUwsQ0FBQyxDQUFDLGtCQUFELENBcENROztBQXNDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ00sRUFBQUEscUJBQXFCLEVBQUVDLGlDQTFDSzs7QUE0QzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGdCQUFnQixFQUFFQyxJQUFJLENBQUNDLEtBQUwsQ0FBV0MsNEJBQVgsQ0FoRFU7O0FBa0Q1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxZQUFZLEVBQUVaLENBQUMsQ0FBQyxzQ0FBRCxDQXREYTs7QUF3RDVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NhLEVBQUFBLDBCQUEwQixFQUFFYixDQUFDLENBQUMsK0JBQUQsQ0E1REQ7O0FBOEQ1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDYyxFQUFBQSx5QkFBeUIsRUFBRWQsQ0FBQyxDQUFDLDhCQUFELENBbEVBOztBQW9FNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ2UsRUFBQUEsYUFBYSxFQUFFZixDQUFDLENBQUMsdUJBQUQsQ0F4RVk7O0FBMEU1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDZ0IsRUFBQUEsYUFBYSxFQUFFaEIsQ0FBQyxDQUFDLFNBQUQsQ0E5RVk7O0FBZ0Y1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDaUIsRUFBQUEsYUFBYSxFQUFFO0FBQ2RDLElBQUFBLFVBQVUsRUFBRTtBQUNYQyxNQUFBQSxVQUFVLEVBQUUsWUFERDtBQUVYQyxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDQyxRQUFBQSxJQUFJLEVBQUUsT0FEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ0M7QUFGekIsT0FETTtBQUZJLEtBREU7QUFVZEMsSUFBQUEsVUFBVSxFQUFFO0FBQ1hOLE1BQUFBLFVBQVUsRUFBRSxZQUREO0FBRVhDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDRztBQUZ6QixPQURNO0FBRkksS0FWRTtBQW1CZEMsSUFBQUEsbUJBQW1CLEVBQUU7QUFDcEJSLE1BQUFBLFVBQVUsRUFBRSxxQkFEUTtBQUVwQkMsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ0MsUUFBQUEsSUFBSSxFQUFFLE9BRFA7QUFFQ0MsUUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUNLO0FBRnpCLE9BRE07QUFGYSxLQW5CUDtBQTRCZEMsSUFBQUEsNEJBQTRCLEVBQUU7QUFDN0JWLE1BQUFBLFVBQVUsRUFBRSw4QkFEaUI7QUFFN0JDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDTztBQUZ6QixPQURNO0FBRnNCLEtBNUJoQjtBQXFDZEMsSUFBQUEsTUFBTSxFQUFFO0FBQ1BaLE1BQUFBLFVBQVUsRUFBRSxRQURMO0FBRVBDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDUztBQUZ6QixPQURNO0FBRkEsS0FyQ007QUE4Q2RDLElBQUFBLGlCQUFpQixFQUFFO0FBQ2xCZCxNQUFBQSxVQUFVLEVBQUUsbUJBRE07QUFFbEJDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDVztBQUZ6QixPQURNO0FBRlcsS0E5Q0w7QUF1RGRDLElBQUFBLG1CQUFtQixFQUFFO0FBQ3BCaEIsTUFBQUEsVUFBVSxFQUFFLHFCQURRO0FBRXBCQyxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDQyxRQUFBQSxJQUFJLEVBQUUsT0FEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ2E7QUFGekIsT0FETTtBQUZhLEtBdkRQO0FBZ0VkQyxJQUFBQSxzQkFBc0IsRUFBRTtBQUN2QmxCLE1BQUFBLFVBQVUsRUFBRSx3QkFEVztBQUV2QkMsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ0MsUUFBQUEsSUFBSSxFQUFFLE9BRFA7QUFFQ0MsUUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUNlO0FBRnpCLE9BRE07QUFGZ0IsS0FoRVY7QUF5RWRDLElBQUFBLGtCQUFrQixFQUFFO0FBQ25CcEIsTUFBQUEsVUFBVSxFQUFFLG9CQURPO0FBRW5CQyxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDQyxRQUFBQSxJQUFJLEVBQUUsT0FEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ2lCO0FBRnpCLE9BRE07QUFGWSxLQXpFTjtBQWtGZEMsSUFBQUEsa0JBQWtCLEVBQUU7QUFDbkJ0QixNQUFBQSxVQUFVLEVBQUUsb0JBRE87QUFFbkJDLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NDLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDbUI7QUFGekIsT0FETTtBQUZZO0FBbEZOLEdBcEZhOztBQWlMNUI7QUFDRDtBQUNBO0FBQ0NDLEVBQUFBLFVBcEw0Qix3QkFvTGY7QUFDWjdDLElBQUFBLG9CQUFvQixDQUFDRyxpQkFBckIsQ0FBdUMyQyxRQUF2QztBQUVBOUMsSUFBQUEsb0JBQW9CLENBQUMrQyxjQUFyQixHQUhZLENBS1o7O0FBQ0EvQyxJQUFBQSxvQkFBb0IsQ0FBQ0ksb0JBQXJCLENBQTBDNEMsRUFBMUMsQ0FBNkMsT0FBN0MsRUFBc0QsVUFBU0MsQ0FBVCxFQUFZO0FBQ2pFQSxNQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQWxELE1BQUFBLG9CQUFvQixDQUFDbUQsbUJBQXJCO0FBQ0EsS0FIRCxFQU5ZLENBV1o7O0FBQ0FuRCxJQUFBQSxvQkFBb0IsQ0FBQ00sZ0JBQXJCLENBQXNDMEMsRUFBdEMsQ0FBeUMsT0FBekMsRUFBa0QsVUFBU0MsQ0FBVCxFQUFZO0FBQzdEQSxNQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQWxELE1BQUFBLG9CQUFvQixDQUFDb0QsZ0JBQXJCO0FBQ0EsS0FIRDtBQUtBcEQsSUFBQUEsb0JBQW9CLENBQUNjLFlBQXJCLENBQWtDdUMsR0FBbEMsR0FqQlksQ0FtQlo7O0FBQ0FuRCxJQUFBQSxDQUFDLENBQUMsTUFBRCxDQUFELENBQVU4QyxFQUFWLENBQWEsT0FBYixFQUFzQixrQkFBdEIsRUFBMEMsVUFBU0MsQ0FBVCxFQUFZO0FBQ3JEQSxNQUFBQSxDQUFDLENBQUNDLGNBQUY7QUFDQSxVQUFNSSxRQUFRLEdBQUdwRCxDQUFDLENBQUMrQyxDQUFDLENBQUNNLE1BQUgsQ0FBRCxDQUFZQyxPQUFaLENBQW9CLElBQXBCLEVBQTBCQyxJQUExQixDQUErQixPQUEvQixDQUFqQjtBQUNBekQsTUFBQUEsb0JBQW9CLENBQUMwRCxxQkFBckIsQ0FBMkNKLFFBQTNDO0FBQ0EsS0FKRDtBQUtBdEQsSUFBQUEsb0JBQW9CLENBQUMyRCxtQkFBckIsR0F6QlksQ0EyQlo7O0FBQ0EzRCxJQUFBQSxvQkFBb0IsQ0FBQ2dCLHlCQUFyQixDQUErQ2dDLEVBQS9DLENBQWtELE9BQWxELEVBQTJELFVBQVNDLENBQVQsRUFBWTtBQUN0RUEsTUFBQUEsQ0FBQyxDQUFDQyxjQUFGO0FBQ0FsRCxNQUFBQSxvQkFBb0IsQ0FBQzRELHNCQUFyQjtBQUNBLEtBSEQ7QUFLQTVELElBQUFBLG9CQUFvQixDQUFDNkQsbUJBQXJCLEdBakNZLENBbUNaOztBQUNBN0QsSUFBQUEsb0JBQW9CLENBQUNrQixhQUFyQixDQUFtQzRDLFFBQW5DLENBQTRDO0FBQzNDQyxNQUFBQSxRQUFRLEVBQUUsa0JBQUNDLEtBQUQsRUFBUztBQUNsQixZQUFJQSxLQUFKLEVBQVc7QUFDVmhFLFVBQUFBLG9CQUFvQixDQUFDQyxRQUFyQixDQUE4QmdFLElBQTlCLENBQW1DLFdBQW5DLEVBQStDLFlBQS9DLEVBQTZELEdBQTdEO0FBQ0EsU0FGRCxNQUVPO0FBQ05qRSxVQUFBQSxvQkFBb0IsQ0FBQ0MsUUFBckIsQ0FBOEJnRSxJQUE5QixDQUFtQyxXQUFuQyxFQUErQyxZQUEvQyxFQUE2RCxHQUE3RDtBQUNBO0FBQ0Q7QUFQMEMsS0FBNUM7QUFTQSxHQWpPMkI7O0FBbU81QjtBQUNEO0FBQ0E7QUFDQTtBQUNDTCxFQUFBQSxzQkF2TzRCLG9DQXVPSjtBQUN2QixRQUFNTSxRQUFRLEdBQUdsRSxvQkFBb0IsQ0FBQ0MsUUFBckIsQ0FBOEJnRSxJQUE5QixDQUFtQyxXQUFuQyxFQUErQyxJQUEvQyxDQUFqQjs7QUFDQSxRQUFJLENBQUNDLFFBQUwsRUFBZTtBQUNkO0FBQ0E7O0FBQ0RoRSxJQUFBQSxDQUFDLENBQUNpRSxHQUFGLENBQU07QUFDTEMsTUFBQUEsR0FBRyxZQUFLQyxNQUFNLENBQUNDLE1BQVosZ0VBREU7QUFFTHRCLE1BQUFBLEVBQUUsRUFBRSxLQUZDO0FBR0x1QixNQUFBQSxNQUFNLEVBQUUsTUFISDtBQUlMQyxNQUFBQSxVQUpLLHNCQUlNQyxRQUpOLEVBSWdCO0FBQ3BCQSxRQUFBQSxRQUFRLENBQUNoQixJQUFULENBQWNpQixFQUFkLEdBQW1CUixRQUFuQjtBQUNBLGVBQU9PLFFBQVA7QUFDQSxPQVBJO0FBUUxFLE1BQUFBLFdBQVcsRUFBQ0MsTUFBTSxDQUFDRCxXQVJkOztBQVNMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dFLE1BQUFBLFNBQVMsRUFBRSxtQkFBU0MsUUFBVCxFQUFtQjtBQUM3QjVFLFFBQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCNkUsTUFBdEI7QUFDQTdFLFFBQUFBLENBQUMsQ0FBQyxtQkFBRCxDQUFELENBQXVCNkUsTUFBdkI7QUFDQS9FLFFBQUFBLG9CQUFvQixDQUFDNkQsbUJBQXJCO0FBQ0EsT0FqQkk7O0FBa0JMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dtQixNQUFBQSxTQUFTLEVBQUUsbUJBQVNGLFFBQVQsRUFBbUI7QUFDN0I1RSxRQUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQjZFLE1BQXRCO0FBQ0FFLFFBQUFBLFdBQVcsQ0FBQ0MsZUFBWixDQUE0QkosUUFBUSxDQUFDSyxRQUFyQztBQUNBO0FBekJJLEtBQU47QUEyQkEsR0F2UTJCOztBQXdRNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNDekIsRUFBQUEscUJBN1E0QixpQ0E2UU5KLFFBN1FNLEVBNlFHO0FBQzlCLFFBQUksQ0FBQ0EsUUFBTCxFQUFlO0FBQ2Q7QUFDQTs7QUFFRHBELElBQUFBLENBQUMsQ0FBQ2lFLEdBQUYsQ0FBTTtBQUNMQyxNQUFBQSxHQUFHLFlBQUtDLE1BQU0sQ0FBQ0MsTUFBWiwrREFERTtBQUVMdEIsTUFBQUEsRUFBRSxFQUFFLEtBRkM7QUFHTHVCLE1BQUFBLE1BQU0sRUFBRSxNQUhIO0FBSUxDLE1BQUFBLFVBSkssc0JBSU1DLFFBSk4sRUFJZ0I7QUFDcEJBLFFBQUFBLFFBQVEsQ0FBQ2hCLElBQVQsQ0FBY0gsUUFBZCxHQUF5QkEsUUFBekI7QUFDQSxlQUFPbUIsUUFBUDtBQUNBLE9BUEk7QUFRTEUsTUFBQUEsV0FBVyxFQUFDQyxNQUFNLENBQUNELFdBUmQ7O0FBU0w7QUFDSDtBQUNBO0FBQ0E7QUFDR0UsTUFBQUEsU0FBUyxFQUFFLG1CQUFTQyxRQUFULEVBQW1CO0FBQzdCNUUsUUFBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0I2RSxNQUF0QjtBQUNBN0UsUUFBQUEsQ0FBQyw2Q0FBcUNvRCxRQUFyQyxTQUFELENBQW9EeUIsTUFBcEQ7QUFDQS9FLFFBQUFBLG9CQUFvQixDQUFDNkQsbUJBQXJCO0FBQ0EsT0FqQkk7O0FBa0JMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dtQixNQUFBQSxTQUFTLEVBQUUsbUJBQVNGLFFBQVQsRUFBbUI7QUFDN0I1RSxRQUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQjZFLE1BQXRCO0FBQ0FFLFFBQUFBLFdBQVcsQ0FBQ0MsZUFBWixDQUE0QkosUUFBUSxDQUFDSyxRQUFyQztBQUNBO0FBekJJLEtBQU47QUEyQkEsR0E3UzJCOztBQThTNUI7QUFDRDtBQUNBO0FBQ0N4QixFQUFBQSxtQkFqVDRCLGlDQWlUUDtBQUVwQixRQUFNTyxRQUFRLEdBQUdsRSxvQkFBb0IsQ0FBQ0MsUUFBckIsQ0FBOEJnRSxJQUE5QixDQUFtQyxXQUFuQyxFQUErQyxJQUEvQyxDQUFqQjs7QUFDQSxRQUFJLENBQUNDLFFBQUwsRUFBZTtBQUNkO0FBQ0E7O0FBRURoRSxJQUFBQSxDQUFDLENBQUNpRSxHQUFGLENBQU07QUFDTEMsTUFBQUEsR0FBRyxZQUFLQyxNQUFNLENBQUNDLE1BQVosNkRBREU7QUFFTHRCLE1BQUFBLEVBQUUsRUFBRSxLQUZDO0FBR0x1QixNQUFBQSxNQUFNLEVBQUUsTUFISDtBQUlMQyxNQUFBQSxVQUpLLHNCQUlNQyxRQUpOLEVBSWdCO0FBQ3BCQSxRQUFBQSxRQUFRLENBQUNoQixJQUFULENBQWNpQixFQUFkLEdBQW1CUixRQUFuQjtBQUNBLGVBQU9PLFFBQVA7QUFDQSxPQVBJO0FBUUxFLE1BQUFBLFdBQVcsRUFBQ0MsTUFBTSxDQUFDRCxXQVJkOztBQVNMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dFLE1BQUFBLFNBQVMsRUFBRSxtQkFBU0MsUUFBVCxFQUFtQjtBQUM3QjVFLFFBQUFBLENBQUMsQ0FBQyxtQkFBRCxDQUFELENBQXVCNkUsTUFBdkI7QUFDQTdFLFFBQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCNkUsTUFBdEI7QUFDQS9FLFFBQUFBLG9CQUFvQixDQUFDZSwwQkFBckIsQ0FBZ0RxRSxJQUFoRDtBQUNBLFlBQU1DLElBQUksR0FBR3JGLG9CQUFvQixDQUFDc0YsMkJBQXJCLENBQWlEUixRQUFRLENBQUNyQixJQUExRCxDQUFiO0FBQ0F6RCxRQUFBQSxvQkFBb0IsQ0FBQ2UsMEJBQXJCLENBQWdEd0UsS0FBaEQsQ0FBc0RGLElBQXREO0FBQ0FyRixRQUFBQSxvQkFBb0IsQ0FBQzZELG1CQUFyQjtBQUNBLE9BcEJJOztBQXFCTDtBQUNIO0FBQ0E7QUFDQTtBQUNHbUIsTUFBQUEsU0FBUyxFQUFFLG1CQUFTRixRQUFULEVBQW1CO0FBQzdCNUUsUUFBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0I2RSxNQUF0QjtBQUNBN0UsUUFBQUEsQ0FBQyxDQUFDLG1CQUFELENBQUQsQ0FBdUI2RSxNQUF2QjtBQUNBRSxRQUFBQSxXQUFXLENBQUNDLGVBQVosQ0FBNEJKLFFBQVEsQ0FBQ0ssUUFBckM7QUFDQTtBQTdCSSxLQUFOO0FBK0JBLEdBdlYyQjtBQXlWNUJ0QixFQUFBQSxtQkF6VjRCLGlDQXlWUDtBQUNwQixRQUFJM0QsQ0FBQyw4QkFBRCxDQUFnQ3NGLE1BQWhDLEtBQXlDLENBQTdDLEVBQStDO0FBQzlDeEYsTUFBQUEsb0JBQW9CLENBQUNlLDBCQUFyQixDQUFnRDBFLElBQWhEO0FBQ0F6RixNQUFBQSxvQkFBb0IsQ0FBQ2dCLHlCQUFyQixDQUErQ29FLElBQS9DO0FBQ0FsRixNQUFBQSxDQUFDLENBQUMsbUJBQUQsQ0FBRCxDQUF1QjZFLE1BQXZCO0FBQ0EsS0FKRCxNQUlPO0FBQ04vRSxNQUFBQSxvQkFBb0IsQ0FBQ2dCLHlCQUFyQixDQUErQ3lFLElBQS9DO0FBQ0E7QUFDRCxHQWpXMkI7O0FBa1c1QjtBQUNEO0FBQ0E7QUFDQ3RDLEVBQUFBLG1CQXJXNEIsaUNBcVdQO0FBQ3BCakQsSUFBQUEsQ0FBQyxDQUFDaUUsR0FBRixDQUFNO0FBQ0xDLE1BQUFBLEdBQUcsWUFBS0MsTUFBTSxDQUFDQyxNQUFaLGlFQURFO0FBRUx0QixNQUFBQSxFQUFFLEVBQUUsS0FGQztBQUdMdUIsTUFBQUEsTUFBTSxFQUFFLE1BSEg7QUFJTEMsTUFBQUEsVUFKSyxzQkFJTUMsUUFKTixFQUlnQjtBQUNwQnpFLFFBQUFBLG9CQUFvQixDQUFDSSxvQkFBckIsQ0FBMENzRixRQUExQyxDQUFtRCxrQkFBbkQ7QUFDQWpCLFFBQUFBLFFBQVEsQ0FBQ2hCLElBQVQsR0FBZ0J6RCxvQkFBb0IsQ0FBQ0MsUUFBckIsQ0FBOEJnRSxJQUE5QixDQUFtQyxZQUFuQyxDQUFoQjtBQUNBLGVBQU9RLFFBQVA7QUFDQSxPQVJJO0FBU0xFLE1BQUFBLFdBQVcsRUFBQ0MsTUFBTSxDQUFDRCxXQVRkOztBQVVMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dFLE1BQUFBLFNBQVMsRUFBRSxtQkFBU0MsUUFBVCxFQUFtQjtBQUM3QjlFLFFBQUFBLG9CQUFvQixDQUFDSSxvQkFBckIsQ0FBMEN1RixXQUExQyxDQUFzRCxrQkFBdEQ7QUFDQXpGLFFBQUFBLENBQUMsQ0FBQyxjQUFELENBQUQsQ0FBa0I2RSxNQUFsQjtBQUNBN0UsUUFBQUEsQ0FBQyxDQUFDLGtCQUFELENBQUQsQ0FBc0I2RSxNQUF0QjtBQUNBLFlBQU1NLElBQUksR0FBR3JGLG9CQUFvQixDQUFDNEYsdUJBQXJCLENBQTZDZCxRQUFRLENBQUNyQixJQUF0RCxDQUFiO0FBQ0F6RCxRQUFBQSxvQkFBb0IsQ0FBQ0sseUJBQXJCLENBQStDa0YsS0FBL0MsQ0FBcURGLElBQXJEO0FBQ0EsT0FwQkk7O0FBcUJMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dMLE1BQUFBLFNBQVMsRUFBRSxtQkFBU0YsUUFBVCxFQUFtQjtBQUM3QjlFLFFBQUFBLG9CQUFvQixDQUFDSSxvQkFBckIsQ0FBMEN1RixXQUExQyxDQUFzRCxrQkFBdEQ7QUFDQXpGLFFBQUFBLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCNkUsTUFBdEI7QUFDQTdFLFFBQUFBLENBQUMsQ0FBQyxjQUFELENBQUQsQ0FBa0I2RSxNQUFsQjtBQUNBRSxRQUFBQSxXQUFXLENBQUNDLGVBQVosQ0FBNEJKLFFBQVEsQ0FBQ0ssUUFBckM7QUFDQTtBQTlCSSxLQUFOO0FBZ0NBLEdBdFkyQjs7QUF3WTVCO0FBQ0Q7QUFDQTtBQUNDL0IsRUFBQUEsZ0JBM1k0Qiw4QkEyWVY7QUFDakJsRCxJQUFBQSxDQUFDLENBQUNpRSxHQUFGLENBQU07QUFDTEMsTUFBQUEsR0FBRyxZQUFLQyxNQUFNLENBQUNDLE1BQVosd0RBREU7QUFFTHRCLE1BQUFBLEVBQUUsRUFBRSxLQUZDO0FBR0x1QixNQUFBQSxNQUFNLEVBQUUsTUFISDtBQUlMQyxNQUFBQSxVQUpLLHNCQUlNQyxRQUpOLEVBSWdCO0FBQ3BCekUsUUFBQUEsb0JBQW9CLENBQUNNLGdCQUFyQixDQUFzQ29GLFFBQXRDLENBQStDLGtCQUEvQztBQUNBakIsUUFBQUEsUUFBUSxDQUFDaEIsSUFBVCxHQUFnQnpELG9CQUFvQixDQUFDQyxRQUFyQixDQUE4QmdFLElBQTlCLENBQW1DLFlBQW5DLENBQWhCO0FBQ0EsZUFBT1EsUUFBUDtBQUNBLE9BUkk7QUFTTEUsTUFBQUEsV0FBVyxFQUFDQyxNQUFNLENBQUNELFdBVGQ7O0FBVUw7QUFDSDtBQUNBO0FBQ0E7QUFDR0UsTUFBQUEsU0FBUyxFQUFFLG1CQUFTQyxRQUFULEVBQW1CO0FBQzdCOUUsUUFBQUEsb0JBQW9CLENBQUNNLGdCQUFyQixDQUFzQ3FGLFdBQXRDLENBQWtELGtCQUFsRDtBQUNBekYsUUFBQUEsQ0FBQyxDQUFDLGNBQUQsQ0FBRCxDQUFrQjZFLE1BQWxCO0FBQ0E3RSxRQUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQjZFLE1BQXRCO0FBQ0EsWUFBTU0sSUFBSSxHQUFHckYsb0JBQW9CLENBQUM0Rix1QkFBckIsQ0FBNkNkLFFBQVEsQ0FBQ3JCLElBQXRELENBQWI7QUFDQXpELFFBQUFBLG9CQUFvQixDQUFDTyxpQkFBckIsQ0FBdUNnRixLQUF2QyxDQUE2Q0YsSUFBN0M7QUFDQXJGLFFBQUFBLG9CQUFvQixDQUFDMkQsbUJBQXJCO0FBQ0EsT0FyQkk7O0FBc0JMO0FBQ0g7QUFDQTtBQUNBO0FBQ0dxQixNQUFBQSxTQUFTLEVBQUUsbUJBQVNGLFFBQVQsRUFBbUI7QUFDN0I5RSxRQUFBQSxvQkFBb0IsQ0FBQ00sZ0JBQXJCLENBQXNDcUYsV0FBdEMsQ0FBa0Qsa0JBQWxEO0FBQ0F6RixRQUFBQSxDQUFDLENBQUMsa0JBQUQsQ0FBRCxDQUFzQjZFLE1BQXRCO0FBQ0E3RSxRQUFBQSxDQUFDLENBQUMsY0FBRCxDQUFELENBQWtCNkUsTUFBbEI7QUFDQUUsUUFBQUEsV0FBVyxDQUFDQyxlQUFaLENBQTRCSixRQUFRLENBQUNLLFFBQXJDO0FBQ0E7QUEvQkksS0FBTjtBQWlDQSxHQTdhMkI7O0FBK2E1QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQ1MsRUFBQUEsdUJBcmI0QixtQ0FxYkpDLFNBcmJJLEVBcWJNO0FBQ2pDLFFBQUlSLElBQUksR0FBRyxtRUFBWDtBQUNBLFFBQU1TLGdCQUFnQixHQUFHLEVBQXpCLENBRmlDLENBSWpDOztBQUNBNUYsSUFBQUEsQ0FBQyxDQUFDNkYsSUFBRixDQUFPRixTQUFQLEVBQWtCLFVBQUNHLE9BQUQsRUFBVUMsU0FBVixFQUF3QjtBQUN6Qy9GLE1BQUFBLENBQUMsQ0FBQzZGLElBQUYsQ0FBT0UsU0FBUCxFQUFrQixVQUFDQyxLQUFELEVBQVFsQyxLQUFSLEVBQWtCO0FBQ25DLFlBQUloRSxvQkFBb0IsQ0FBQ1UsZ0JBQXJCLENBQXNDeUYsUUFBdEMsQ0FBK0NELEtBQS9DLENBQUosRUFBMkQ7QUFDMUQ7QUFDQTs7QUFDREosUUFBQUEsZ0JBQWdCLENBQUNJLEtBQUQsQ0FBaEIsR0FBMEIsSUFBMUI7QUFDQSxPQUxEO0FBTUEsS0FQRCxFQUxpQyxDQWNqQzs7QUFDQWIsSUFBQUEsSUFBSSxJQUFJLGFBQVI7QUFDQW5GLElBQUFBLENBQUMsQ0FBQzZGLElBQUYsQ0FBT0QsZ0JBQVAsRUFBeUIsVUFBQ0ksS0FBRCxFQUFRbEMsS0FBUixFQUFrQjtBQUMxQyxVQUFJa0MsS0FBSyxLQUFHLGlCQUFSLElBQTZCQSxLQUFLLEtBQUcseUJBQXpDLEVBQW1FO0FBQ2xFYixRQUFBQSxJQUFJLElBQUcsU0FBT3JGLG9CQUFvQixDQUFDb0csY0FBckIsQ0FBb0NGLEtBQXBDLENBQVAsR0FBa0QsT0FBekQ7QUFDQSxPQUZELE1BRU87QUFDTixZQUFJRyxVQUFVLEdBQUduRyxDQUFDLFNBQUQsQ0FBV29HLE1BQVgsQ0FBa0IsWUFBVztBQUM3QyxpQkFBT3BHLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUXFHLEdBQVIsT0FBa0JMLEtBQXpCO0FBQ0EsU0FGZ0IsRUFFZDFDLE9BRmMsQ0FFTixRQUZNLEVBRUlnRCxJQUZKLENBRVMsT0FGVCxFQUVrQkMsSUFGbEIsRUFBakI7QUFHQXBCLFFBQUFBLElBQUksSUFBRyxTQUFPZ0IsVUFBUCxHQUFrQixPQUF6QjtBQUNBO0FBRUQsS0FWRDtBQVdBaEIsSUFBQUEsSUFBSSxJQUFJLGVBQVIsQ0EzQmlDLENBNkJqQzs7QUFDQW5GLElBQUFBLENBQUMsQ0FBQzZGLElBQUYsQ0FBT0YsU0FBUCxFQUFrQixVQUFDSyxLQUFELEVBQVFRLElBQVIsRUFBaUI7QUFDbEMsVUFBTUMsUUFBUSxHQUFHRCxJQUFJLENBQUMxRyxvQkFBb0IsQ0FBQ1EscUJBQXRCLENBQUosS0FBbUQsSUFBbkQsR0FBd0QsVUFBeEQsR0FBbUUsTUFBcEY7QUFDQTZFLE1BQUFBLElBQUksMEJBQWtCc0IsUUFBbEIsUUFBSjtBQUNBekcsTUFBQUEsQ0FBQyxDQUFDNkYsSUFBRixDQUFPRCxnQkFBUCxFQUF5QixVQUFDYyxTQUFELEVBQVlDLFNBQVosRUFBMEI7QUFDbEQsWUFBTUMsU0FBUyxHQUFHSixJQUFJLENBQUNFLFNBQUQsQ0FBSixJQUFtQixFQUFyQzs7QUFDQSxZQUFJQSxTQUFTLEtBQUcsaUJBQVosSUFBaUNBLFNBQVMsS0FBRyx5QkFBakQsRUFBMkU7QUFDMUV2QixVQUFBQSxJQUFJLElBQUcsU0FBT3JGLG9CQUFvQixDQUFDb0csY0FBckIsQ0FBb0NVLFNBQXBDLENBQVAsR0FBc0QsT0FBN0Q7QUFDQSxTQUZELE1BRU87QUFDTnpCLFVBQUFBLElBQUksSUFBSSxTQUFPeUIsU0FBUCxHQUFpQixPQUF6QjtBQUNBO0FBRUQsT0FSRDtBQVNBekIsTUFBQUEsSUFBSSxJQUFJLE9BQVI7QUFDQSxLQWJEO0FBY0FBLElBQUFBLElBQUksSUFBSSxVQUFSO0FBQ0EsV0FBT0EsSUFBUDtBQUNBLEdBbmUyQjs7QUFxZTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSwyQkEzZTRCLHVDQTJlQXlCLFNBM2VBLEVBMmVVO0FBQ3JDLFFBQUkxQixJQUFJLEdBQUcsd0VBQVgsQ0FEcUMsQ0FFckM7O0FBQ0FBLElBQUFBLElBQUksSUFBSSxhQUFSO0FBQ0FBLElBQUFBLElBQUksSUFBRyxTQUFPckYsb0JBQW9CLENBQUNvRyxjQUFyQixDQUFvQyxjQUFwQyxDQUFQLEdBQTJELE9BQWxFO0FBQ0FmLElBQUFBLElBQUksSUFBRyxTQUFPckYsb0JBQW9CLENBQUNvRyxjQUFyQixDQUFvQyxjQUFwQyxDQUFQLEdBQTJELE9BQWxFO0FBQ0FmLElBQUFBLElBQUksSUFBRyxTQUFPckYsb0JBQW9CLENBQUNvRyxjQUFyQixDQUFvQyx1QkFBcEMsQ0FBUCxHQUFvRSxPQUEzRTtBQUNBZixJQUFBQSxJQUFJLElBQUcsU0FBT3JGLG9CQUFvQixDQUFDb0csY0FBckIsQ0FBb0Msa0JBQXBDLENBQVAsR0FBK0QsT0FBdEU7QUFDQWYsSUFBQUEsSUFBSSxJQUFHLFdBQVA7QUFDQUEsSUFBQUEsSUFBSSxJQUFJLHNCQUFSLENBVHFDLENBV3JDOztBQUNBbkYsSUFBQUEsQ0FBQyxDQUFDNkYsSUFBRixDQUFPZ0IsU0FBUCxFQUFrQixVQUFDYixLQUFELEVBQVFjLE1BQVIsRUFBbUI7QUFDcEMsVUFBTUMsVUFBVSxHQUFHdEcsSUFBSSxDQUFDdUcsU0FBTCxDQUFlRixNQUFNLENBQUMsUUFBRCxDQUFyQixFQUFpQyxJQUFqQyxFQUF1QyxDQUF2QyxDQUFuQjtBQUNBM0IsTUFBQUEsSUFBSSw4Q0FBb0MyQixNQUFNLENBQUMsSUFBRCxDQUExQyxRQUFKO0FBQ0EzQixNQUFBQSxJQUFJLElBQUksU0FBTzJCLE1BQU0sQ0FBQyxVQUFELENBQWIsR0FBMEIsT0FBbEM7QUFDQTNCLE1BQUFBLElBQUksSUFBSSxTQUFPckYsb0JBQW9CLENBQUNvRyxjQUFyQixDQUFvQ1ksTUFBTSxDQUFDLE1BQUQsQ0FBMUMsQ0FBUCxHQUEyRCxPQUFuRTtBQUNBM0IsTUFBQUEsSUFBSSxJQUFJLFNBQU8yQixNQUFNLENBQUMsUUFBRCxDQUFiLEdBQXdCLE9BQWhDO0FBQ0EzQixNQUFBQSxJQUFJLElBQUksY0FBWTRCLFVBQVosR0FBdUIsYUFBL0I7QUFDQTVCLE1BQUFBLElBQUksNkZBQW1GckYsb0JBQW9CLENBQUNvRyxjQUFyQixDQUFvQyx1QkFBcEMsQ0FBbkYsbURBQUo7QUFDQWYsTUFBQUEsSUFBSSxJQUFJLE9BQVI7QUFDQSxLQVREO0FBVUFBLElBQUFBLElBQUksSUFBSSxrQkFBUjtBQUNBLFdBQU9BLElBQVA7QUFDQSxHQW5nQjJCOztBQXFnQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNDZSxFQUFBQSxjQTNnQjRCLDBCQTJnQmJLLElBM2dCYSxFQTJnQlI7QUFDbkIsUUFBSUEsSUFBSSxDQUFDakIsTUFBTCxLQUFjLENBQWxCLEVBQW9CO0FBQ25CLGFBQU9pQixJQUFQO0FBQ0E7O0FBQ0QsUUFBTVUsWUFBWSx5QkFBa0JWLElBQWxCLENBQWxCO0FBQ0EsUUFBTVcsSUFBSSxHQUFHM0YsZUFBZSxDQUFDMEYsWUFBRCxDQUE1Qjs7QUFDQSxRQUFJQyxJQUFJLEtBQUdDLFNBQVgsRUFBc0I7QUFDckIsYUFBT0QsSUFBUDtBQUNBOztBQUVELFdBQU9YLElBQVA7QUFDQSxHQXRoQjJCOztBQXdoQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQ2EsRUFBQUEsZ0JBN2hCNEIsNEJBNmhCWDdDLFFBN2hCVyxFQTZoQkQ7QUFDMUIsUUFBTThDLE1BQU0sR0FBRzlDLFFBQWY7QUFDQThDLElBQUFBLE1BQU0sQ0FBQzlELElBQVAsR0FBY3pELG9CQUFvQixDQUFDQyxRQUFyQixDQUE4QmdFLElBQTlCLENBQW1DLFlBQW5DLENBQWQ7QUFFQWpFLElBQUFBLG9CQUFvQixDQUFDQyxRQUFyQixDQUE4QnVHLElBQTlCLENBQW1DLFdBQW5DLEVBQWdEVCxJQUFoRCxDQUFxRCxVQUFDRyxLQUFELEVBQVFzQixHQUFSLEVBQWdCO0FBQ3BFLFVBQU1DLEtBQUssR0FBR3ZILENBQUMsQ0FBQ3NILEdBQUQsQ0FBRCxDQUFPaEIsSUFBUCxDQUFZLE9BQVosQ0FBZDtBQUNBLFVBQU05QixFQUFFLEdBQUcrQyxLQUFLLENBQUNDLElBQU4sQ0FBVyxJQUFYLENBQVg7O0FBQ0EsVUFBSXhILENBQUMsQ0FBQ3NILEdBQUQsQ0FBRCxDQUFPMUQsUUFBUCxDQUFnQixZQUFoQixDQUFKLEVBQW1DO0FBQ2xDeUQsUUFBQUEsTUFBTSxDQUFDOUQsSUFBUCxDQUFZaUIsRUFBWixJQUFnQixHQUFoQjtBQUNBLE9BRkQsTUFFTztBQUNONkMsUUFBQUEsTUFBTSxDQUFDOUQsSUFBUCxDQUFZaUIsRUFBWixJQUFnQixHQUFoQjtBQUNBO0FBQ0QsS0FSRDtBQVVBLFdBQU82QyxNQUFQO0FBQ0EsR0E1aUIyQjs7QUE4aUI1QjtBQUNEO0FBQ0E7QUFDQ0ksRUFBQUEsZUFqakI0Qiw2QkFpakJWLENBQ2pCO0FBQ0EsR0FuakIyQjs7QUFxakI1QjtBQUNEO0FBQ0E7QUFDQzVFLEVBQUFBLGNBeGpCNEIsNEJBd2pCWDtBQUNoQjZFLElBQUFBLElBQUksQ0FBQzNILFFBQUwsR0FBZ0JELG9CQUFvQixDQUFDQyxRQUFyQztBQUNBMkgsSUFBQUEsSUFBSSxDQUFDeEQsR0FBTCxhQUFjeUQsYUFBZDtBQUNBRCxJQUFBQSxJQUFJLENBQUN6RyxhQUFMLEdBQXFCbkIsb0JBQW9CLENBQUNtQixhQUExQztBQUNBeUcsSUFBQUEsSUFBSSxDQUFDTixnQkFBTCxHQUF3QnRILG9CQUFvQixDQUFDc0gsZ0JBQTdDO0FBQ0FNLElBQUFBLElBQUksQ0FBQ0QsZUFBTCxHQUF1QjNILG9CQUFvQixDQUFDMkgsZUFBNUM7QUFDQUMsSUFBQUEsSUFBSSxDQUFDL0UsVUFBTDtBQUNBO0FBL2pCMkIsQ0FBN0I7QUFra0JBM0MsQ0FBQyxDQUFDNEgsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2Qi9ILEVBQUFBLG9CQUFvQixDQUFDNkMsVUFBckI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgUGJ4QXBpLCBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsIG1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMsIENvbmZpZywgVXNlck1lc3NhZ2UgKi9cblxuLyoqXG4gKiBNb2R1bGVMZGFwU3luY01vZGlmeVxuICpcbiAqIFRoaXMgb2JqZWN0IGhhbmRsZXMgdGhlIGZ1bmN0aW9uYWxpdHkgb2Ygc3luY2hyb25pemluZyBMREFQIHVzZXJzIGFuZFxuICogb3RoZXIgcmVsYXRlZCBmZWF0dXJlcy5cbiAqL1xuY29uc3QgTW9kdWxlTGRhcFN5bmNNb2RpZnkgPSB7XG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBmb3JtLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGZvcm1PYmo6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLWZvcm0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHNlcnZlciB0eXBlIGRyb3Bkb3duLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBUeXBlRHJvcGRvd246ICQoJy5zZWxlY3QtbGRhcC1maWVsZCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZ2V0dGluZyBMREFQIHVzZXJzIGxpc3QgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGNoZWNrR2V0VXNlcnNCdXR0b246ICQoJy5jaGVjay1sZGFwLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBjaGVjayBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBDaGVja0dldFVzZXJzU2VnbWVudDogJCgnI2xkYXAtY2hlY2stZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzeW5jIExEQVAgdXNlcnMgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc0J1dHRvbjogJCgnLmxkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBzeW5jIHVzZXJzIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzU2VnbWVudDogJCgnI2xkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIHVzZXIgZGlzYWJsZWQgYXR0cmlidXRlIGlkXG5cdCAqIEB0eXBlIHtzdHJpbmd9XG5cdCAqL1xuXHR1c2VyRGlzYWJsZWRBdHRyaWJ1dGU6IG1vZHVsZV9sZGFwX3VzZXJEaXNhYmxlZEF0dHJpYnV0ZSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCBoaWRkZW4gdXNlcnMgYXR0cmlidXRlc1xuXHQgKiBAdHlwZSB7YXJyYXl9XG5cdCAqL1xuXHRoaWRkZW5BdHRyaWJ1dGVzOiBKU09OLnBhcnNlKG1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbWFuIHRhYiBtZW51LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JG1haW5UYWJNZW51OiAkKCcjbW9kdWxlLWxkYXAtc3luYy1tb2RpZnktbWVudSAgLml0ZW0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1lc3NhZ2Ugbm8gYW55IGNvbmZsaWN0c1xuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXI6ICQoJyNuby1hbnktY29uZmxpY3RzLXBsYWNlaG9sZGVyJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBidXR0b24gdG8gZGVsZXRlIGFsbCBjb25mbGljdHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRkZWxldGVBbGxDb25mbGljdHNCdXR0b246ICQoJyNkZWxldGUtYWxsLWNvbmZsaWN0cy1idXR0b24nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1vZHVsZSBzdGF0dXMgdG9nZ2xlXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3RhdHVzVG9nZ2xlOiAkKCcjbW9kdWxlLXN0YXR1cy10b2dnbGUnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHVzZSBUTFMgY2hlY2tib3hcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCR1c2VUTFNUb2dnbGU6ICQoJyN1c2VUTFMnKSxcblxuXHQvKipcblx0ICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzLlxuXHQgKiBAdHlwZSB7T2JqZWN0fVxuXHQgKi9cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdHNlcnZlck5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJOYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0c2VydmVyUG9ydDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlclBvcnQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZUxvZ2luOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVMb2dpbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YmFzZUROOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYmFzZUROJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyTmFtZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJOYW1lQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck5hbWVBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJNb2JpbGVBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyTW9iaWxlQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck1vYmlsZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckV4dGVuc2lvbkF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFeHRlbnNpb25BdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRXh0ZW5zaW9uQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRW1haWxBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyRW1haWxBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJBY2NvdW50Q29udHJvbDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJBY2NvdW50Q29udHJvbCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJBY2NvdW50Q29udHJvbElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwVHlwZURyb3Bkb3duLmRyb3Bkb3duKCk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5pbml0aWFsaXplRm9ybSgpO1xuXG5cdFx0Ly8gSGFuZGxlIGdldCB1c2VycyBsaXN0IGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRMZGFwVXNlcnMoKTtcblx0XHR9KTtcblxuXHRcdC8vIEhhbmRsZSBzeW5jIHVzZXJzIGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbFN5bmNVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG1haW5UYWJNZW51LnRhYigpO1xuXG5cdFx0Ly8gSGFuZGxlIGRlbGV0ZSBjb25mbGljdCBidXR0b24gY2xpY2tcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5kZWxldGUtY29uZmxpY3QnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCByZWNvcmRJZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RyJykuZGF0YSgndmFsdWUnKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxEZWxldGVDb25mbGljdChyZWNvcmRJZCk7XG5cdFx0fSk7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldENvbmZsaWN0cygpO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsRGVsZXRlQ29uZmxpY3RzKCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cblx0XHQvLyBIYW5kbGUgY2hhbmdlIFRMUyB0b2dnbGUgY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdXNlVExTVG9nZ2xlLmNoZWNrYm94KHtcblx0XHRcdG9uQ2hhbmdlOiAodmFsdWUpPT57XG5cdFx0XHRcdGlmICh2YWx1ZSkge1xuXHRcdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsJ3NlcnZlclBvcnQnLCA2MzYpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ3NldCB2YWx1ZScsJ3NlcnZlclBvcnQnLCAzODkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZGVsZXRlIHN5bmMgY29uZmxpY3RzIHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdHMgdGFibGVcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3RzKCl7XG5cdFx0Y29uc3Qgc2VydmVySUQgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCdpZCcpO1xuXHRcdGlmICghc2VydmVySUQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlcyBkZWxldGUgc3luYyBjb25mbGljdCByZXF1ZXN0IGFuZCBkZWxldGUgY29uZmxpY3Qgcm93IG9uIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gcmVjb3JkSWRcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3QocmVjb3JkSWQpe1xuXHRcdGlmICghcmVjb3JkSWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZGVsZXRlLXNlcnZlci1jb25mbGljdGAsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5yZWNvcmRJZCA9IHJlY29yZElkO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdCcgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JChgI2NvbmZsaWN0cy1yZXN1bHQgdHJbZGF0YS12YWx1ZT1cIiR7cmVjb3JkSWR9XCJdYCkucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0JyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgbGFzdCBzeW5jIGNvbmZsaWN0c1xuXHQgKi9cblx0YXBpQ2FsbEdldENvbmZsaWN0cygpe1xuXG5cdFx0Y29uc3Qgc2VydmVySUQgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCdpZCcpO1xuXHRcdGlmICghc2VydmVySUQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZ2V0LXNlcnZlci1jb25mbGljdHNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEuaWQgPSBzZXJ2ZXJJRDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5oaWRlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LXNlcnZlci1jb25mbGljdHMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0dXBkYXRlQ29uZmxpY3RzVmlldygpe1xuXHRcdGlmICgkKGAjY29uZmxpY3RzLXJlc3VsdCB0Ym9keSB0cmApLmxlbmd0aD09PTApe1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuc2hvdygpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5oaWRlKCk7XG5cdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLnNob3coKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0TGRhcFVzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1hdmFpbGFibGUtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBDaGVja0dldFVzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIHN5bmMgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbFN5bmNVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9zeW5jLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldENvbmZsaWN0cygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgdXNlcidzIGxpc3Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gdXNlcnNMaXN0IC0gVGhlIGxpc3Qgb2YgdXNlcnNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHVzZXJzTGlzdCl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImxkYXAtcmVzdWx0XCI+Jztcblx0XHRjb25zdCB1bmlxdWVBdHRyaWJ1dGVzID0ge307XG5cblx0XHQvLyBFeHRyYWN0IHVuaXF1ZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHJlc3BvbnNlIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAodXNlcktleSwgdXNlclZhbHVlKSA9PiB7XG5cdFx0XHQkLmVhY2godXNlclZhbHVlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmIChNb2R1bGVMZGFwU3luY01vZGlmeS5oaWRkZW5BdHRyaWJ1dGVzLmluY2x1ZGVzKGluZGV4KSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmlxdWVBdHRyaWJ1dGVzW2luZGV4XSA9IHRydWU7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgdXNlciBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0aWYgKGluZGV4PT09J3VzZXJzU3luY1Jlc3VsdCcgfHwgaW5kZXg9PT0ndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKXtcblx0XHRcdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihpbmRleCkrJzwvdGg+Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxldCBjb2x1bW5OYW1lID0gJChgaW5wdXRgKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQodGhpcykudmFsKCkgPT09IGluZGV4O1xuXHRcdFx0XHR9KS5jbG9zZXN0KCcuZmllbGQnKS5maW5kKCdsYWJlbCcpLnRleHQoKTtcblx0XHRcdFx0aHRtbCArPSc8dGg+Jytjb2x1bW5OYW1lKyc8L3RoPic7XG5cdFx0XHR9XG5cblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCB1c2VyIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAoaW5kZXgsIHVzZXIpID0+IHtcblx0XHRcdGNvbnN0IHJvd0NsYXNzID0gdXNlcltNb2R1bGVMZGFwU3luY01vZGlmeS51c2VyRGlzYWJsZWRBdHRyaWJ1dGVdPT09dHJ1ZT8nZGlzYWJsZWQnOidpdGVtJztcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIiR7cm93Q2xhc3N9XCI+YDtcblx0XHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoYXR0ckluZGV4LCBhdHRyVmFsdWUpID0+IHtcblx0XHRcdFx0Y29uc3QgY2VsbFZhbHVlID0gdXNlclthdHRySW5kZXhdIHx8ICcnO1xuXHRcdFx0XHRpZiAoYXR0ckluZGV4PT09J3VzZXJzU3luY1Jlc3VsdCcgfHwgYXR0ckluZGV4PT09J3VzZXJIYWRDaGFuZ2VzT25UaGVTaWRlJyl7XG5cdFx0XHRcdFx0aHRtbCArPSc8dGQ+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihjZWxsVmFsdWUpKyc8L3RkPic7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aHRtbCArPSAnPHRkPicrY2VsbFZhbHVlKyc8L3RkPic7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSk7XG5cdFx0XHRodG1sICs9ICc8L3RyPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBjb25mbGljdHMgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb25mbGljdHMgLSBUaGUgbGlzdCBvZiBjb25mbGljdHNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdChjb25mbGljdHMpe1xuXHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJjb25mbGljdHMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFRpbWUnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0U2lkZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RFcnJvck1lc3NhZ2VzJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFVzZXJEYXRhJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD48L3RoPic7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPjx0Ym9keT4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIGNvbmZsaWN0cyBkYXRhXG5cdFx0JC5lYWNoKGNvbmZsaWN0cywgKGluZGV4LCByZWNvcmQpID0+IHtcblx0XHRcdGNvbnN0IHByZXR0eUpTT04gPSBKU09OLnN0cmluZ2lmeShyZWNvcmRbJ3BhcmFtcyddLCBudWxsLCAyKTtcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIml0ZW1cIiBkYXRhLXZhbHVlPVwiJHtyZWNvcmRbJ2lkJ119XCI+YDtcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnbGFzdFRpbWUnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24ocmVjb3JkWydzaWRlJ10pKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2Vycm9ycyddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+PHByZT4nK3ByZXR0eUpTT04rJzwvcHJlPjwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gYDx0ZD48ZGl2IGNsYXNzPVwidWkgaWNvbiBiYXNpYyBidXR0b24gcG9wdXBlZCBkZWxldGUtY29uZmxpY3RcIiBkYXRhLWNvbnRlbnQ9XCIke01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdkZWxldGVDdXJyZW50Q29uZmxpY3QnKX1cIj48aSBjbGFzcz1cImljb24gdHJhc2ggcmVkXCI+PC9pPjwvZGl2PjwvdGQ+YDtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3Rib2R5PjwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gdGV4dCB1c2luZyB0aGUgZ2xvYmFsIHRyYW5zbGF0aW9uIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBiZSB0cmFuc2xhdGVkLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgdHJhbnNsYXRlZCB0ZXh0IGlmIGF2YWlsYWJsZSwgb3IgdGhlIG9yaWdpbmFsIHRleHQuXG5cdCAqL1xuXHRnZXRUcmFuc2xhdGlvbih0ZXh0KXtcblx0XHRpZiAodGV4dC5sZW5ndGg9PT0wKXtcblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH1cblx0XHRjb25zdCBuYW1lVGVtcGxhdGUgPSBgbW9kdWxlX2xkYXBfJHt0ZXh0fWA7XG5cdFx0Y29uc3QgbmFtZSA9IGdsb2JhbFRyYW5zbGF0ZVtuYW1lVGVtcGxhdGVdO1xuXHRcdGlmIChuYW1lIT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=