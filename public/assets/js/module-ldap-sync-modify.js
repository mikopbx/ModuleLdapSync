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
      html += "<th>".concat(index, "</th>");
    });
    html += '</tr></thead>'; // Generate the HTML table with user data

    $.each(usersList, function (index, user) {
      var rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item';
      html += "<tr class=\"".concat(rowClass, "\">");
      $.each(uniqueAttributes, function (attrIndex, attrValue) {
        var cellValue = user[attrIndex] || '';
        html += "<td>".concat(cellValue, "</td>");
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCJ2YWxpZGF0ZVJ1bGVzIiwic2VydmVyTmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5Iiwic2VydmVyUG9ydCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZUxvZ2luIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSIsImFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5IiwiYmFzZUROIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5IiwidXNlcklkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VySWRBdHRyaWJ1dGVJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwiaW5pdGlhbGl6ZUZvcm0iLCJvbiIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFwaUNhbGxHZXRMZGFwVXNlcnMiLCJhcGlDYWxsU3luY1VzZXJzIiwiYXBpIiwidXJsIiwiQ29uZmlnIiwicGJ4VXJsIiwibWV0aG9kIiwiYmVmb3JlU2VuZCIsInNldHRpbmdzIiwiYWRkQ2xhc3MiLCJkYXRhIiwiZm9ybSIsInN1Y2Nlc3NUZXN0IiwiUGJ4QXBpIiwib25TdWNjZXNzIiwicmVzcG9uc2UiLCJyZW1vdmVDbGFzcyIsInJlbW92ZSIsImh0bWwiLCJidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCIsImFmdGVyIiwib25GYWlsdXJlIiwiVXNlck1lc3NhZ2UiLCJzaG93TXVsdGlTdHJpbmciLCJtZXNzYWdlcyIsInVzZXJzTGlzdCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJlYWNoIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluZGV4IiwidmFsdWUiLCJpbmNsdWRlcyIsInVzZXIiLCJyb3dDbGFzcyIsImF0dHJJbmRleCIsImF0dHJWYWx1ZSIsImNlbGxWYWx1ZSIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJmaW5kIiwib2JqIiwiaW5wdXQiLCJpZCIsImF0dHIiLCJjaGVja2JveCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJnbG9iYWxSb290VXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBR0EsSUFBTUEsb0JBQW9CLEdBQUc7QUFFNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsd0JBQUQsQ0FOaUI7O0FBUTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGlCQUFpQixFQUFFRCxDQUFDLENBQUMsb0JBQUQsQ0FaUTs7QUFjNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsb0JBQW9CLEVBQUVGLENBQUMsQ0FBQyx1QkFBRCxDQWxCSzs7QUFvQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NHLEVBQUFBLHlCQUF5QixFQUFFSCxDQUFDLENB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QWQ7QUFDQSxVQUFNRyxFQUFFLEdBQUdELEtBQUssQ0FBQ0UsSUFBTixDQUFXLElBQVgsQ0FBWDs7QUFDQSxVQUFJaEYsQ0FBQyxDQUFDNkUsR0FBRCxDQUFELENBQU9JLFFBQVAsQ0FBZ0IsWUFBaEIsQ0FBSixFQUFtQztBQUNsQ04sUUFBQUEsTUFBTSxDQUFDN0IsSUFBUCxDQUFZaUMsRUFBWixJQUFnQixHQUFoQjtBQUNBLE9BRkQsTUFFTztBQUNOSixRQUFBQSxNQUFNLENBQUM3QixJQUFQLENBQVlpQyxFQUFaLElBQWdCLEdBQWhCO0FBQ0E7QUFDRCxLQVJEO0FBVUEsV0FBT0osTUFBUDtBQUNBLEdBclEyQjs7QUF1UTVCO0FBQ0Q7QUFDQTtBQUNDTyxFQUFBQSxlQTFRNEIsNkJBMFFWLENBQ2pCO0FBQ0EsR0E1UTJCOztBQThRNUI7QUFDRDtBQUNBO0FBQ0NsRCxFQUFBQSxjQWpSNEIsNEJBaVJYO0FBQ2hCbUQsSUFBQUEsSUFBSSxDQUFDcEYsUUFBTCxHQUFnQkQsb0JBQW9CLENBQUNDLFFBQXJDO0FBQ0FvRixJQUFBQSxJQUFJLENBQUM1QyxHQUFMLGFBQWM2QyxhQUFkO0FBQ0FELElBQUFBLElBQUksQ0FBQ3ZFLGFBQUwsR0FBcUJkLG9CQUFvQixDQUFDYyxhQUExQztBQUNBdUUsSUFBQUEsSUFBSSxDQUFDVCxnQkFBTCxHQUF3QjVFLG9CQUFvQixDQUFDNEUsZ0JBQTdDO0FBQ0FTLElBQUFBLElBQUksQ0FBQ0QsZUFBTCxHQUF1QnBGLG9CQUFvQixDQUFDb0YsZUFBNUM7QUFDQUMsSUFBQUEsSUFBSSxDQUFDckQsVUFBTDtBQUNBO0FBeFIyQixDQUE3QjtBQTJSQTlCLENBQUMsQ0FBQ3FGLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJ4RixFQUFBQSxvQkFBb0IsQ0FBQ2dDLFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSAqL1xuXG5cbmNvbnN0IE1vZHVsZUxkYXBTeW5jTW9kaWZ5ID0ge1xuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLWxkYXAtc3luYy1mb3JtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzZXJ2ZXIgdHlwZSBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwVHlwZURyb3Bkb3duOiAkKCcuc2VsZWN0LWxkYXAtZmllbGQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGdldHRpbmcgTERBUCB1c2VycyBsaXN0IGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjaGVja0dldFVzZXJzQnV0dG9uOiAkKCcuY2hlY2stbGRhcC1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgY2hlY2sgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLWNoZWNrLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3luYyBMREFQIHVzZXJzIGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNCdXR0b246ICQoJy5sZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgc3luYyB1c2VycyBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCB1c2VyIGRpc2FibGVkIGF0dHJpYnV0ZSBpZFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0dXNlckRpc2FibGVkQXR0cmlidXRlOiBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggaGlkZGVuIHVzZXJzIGF0dHJpYnV0ZXNcblx0ICogQHR5cGUge2FycmF5fVxuXHQgKi9cblx0aGlkZGVuQXR0cmlidXRlczogSlNPTi5wYXJzZShtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzKSxcblxuXHQvKipcblx0ICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzLlxuXHQgKiBAdHlwZSB7T2JqZWN0fVxuXHQgKi9cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdHNlcnZlck5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJOYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0c2VydmVyUG9ydDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlclBvcnQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZUxvZ2luOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVMb2dpbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YmFzZUROOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYmFzZUROJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VySWRBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VySWRBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VySWRBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcFR5cGVEcm9wZG93bi5kcm9wZG93bigpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZUZvcm0oKTtcblxuXHRcdC8vIEhhbmRsZSBnZXQgdXNlcnMgbGlzdCBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0TGRhcFVzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgc3luYyB1c2VycyBidXR0b24gY2xpY2tcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxTeW5jVXNlcnMoKTtcblx0XHR9KTtcblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGdldCBMREFQIHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrLlxuXHQgKi9cblx0YXBpQ2FsbEdldExkYXBVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9nZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLmFkZENsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdHNldHRpbmdzLmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHRhcGlDYWxsU3luY1VzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHRidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCh1c2Vyc0xpc3Qpe1xuXHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJsZGFwLXJlc3VsdFwiPic7XG5cdFx0Y29uc3QgdW5pcXVlQXR0cmlidXRlcyA9IHt9O1xuXG5cdFx0Ly8gRXh0cmFjdCB1bmlxdWUgYXR0cmlidXRlcyBmcm9tIHRoZSByZXNwb25zZSBkYXRhXG5cdFx0JC5lYWNoKHVzZXJzTGlzdCwgKHVzZXJLZXksIHVzZXJWYWx1ZSkgPT4ge1xuXHRcdFx0JC5lYWNoKHVzZXJWYWx1ZSwgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAoTW9kdWxlTGRhcFN5bmNNb2RpZnkuaGlkZGVuQXR0cmlidXRlcy5pbmNsdWRlcyhpbmRleCkpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0dW5pcXVlQXR0cmlidXRlc1tpbmRleF0gPSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIHVzZXIgZGF0YSBhdHRyaWJ1dGVzXG5cdFx0aHRtbCArPSAnPHRoZWFkPjx0cj4nXG5cdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdGh0bWwgKz1gPHRoPiR7aW5kZXh9PC90aD5gO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Y29uc3Qgcm93Q2xhc3MgPSB1c2VyW01vZHVsZUxkYXBTeW5jTW9kaWZ5LnVzZXJEaXNhYmxlZEF0dHJpYnV0ZV09PT10cnVlPydkaXNhYmxlZCc6J2l0ZW0nO1xuXHRcdFx0aHRtbCArPSBgPHRyIGNsYXNzPVwiJHtyb3dDbGFzc31cIj5gO1xuXHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjZWxsVmFsdWUgPSB1c2VyW2F0dHJJbmRleF0gfHwgJyc7XG5cdFx0XHRcdGh0bWwgKz0gYDx0ZD4ke2NlbGxWYWx1ZX08L3RkPmA7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBUaGUgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBzZXR0aW5ncyBvYmplY3QuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5maW5kKCcuY2hlY2tib3gnKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRjb25zdCBpbnB1dCA9ICQob2JqKS5maW5kKCdpbnB1dCcpO1xuXHRcdFx0Y29uc3QgaWQgPSBpbnB1dC5hdHRyKCdpZCcpO1xuXHRcdFx0aWYgKCQob2JqKS5jaGVja2JveCgnaXMgY2hlY2tlZCcpKSB7XG5cdFx0XHRcdHJlc3VsdC5kYXRhW2lkXT0nMSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzAnO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblx0XHQvLyBDYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==