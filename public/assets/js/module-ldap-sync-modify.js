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

/* global globalRootUrl, globalTranslate, Form, PbxApi */

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
    userIdAttribute: {
      identifier: 'userIdAttribute',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.module_ldap_ValidateUserIdAttributeIsEmpty
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
      html += '<th>' + ModuleLdapSyncModify.getTranslation(index) + '</th>';
    });
    html += '</tr></thead>'; // Generate the HTML table with user data

    $.each(usersList, function (index, user) {
      var rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item';
      html += "<tr class=\"".concat(rowClass, "\">");
      $.each(uniqueAttributes, function (attrIndex, attrValue) {
        var cellValue = user[attrIndex] || '';
        html += '<td>' + ModuleLdapSyncModify.getTranslation(cellValue) + '</td>';
      });
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
    } else {
      return text;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCJ2YWxpZGF0ZVJ1bGVzIiwic2VydmVyTmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5Iiwic2VydmVyUG9ydCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZUxvZ2luIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSIsImFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5IiwiYmFzZUROIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5IiwidXNlcklkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VySWRBdHRyaWJ1dGVJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwiYXBpIiwidXJsIiwiQ29uZmlnIiwicGJ4VXJsIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiYWRkQ2xhc3MiLCJkYXRhIiwiZm9ybSIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmVDbGFzcyIsInJlbW92ZSIsImh0bWwiLCJidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCIsImFmdGVyIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsInVzZXJzTGlzdCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJlYWNoIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluZGV4IiwidmFsdWUiLCJpbmNsdWRlcyIsImdldFRyYW5zbGF0aW9uIiwidXNlciIsInJvd0NsYXNzIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwidGV4dCIsIm5hbWVUZW1wbGF0ZSIsIm5hbWUiLCJ1bmRlZmluZWQiLCJjYkJlZm9yZVNlbmRGb3JtIiwicmVzdWx0IiwiZmluZCIsIm9iaiIsImlucHV0IiwiaWQiLCJhdHRyIiwiY2hlY2tib3giLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwiZ2xvYmFsUm9vdFVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxvQkFBb0IsR0FBRztBQUU1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQyx3QkFBRCxDQU5pQjs7QUFRNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsaUJBQWlCLEVBQUVELENBQUMsQ0FBQyxvQkFBRCxDQVpROztBQWM1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDRSxFQUFBQSxv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ekYsUUFBTCxHQUFnQkQsb0JBQW9CLENBQUNDLFFBQXJDO0FBQ0F5RixJQUFBQSxJQUFJLENBQUNqRCxHQUFMLGFBQWNrRCxhQUFkO0FBQ0FELElBQUFBLElBQUksQ0FBQzVFLGFBQUwsR0FBcUJkLG9CQUFvQixDQUFDYyxhQUExQztBQUNBNEUsSUFBQUEsSUFBSSxDQUFDVCxnQkFBTCxHQUF3QmpGLG9CQUFvQixDQUFDaUYsZ0JBQTdDO0FBQ0FTLElBQUFBLElBQUksQ0FBQ0QsZUFBTCxHQUF1QnpGLG9CQUFvQixDQUFDeUYsZUFBNUM7QUFDQUMsSUFBQUEsSUFBSSxDQUFDMUQsVUFBTDtBQUNBO0FBalQyQixDQUE3QjtBQW9UQTlCLENBQUMsQ0FBQzBGLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkI3RixFQUFBQSxvQkFBb0IsQ0FBQ2dDLFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSAqL1xuXG4vKipcbiAqIE1vZHVsZUxkYXBTeW5jTW9kaWZ5XG4gKlxuICogVGhpcyBvYmplY3QgaGFuZGxlcyB0aGUgZnVuY3Rpb25hbGl0eSBvZiBzeW5jaHJvbml6aW5nIExEQVAgdXNlcnMgYW5kXG4gKiBvdGhlciByZWxhdGVkIGZlYXR1cmVzLlxuICovXG5jb25zdCBNb2R1bGVMZGFwU3luY01vZGlmeSA9IHtcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGZvcm0uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZm9ybU9iajogJCgnI21vZHVsZS1sZGFwLXN5bmMtZm9ybScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc2VydmVyIHR5cGUgZHJvcGRvd24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcFR5cGVEcm9wZG93bjogJCgnLnNlbGVjdC1sZGFwLWZpZWxkJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBnZXR0aW5nIExEQVAgdXNlcnMgbGlzdCBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkY2hlY2tHZXRVc2Vyc0J1dHRvbjogJCgnLmNoZWNrLWxkYXAtZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIGNoZWNrIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50OiAkKCcjbGRhcC1jaGVjay1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHN5bmMgTERBUCB1c2VycyBidXR0b24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzQnV0dG9uOiAkKCcubGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBsZGFwIHN5bmMgdXNlcnMgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNTZWdtZW50OiAkKCcjbGRhcC1zeW5jLXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggdXNlciBkaXNhYmxlZCBhdHRyaWJ1dGUgaWRcblx0ICogQHR5cGUge3N0cmluZ31cblx0ICovXG5cdHVzZXJEaXNhYmxlZEF0dHJpYnV0ZTogbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLFxuXG5cdC8qKlxuXHQgKiBDb25zdGFudCB3aXRoIGhpZGRlbiB1c2VycyBhdHRyaWJ1dGVzXG5cdCAqIEB0eXBlIHthcnJheX1cblx0ICovXG5cdGhpZGRlbkF0dHJpYnV0ZXM6IEpTT04ucGFyc2UobW9kdWxlX2xkYXBfaGlkZGVuQXR0cmlidXRlcyksXG5cblx0LyoqXG5cdCAqIFZhbGlkYXRpb24gcnVsZXMgZm9yIHRoZSBmb3JtIGZpZWxkcy5cblx0ICogQHR5cGUge09iamVjdH1cblx0ICovXG5cdHZhbGlkYXRlUnVsZXM6IHtcblx0XHRzZXJ2ZXJOYW1lOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyTmFtZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHNlcnZlclBvcnQ6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJQb3J0Jyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVMb2dpbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlTG9naW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGJhc2VETjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2Jhc2VETicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUJhc2VETklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlcklkQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlcklkQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlcklkQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHQvLyBIYW5kbGUgZ2V0IHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldExkYXBVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsU3luY1VzZXJzKCk7XG5cdFx0fSk7XG5cblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbEdldExkYXBVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBzeW5jIExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxTeW5jVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvc3luYy1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdzeW5jLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSB1c2VyJ3MgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB1c2Vyc0xpc3QgLSBUaGUgbGlzdCBvZiB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QodXNlcnNMaXN0KXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGluZGV4KSsnPC90aD4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Y29uc3Qgcm93Q2xhc3MgPSB1c2VyW01vZHVsZUxkYXBTeW5jTW9kaWZ5LnVzZXJEaXNhYmxlZEF0dHJpYnV0ZV09PT10cnVlPydkaXNhYmxlZCc6J2l0ZW0nO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiJHtyb3dDbGFzc31cIj5gO1xuXHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjZWxsVmFsdWUgPSB1c2VyW2F0dHJJbmRleF0gfHwgJyc7XG5cdFx0XHRcdGh0bWwgKz0gJzx0ZD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGNlbGxWYWx1ZSkrJzwvdGQ+Jztcblx0XHRcdH0pO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gdGV4dCB1c2luZyB0aGUgZ2xvYmFsIHRyYW5zbGF0aW9uIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBiZSB0cmFuc2xhdGVkLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgdHJhbnNsYXRlZCB0ZXh0IGlmIGF2YWlsYWJsZSwgb3IgdGhlIG9yaWdpbmFsIHRleHQuXG5cdCAqL1xuXHRnZXRUcmFuc2xhdGlvbih0ZXh0KXtcblx0XHRjb25zdCBuYW1lVGVtcGxhdGUgPSBgbW9kdWxlX2xkYXBfJHt0ZXh0fWA7XG5cdFx0Y29uc3QgbmFtZSA9IGdsb2JhbFRyYW5zbGF0ZVtuYW1lVGVtcGxhdGVdO1xuXHRcdGlmIChuYW1lIT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBUaGUgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBzZXR0aW5ncyBvYmplY3QuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5maW5kKCcuY2hlY2tib3gnKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRjb25zdCBpbnB1dCA9ICQob2JqKS5maW5kKCdpbnB1dCcpO1xuXHRcdFx0Y29uc3QgaWQgPSBpbnB1dC5hdHRyKCdpZCcpO1xuXHRcdFx0aWYgKCQob2JqKS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRcdHJlc3VsdC5kYXRhW2lkXT0nMSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzAnO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblx0XHQvLyBDYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==