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
   * Handles get LDAP users list button click.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCJ2YWxpZGF0ZVJ1bGVzIiwic2VydmVyTmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5Iiwic2VydmVyUG9ydCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZUxvZ2luIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSIsImFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5IiwiYmFzZUROIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5IiwidXNlcklkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VySWRBdHRyaWJ1dGVJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwiYXBpIiwidXJsIiwiQ29uZmlnIiwicGJ4VXJsIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiYWRkQ2xhc3MiLCJkYXRhIiwiZm9ybSIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmVDbGFzcyIsInJlbW92ZSIsImh0bWwiLCJidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCIsImFmdGVyIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsInVzZXJzTGlzdCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJlYWNoIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluZGV4IiwidmFsdWUiLCJpbmNsdWRlcyIsImdldFRyYW5zbGF0aW9uIiwidXNlciIsInJvd0NsYXNzIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwidGV4dCIsIm5hbWVUZW1wbGF0ZSIsIm5hbWUiLCJ1bmRlZmluZWQiLCJjYkJlZm9yZVNlbmRGb3JtIiwicmVzdWx0IiwiZmluZCIsIm9iaiIsImlucHV0IiwiaWQiLCJhdHRyIiwiY2hlY2tib3giLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwiZ2xvYmFsUm9vdFVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUdBLElBQU1BLG9CQUFvQixHQUFHO0FBRTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLFFBQVEsRUFBRUMsQ0FBQyxDQUFDLHdCQUFELENBTmlCOztBQVE1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxpQkFBaUIsRUFBRUQsQ0FBQyxDQUFDLG9CQUFELENBWlE7O0FBYzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NFLEVBQUFBLG9CQUFvQixFQUFFRixDQUFDLENBQUMsdUJBQUQsQ0Fs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Q0FELElBQUFBLElBQUksQ0FBQzVFLGFBQUwsR0FBcUJkLG9CQUFvQixDQUFDYyxhQUExQztBQUNBNEUsSUFBQUEsSUFBSSxDQUFDVCxnQkFBTCxHQUF3QmpGLG9CQUFvQixDQUFDaUYsZ0JBQTdDO0FBQ0FTLElBQUFBLElBQUksQ0FBQ0QsZUFBTCxHQUF1QnpGLG9CQUFvQixDQUFDeUYsZUFBNUM7QUFDQUMsSUFBQUEsSUFBSSxDQUFDMUQsVUFBTDtBQUNBO0FBdlMyQixDQUE3QjtBQTBTQTlCLENBQUMsQ0FBQzBGLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkI3RixFQUFBQSxvQkFBb0IsQ0FBQ2dDLFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSAqL1xuXG5cbmNvbnN0IE1vZHVsZUxkYXBTeW5jTW9kaWZ5ID0ge1xuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLWxkYXAtc3luYy1mb3JtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzZXJ2ZXIgdHlwZSBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwVHlwZURyb3Bkb3duOiAkKCcuc2VsZWN0LWxkYXAtZmllbGQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGdldHRpbmcgTERBUCB1c2VycyBsaXN0IGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjaGVja0dldFVzZXJzQnV0dG9uOiAkKCcuY2hlY2stbGRhcC1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgY2hlY2sgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLWNoZWNrLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3luYyBMREFQIHVzZXJzIGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNCdXR0b246ICQoJy5sZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgc3luYyB1c2VycyBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCB1c2VyIGRpc2FibGVkIGF0dHJpYnV0ZSBpZFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0dXNlckRpc2FibGVkQXR0cmlidXRlOiBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggaGlkZGVuIHVzZXJzIGF0dHJpYnV0ZXNcblx0ICogQHR5cGUge2FycmF5fVxuXHQgKi9cblx0aGlkZGVuQXR0cmlidXRlczogSlNPTi5wYXJzZShtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzKSxcblxuXHQvKipcblx0ICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzLlxuXHQgKiBAdHlwZSB7T2JqZWN0fVxuXHQgKi9cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdHNlcnZlck5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJOYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0c2VydmVyUG9ydDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlclBvcnQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZUxvZ2luOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVMb2dpbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YmFzZUROOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYmFzZUROJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VySWRBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VySWRBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VySWRBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcFR5cGVEcm9wZG93bi5kcm9wZG93bigpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZUZvcm0oKTtcblxuXHRcdC8vIEhhbmRsZSBnZXQgdXNlcnMgbGlzdCBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0TGRhcFVzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxTeW5jVXNlcnMoKTtcblx0XHR9KTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGdldCBMREFQIHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrLlxuXHQgKi9cblx0YXBpQ2FsbEdldExkYXBVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHRhcGlDYWxsU3luY1VzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHRidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCh1c2Vyc0xpc3Qpe1xuXHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJsZGFwLXJlc3VsdFwiPic7XG5cdFx0Y29uc3QgdW5pcXVlQXR0cmlidXRlcyA9IHt9O1xuXG5cdFx0Ly8gRXh0cmFjdCB1bmlxdWUgYXR0cmlidXRlcyBmcm9tIHRoZSByZXNwb25zZSBkYXRhXG5cdFx0JC5lYWNoKHVzZXJzTGlzdCwgKHVzZXJLZXksIHVzZXJWYWx1ZSkgPT4ge1xuXHRcdFx0JC5lYWNoKHVzZXJWYWx1ZSwgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAoTW9kdWxlTGRhcFN5bmNNb2RpZnkuaGlkZGVuQXR0cmlidXRlcy5pbmNsdWRlcyhpbmRleCkpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5pcXVlQXR0cmlidXRlc1tpbmRleF0gPSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIHVzZXIgZGF0YSBhdHRyaWJ1dGVzXG5cdFx0aHRtbCArPSAnPHRoZWFkPjx0cj4nXG5cdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oaW5kZXgpKyc8L3RoPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggdXNlciBkYXRhXG5cdFx0JC5lYWNoKHVzZXJzTGlzdCwgKGluZGV4LCB1c2VyKSA9PiB7XG5cdFx0XHRjb25zdCByb3dDbGFzcyA9IHVzZXJbTW9kdWxlTGRhcFN5bmNNb2RpZnkudXNlckRpc2FibGVkQXR0cmlidXRlXT09PXRydWU/J2Rpc2FibGVkJzonaXRlbSc7XG5cdFx0XHRodG1sICs9IGA8dHIgY2xhc3M9XCIke3Jvd0NsYXNzfVwiPmA7XG5cdFx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGF0dHJJbmRleCwgYXR0clZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNlbGxWYWx1ZSA9IHVzZXJbYXR0ckluZGV4XSB8fCAnJztcblx0XHRcdFx0aHRtbCArPSAnPHRkPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oY2VsbFZhbHVlKSsnPC90ZD4nO1xuXHRcdFx0fSk7XG5cdFx0XHRodG1sICs9ICc8L3RyPic7XG5cdFx0fSk7XG5cdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmFuc2xhdGVzIHRoZSBnaXZlbiB0ZXh0IHVzaW5nIHRoZSBnbG9iYWwgdHJhbnNsYXRpb24gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFRoZSB0ZXh0IHRvIGJlIHRyYW5zbGF0ZWQuXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSB0cmFuc2xhdGVkIHRleHQgaWYgYXZhaWxhYmxlLCBvciB0aGUgb3JpZ2luYWwgdGV4dC5cblx0ICovXG5cdGdldFRyYW5zbGF0aW9uKHRleHQpe1xuXHRcdGNvbnN0IG5hbWVUZW1wbGF0ZSA9IGBtb2R1bGVfbGRhcF8ke3RleHR9YDtcblx0XHRjb25zdCBuYW1lID0gZ2xvYmFsVHJhbnNsYXRlW25hbWVUZW1wbGF0ZV07XG5cdFx0aWYgKG5hbWUhPT11bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBuYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=