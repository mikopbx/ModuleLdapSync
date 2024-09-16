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
  $mainTabMenu: $('#module-ldap-sync-modify-menu'),

  /**
   * jQuery object for the message no any conflicts
   * @type {jQuery}
   */
  $noAnyConflictsPlaceholder: $('#no-any-conflicts-placeholder'),

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
  },

  /**
   * Handles delete sync conflict request and delete conflict row on the table
   * @param recordId
   * @returns {*}
   */
  apiCallDeleteConflict: function apiCallDeleteConflict(recordId) {
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
    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/get-server-conflicts"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        settings.data.id = ModuleLdapSyncModify.$formObj.form('get value', 'id');
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

        if ($("#conflicts-result tr").length === 0) {
          ModuleLdapSyncModify.$noAnyConflictsPlaceholder.show();
        }
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
      html += '<th>' + index + '</th>';
    });
    html += '</tr></thead>'; // Generate the HTML table with user data

    $.each(usersList, function (index, user) {
      var rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item';
      html += "<tr class=\"".concat(rowClass, "\">");
      $.each(uniqueAttributes, function (attrIndex, attrValue) {
        var cellValue = user[attrIndex] || '';
        html += '<td>' + cellValue + '</td>';
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
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictUserData') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictSide') + '</th>';
    html += '<th>' + ModuleLdapSyncModify.getTranslation('ConflictErrorMessages') + '</th>';
    html += '<th></th>';
    html += '</tr></thead>'; // Generate the HTML table with conflicts data

    $.each(conflicts, function (index, record) {
      html += "<tr class=\"item\" data-value=\"".concat(record['id'], "\">");
      html += '<td>' + record['lastTime'] + '</td>';
      html += '<td>' + ModuleLdapSyncModify.getTranslation(record['side']) + '</td>';
      html += '<td>' + record['params'] + '</td>';
      html += '<td>' + record['errors'] + '</td>';
      html += "<td><div class=\"ui icon basic button popuped delete-conflict\" data-content=\"".concat(ModuleLdapSyncModify.getTranslation('deleteCurrentConflict'), "\"><i class=\"icon trash red\"></i></div></td>");
      html += '</tr>';
    });
    html += '</table>';
    return html;
  },

  /**
   * Translates the given text using the global translation object.
   *
   * @param {string} text - The text to be translated.
   * @returns {string} The translated text if available, or the original text.
   */
  getTranslation: function getTranslation(text) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsInZhbGlkYXRlUnVsZXMiLCJzZXJ2ZXJOYW1lIiwiaWRlbnRpZmllciIsInJ1bGVzIiwidHlwZSIsInByb21wdCIsImdsb2JhbFRyYW5zbGF0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHkiLCJzZXJ2ZXJQb3J0IiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSIsImFkbWluaXN0cmF0aXZlTG9naW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHkiLCJiYXNlRE4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUJhc2VETklzRW1wdHkiLCJ1c2VyTmFtZUF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck5hbWVBdHRyaWJ1dGVJc0VtcHR5IiwidXNlck1vYmlsZUF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck1vYmlsZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyRXh0ZW5zaW9uQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRXh0ZW5zaW9uQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFbWFpbEF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckVtYWlsQXR0cmlidXRlSXNFbXB0eSIsInVzZXJBY2NvdW50Q29udHJvbCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSIsImluaXRpYWxpemUiLCJkcm9wZG93biIsImluaXRpYWxpemVGb3JtIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJhcGlDYWxsR2V0TGRhcFVzZXJzIiwiYXBpQ2FsbFN5bmNVc2VycyIsInRhYiIsInJlY29yZElkIiwidGFyZ2V0IiwiY2xvc2VzdCIsImRhdGEiLCJhcGlDYWxsRGVsZXRlQ29uZmxpY3QiLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJzdWNjZXNzVGVzdCIsIlBieEFwaSIsIm9uU3VjY2VzcyIsInJlc3BvbnNlIiwicmVtb3ZlIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsImFwaUNhbGxHZXRDb25mbGljdHMiLCJpZCIsImZvcm0iLCJoaWRlIiwiaHRtbCIsImJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdCIsImFmdGVyIiwibGVuZ3RoIiwic2hvdyIsImFkZENsYXNzIiwicmVtb3ZlQ2xhc3MiLCJidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCIsInVzZXJzTGlzdCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJlYWNoIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluZGV4IiwidmFsdWUiLCJpbmNsdWRlcyIsInVzZXIiLCJyb3dDbGFzcyIsImF0dHJJbmRleCIsImF0dHJWYWx1ZSIsImNlbGxWYWx1ZSIsImNvbmZsaWN0cyIsImdldFRyYW5zbGF0aW9uIiwicmVjb3JkIiwidGV4dCIsIm5hbWVUZW1wbGF0ZSIsIm5hbWUiLCJ1bmRlZmluZWQiLCJjYkJlZm9yZVNlbmRGb3JtIiwicmVzdWx0IiwiZmluZCIsIm9iaiIsImlucHV0IiwiYXR0ciIsImNoZWNrYm94IiwiY2JBZnRlclNlbmRGb3JtIiwiRm9ybSIsImdsb2JhbFJvb3RVcmwiLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBTUEsb0JBQW9CLEdBQUc7QUFFNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsd0JBQUQsQ0FOaUI7O0FBUTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGlCQUFpQixFQUFFRCxDQUFDLENBQUMsb0JBQUQsQ0FaUTs7QUFjNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsb0JBQW9CLEVBQUVGLENBQUMsQ0FBQyx1QkFBRCxDQWxCSzs7QUFvQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NHLEVBQUFBLHlCQUF5QixFQUFFSCxDQUFDLENBQUMsdUJBQUQsQ0F4QkE7O0FBMEI1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDSSxFQUFBQSxnQkFBZ0IsRUFBRUosQ0FBQyxDQUFDLGtCQUFELENBOUJTOztBQWdDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0ssRUFBQUEsaUJBQWlCLEVBQUVMLENBQUMsQ0FBQyxrQkFBRCxDQXBDUTs7QUFzQzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NNLEVBQUFBLHFCQUFxQixFQUFFQyxpQ0ExQ0s7O0FBNEM1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxnQkFBZ0IsRUFBRUMsSUFBSSxDQUFDQyxLQUFMLENBQVdDLDRCQUFYLENBaERVOztBQWtENUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0Ms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QkFBb0IsQ0FBQ0MsUUFBckM7QUFDQStHLElBQUFBLElBQUksQ0FBQ3ZELEdBQUwsYUFBY3dELGFBQWQ7QUFDQUQsSUFBQUEsSUFBSSxDQUFDaEcsYUFBTCxHQUFxQmhCLG9CQUFvQixDQUFDZ0IsYUFBMUM7QUFDQWdHLElBQUFBLElBQUksQ0FBQ1IsZ0JBQUwsR0FBd0J4RyxvQkFBb0IsQ0FBQ3dHLGdCQUE3QztBQUNBUSxJQUFBQSxJQUFJLENBQUNELGVBQUwsR0FBdUIvRyxvQkFBb0IsQ0FBQytHLGVBQTVDO0FBQ0FDLElBQUFBLElBQUksQ0FBQ3RFLFVBQUw7QUFDQTtBQWpkMkIsQ0FBN0I7QUFvZEF4QyxDQUFDLENBQUNnSCxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCbkgsRUFBQUEsb0JBQW9CLENBQUMwQyxVQUFyQjtBQUNBLENBRkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogTWlrb1BCWCAtIGZyZWUgcGhvbmUgc3lzdGVtIGZvciBzbWFsbCBidXNpbmVzc1xuICogQ29weXJpZ2h0IMKpIDIwMTctMjAyMyBBbGV4ZXkgUG9ydG5vdiBhbmQgTmlrb2xheSBCZWtldG92XG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtLlxuICogSWYgbm90LCBzZWUgPGh0dHBzOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCwgZ2xvYmFsVHJhbnNsYXRlLCBGb3JtLCBQYnhBcGksIG1vZHVsZV9sZGFwX3VzZXJEaXNhYmxlZEF0dHJpYnV0ZSwgbW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcywgQ29uZmlnLCBVc2VyTWVzc2FnZSAqL1xuXG4vKipcbiAqIE1vZHVsZUxkYXBTeW5jTW9kaWZ5XG4gKlxuICogVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBzeW5jaHJvbml6aW5nIExEQVAgdXNlcnMgYW5kXG4gKiBvdGhlciByZWxhdGVkIGZlYXR1cmVzLlxuICovXG5jb25zdCBNb2R1bGVMZGFwU3luY01vZGlmeSA9IHtcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGZvcm0uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS1sZGFwLXN5bmMtZm9ybScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc2VydmVyIHR5cGUgZHJvcGRvd24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcFR5cGVEcm9wZG93bjogJCgnLnNlbGVjdC1sZGFwLWZpZWxkJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBnZXR0aW5nIExEQVAgdXNlcnMgbGlzdCBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkY2hlY2tHZXRVc2Vyc0J1dHRvbjogJCgnLmNoZWNrLWxkYXAtZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIGNoZWNrIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50OiAkKCcjbGRhcC1jaGVjay1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN5bmMgTERBUCB1c2VycyBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzQnV0dG9uOiAkKCcubGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIHN5bmMgdXNlcnMgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNTZWdtZW50OiAkKCcjbGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggdXNlciBkaXNhYmxlZCBhdHRyaWJ1dGUgaWRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdHVzZXJEaXNhYmxlZEF0dHJpYnV0ZTogbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIGhpZGRlbiB1c2VycyBhdHRyaWJ1dGVzXG5cdCAqIEB0eXBlIHthcnJheX1cblx0ICovXG5cdGhpZGRlbkF0dHJpYnV0ZXM6IEpTT04ucGFyc2UobW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtYW4gdGFiIG1lbnUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbWFpblRhYk1lbnU6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS1tZW51JyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtZXNzYWdlIG5vIGFueSBjb25mbGljdHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyOiAkKCcjbm8tYW55LWNvbmZsaWN0cy1wbGFjZWhvbGRlcicpLFxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgZm9ybSBmaWVsZHMuXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0c2VydmVyTmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlck5hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZXJ2ZXJQb3J0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyUG9ydCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlTG9naW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZUxvZ2luJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRiYXNlRE46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYXNlRE4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJOYW1lQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlck5hbWVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlck1vYmlsZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJNb2JpbGVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRXh0ZW5zaW9uQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckV4dGVuc2lvbkF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJFbWFpbEF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFbWFpbEF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFbWFpbEF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckFjY291bnRDb250cm9sOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckFjY291bnRDb250cm9sJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHQvLyBIYW5kbGUgZ2V0IHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldExkYXBVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsU3luY1VzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbWFpblRhYk1lbnUudGFiKCk7XG5cblx0XHQvLyBIYW5kbGUgZGVsZXRlIGNvbmZsaWN0IGJ1dHRvbiBjbGlja1xuXHRcdCQoJ2JvZHknKS5vbignY2xpY2snLCAnLmRlbGV0ZS1jb25mbGljdCcsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGNvbnN0IHJlY29yZElkID0gJChlLnRhcmdldCkuY2xvc2VzdCgndHInKS5kYXRhKCd2YWx1ZScpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbERlbGV0ZUNvbmZsaWN0KHJlY29yZElkKTtcblx0XHR9KTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGRlbGV0ZSBzeW5jIGNvbmZsaWN0IHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdCByb3cgb24gdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSByZWNvcmRJZFxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICovXG5cdGFwaUNhbGxEZWxldGVDb25mbGljdChyZWNvcmRJZCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEucmVjb3JkSWQgPSByZWNvcmRJZDtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3QnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoYCNjb25mbGljdHMtcmVzdWx0IHRyW2RhdGEtdmFsdWU9XCIke3JlY29yZElkfVwiXWApLnJlbW92ZSgpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3QnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBsYXN0IHN5bmMgY29uZmxpY3RzXG5cdCAqL1xuXHRhcGlDYWxsR2V0Q29uZmxpY3RzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5oaWRlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRpZiAoJChgI2NvbmZsaWN0cy1yZXN1bHQgdHJgKS5sZW5ndGg9PT0wKXtcblx0XHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5zaG93KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbEdldExkYXBVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBzeW5jIExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxTeW5jVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvc3luYy1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdzeW5jLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSB1c2VyJ3MgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB1c2Vyc0xpc3QgLSBUaGUgbGlzdCBvZiB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QodXNlcnNMaXN0KXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRodG1sICs9Jzx0aD4nK2luZGV4Kyc8L3RoPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggdXNlciBkYXRhXG5cdFx0JC5lYWNoKHVzZXJzTGlzdCwgKGluZGV4LCB1c2VyKSA9PiB7XG5cdFx0XHRjb25zdCByb3dDbGFzcyA9IHVzZXJbTW9kdWxlTGRhcFN5bmNNb2RpZnkudXNlckRpc2FibGVkQXR0cmlidXRlXT09PXRydWU/J2Rpc2FibGVkJzonaXRlbSc7XG5cdFx0XHRodG1sICs9IGA8dHIgY2xhc3M9XCIke3Jvd0NsYXNzfVwiPmA7XG5cdFx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGF0dHJJbmRleCwgYXR0clZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNlbGxWYWx1ZSA9IHVzZXJbYXR0ckluZGV4XSB8fCAnJztcblx0XHRcdFx0aHRtbCArPSAnPHRkPicrY2VsbFZhbHVlKyc8L3RkPic7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIHRhYmxlIGZyb20gdGhlIGNvbmZsaWN0cyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvbmZsaWN0cyAtIFRoZSBsaXN0IG9mIGNvbmZsaWN0c1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0KGNvbmZsaWN0cyl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImNvbmZsaWN0cy1yZXN1bHRcIj4nO1xuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgY29uZmxpY3RzIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0VGltZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RVc2VyRGF0YScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RTaWRlJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdEVycm9yTWVzc2FnZXMnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPjwvdGg+Jztcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCBjb25mbGljdHMgZGF0YVxuXHRcdCQuZWFjaChjb25mbGljdHMsIChpbmRleCwgcmVjb3JkKSA9PiB7XG5cdFx0XHRodG1sICs9IGA8dHIgY2xhc3M9XCJpdGVtXCIgZGF0YS12YWx1ZT1cIiR7cmVjb3JkWydpZCddfVwiPmA7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2xhc3RUaW1lJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKHJlY29yZFsnc2lkZSddKSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydwYXJhbXMnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrcmVjb3JkWydlcnJvcnMnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSBgPHRkPjxkaXYgY2xhc3M9XCJ1aSBpY29uIGJhc2ljIGJ1dHRvbiBwb3B1cGVkIGRlbGV0ZS1jb25mbGljdFwiIGRhdGEtY29udGVudD1cIiR7TW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ2RlbGV0ZUN1cnJlbnRDb25mbGljdCcpfVwiPjxpIGNsYXNzPVwiaWNvbiB0cmFzaCByZWRcIj48L2k+PC9kaXY+PC90ZD5gO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gdGV4dCB1c2luZyB0aGUgZ2xvYmFsIHRyYW5zbGF0aW9uIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBiZSB0cmFuc2xhdGVkLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgdHJhbnNsYXRlZCB0ZXh0IGlmIGF2YWlsYWJsZSwgb3IgdGhlIG9yaWdpbmFsIHRleHQuXG5cdCAqL1xuXHRnZXRUcmFuc2xhdGlvbih0ZXh0KXtcblx0XHRjb25zdCBuYW1lVGVtcGxhdGUgPSBgbW9kdWxlX2xkYXBfJHt0ZXh0fWA7XG5cdFx0Y29uc3QgbmFtZSA9IGdsb2JhbFRyYW5zbGF0ZVtuYW1lVGVtcGxhdGVdO1xuXHRcdGlmIChuYW1lIT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=