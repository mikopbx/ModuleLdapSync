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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCJ2YWxpZGF0ZVJ1bGVzIiwic2VydmVyTmFtZSIsImlkZW50aWZpZXIiLCJydWxlcyIsInR5cGUiLCJwcm9tcHQiLCJnbG9iYWxUcmFuc2xhdGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlck5hbWVJc0VtcHR5Iiwic2VydmVyUG9ydCIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyUG9ydElzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZUxvZ2luIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZUxvZ2luSXNFbXB0eSIsImFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4iLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlUGFzc3dvcmRJc0VtcHR5IiwiYmFzZUROIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5IiwidXNlck5hbWVBdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJOYW1lQXR0cmlidXRlSXNFbXB0eSIsInVzZXJNb2JpbGVBdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJNb2JpbGVBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckV4dGVuc2lvbkF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckV4dGVuc2lvbkF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyRW1haWxBdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFbWFpbEF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyQWNjb3VudENvbnRyb2wiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJBY2NvdW50Q29udHJvbElzRW1wdHkiLCJpbml0aWFsaXplIiwiZHJvcGRvd24iLCJpbml0aWFsaXplRm9ybSIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiYXBpQ2FsbEdldExkYXBVc2VycyIsImFwaUNhbGxTeW5jVXNlcnMiLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJhZGRDbGFzcyIsImRhdGEiLCJmb3JtIiwic3VjY2Vzc1Rlc3QiLCJQYnhBcGkiLCJvblN1Y2Nlc3MiLCJyZXNwb25zZSIsInJlbW92ZUNsYXNzIiwicmVtb3ZlIiwiaHRtbCIsImJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0IiwiYWZ0ZXIiLCJvbkZhaWx1cmUiLCJVc2VyTWVzc2FnZSIsInNob3dNdWx0aVN0cmluZyIsIm1lc3NhZ2VzIiwidXNlcnNMaXN0IiwidW5pcXVlQXR0cmlidXRlcyIsImVhY2giLCJ1c2VyS2V5IiwidXNlclZhbHVlIiwiaW5kZXgiLCJ2YWx1ZSIsImluY2x1ZGVzIiwiZ2V0VHJhbnNsYXRpb24iLCJ1c2VyIiwicm93Q2xhc3MiLCJhdHRySW5kZXgiLCJhdHRyVmFsdWUiLCJjZWxsVmFsdWUiLCJ0ZXh0IiwibmFtZVRlbXBsYXRlIiwibmFtZSIsInVuZGVmaW5lZCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJmaW5kIiwib2JqIiwiaW5wdXQiLCJpZCIsImF0dHIiLCJjaGVja2JveCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJnbG9iYWxSb290VXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNEO0FBQ0E7QUFDQ3ZELEVBQUFBLGNBOVU0Qiw0QkE4VVg7QUFDaEJ3RCxJQUFBQSxJQUFJLENBQUNqRyxRQUFMLEdBQWdCRCxvQkFBb0IsQ0FBQ0MsUUFBckM7QUFDQWlHLElBQUFBLElBQUksQ0FBQ2pELEdBQUwsYUFBY2tELGFBQWQ7QUFDQUQsSUFBQUEsSUFBSSxDQUFDcEYsYUFBTCxHQUFxQmQsb0JBQW9CLENBQUNjLGFBQTFDO0FBQ0FvRixJQUFBQSxJQUFJLENBQUNULGdCQUFMLEdBQXdCekYsb0JBQW9CLENBQUN5RixnQkFBN0M7QUFDQVMsSUFBQUEsSUFBSSxDQUFDRCxlQUFMLEdBQXVCakcsb0JBQW9CLENBQUNpRyxlQUE1QztBQUNBQyxJQUFBQSxJQUFJLENBQUMxRCxVQUFMO0FBQ0E7QUFyVjJCLENBQTdCO0FBd1ZBdEMsQ0FBQyxDQUFDa0csUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QnJHLEVBQUFBLG9CQUFvQixDQUFDd0MsVUFBckI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgUGJ4QXBpICovXG5cbi8qKlxuICogTW9kdWxlTGRhcFN5bmNNb2RpZnlcbiAqXG4gKiBUaGlzIG9iamVjdCBoYW5kbGVzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHN5bmNocm9uaXppbmcgTERBUCB1c2VycyBhbmRcbiAqIG90aGVyIHJlbGF0ZWQgZmVhdHVyZXMuXG4gKi9cbmNvbnN0IE1vZHVsZUxkYXBTeW5jTW9kaWZ5ID0ge1xuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLWxkYXAtc3luYy1mb3JtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzZXJ2ZXIgdHlwZSBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwVHlwZURyb3Bkb3duOiAkKCcuc2VsZWN0LWxkYXAtZmllbGQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGdldHRpbmcgTERBUCB1c2VycyBsaXN0IGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjaGVja0dldFVzZXJzQnV0dG9uOiAkKCcuY2hlY2stbGRhcC1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgY2hlY2sgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLWNoZWNrLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3luYyBMREFQIHVzZXJzIGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNCdXR0b246ICQoJy5sZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgc3luYyB1c2VycyBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCB1c2VyIGRpc2FibGVkIGF0dHJpYnV0ZSBpZFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0dXNlckRpc2FibGVkQXR0cmlidXRlOiBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggaGlkZGVuIHVzZXJzIGF0dHJpYnV0ZXNcblx0ICogQHR5cGUge2FycmF5fVxuXHQgKi9cblx0aGlkZGVuQXR0cmlidXRlczogSlNPTi5wYXJzZShtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzKSxcblxuXHQvKipcblx0ICogVmFsaWRhdGlvbiBydWxlcyBmb3IgdGhlIGZvcm0gZmllbGRzLlxuXHQgKiBAdHlwZSB7T2JqZWN0fVxuXHQgKi9cblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdHNlcnZlck5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdzZXJ2ZXJOYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlU2VydmVyTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0c2VydmVyUG9ydDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlclBvcnQnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJQb3J0SXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRhZG1pbmlzdHJhdGl2ZUxvZ2luOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYWRtaW5pc3RyYXRpdmVMb2dpbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZUFkbWluaXN0cmF0aXZlTG9naW5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVQYXNzd29yZElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YmFzZUROOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnYmFzZUROJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyTmFtZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJOYW1lQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck5hbWVBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJNb2JpbGVBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyTW9iaWxlQXR0cmlidXRlJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlck1vYmlsZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckV4dGVuc2lvbkF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFeHRlbnNpb25BdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRXh0ZW5zaW9uQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRW1haWxBdHRyaWJ1dGU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICd1c2VyRW1haWxBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJBY2NvdW50Q29udHJvbDoge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJBY2NvdW50Q29udHJvbCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJBY2NvdW50Q29udHJvbElzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwVHlwZURyb3Bkb3duLmRyb3Bkb3duKCk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5pbml0aWFsaXplRm9ybSgpO1xuXG5cdFx0Ly8gSGFuZGxlIGdldCB1c2VycyBsaXN0IGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRMZGFwVXNlcnMoKTtcblx0XHR9KTtcblxuXHRcdC8vIEhhbmRsZSBzeW5jIHVzZXJzIGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbFN5bmNVc2VycygpO1xuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gZ2V0IExEQVAgdXNlcnNcblx0ICovXG5cdGFwaUNhbGxHZXRMZGFwVXNlcnMoKXtcblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgYW4gQVBJIGNhbGwgdG8gc3luYyBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsU3luY1VzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Vc2Vyc0xpc3QocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNTZWdtZW50LmFmdGVyKGh0bWwpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgdXNlcidzIGxpc3Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gdXNlcnNMaXN0IC0gVGhlIGxpc3Qgb2YgdXNlcnNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHVzZXJzTGlzdCl7XG5cdFx0bGV0IGh0bWwgPSAnPHRhYmxlIGNsYXNzPVwidWkgdmVyeSBjb21wYWN0IHNlbGVjdGFibGUgdGFibGVcIiBpZD1cImxkYXAtcmVzdWx0XCI+Jztcblx0XHRjb25zdCB1bmlxdWVBdHRyaWJ1dGVzID0ge307XG5cblx0XHQvLyBFeHRyYWN0IHVuaXF1ZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHJlc3BvbnNlIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAodXNlcktleSwgdXNlclZhbHVlKSA9PiB7XG5cdFx0XHQkLmVhY2godXNlclZhbHVlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmIChNb2R1bGVMZGFwU3luY01vZGlmeS5oaWRkZW5BdHRyaWJ1dGVzLmluY2x1ZGVzKGluZGV4KSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHR1bmlxdWVBdHRyaWJ1dGVzW2luZGV4XSA9IHRydWU7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIGhlYWQgdXNlciBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihpbmRleCkrJzwvdGg+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+J1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCB1c2VyIGRhdGFcblx0XHQkLmVhY2godXNlcnNMaXN0LCAoaW5kZXgsIHVzZXIpID0+IHtcblx0XHRcdGNvbnN0IHJvd0NsYXNzID0gdXNlcltNb2R1bGVMZGFwU3luY01vZGlmeS51c2VyRGlzYWJsZWRBdHRyaWJ1dGVdPT09dHJ1ZT8nZGlzYWJsZWQnOidpdGVtJztcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIiR7cm93Q2xhc3N9XCI+YDtcblx0XHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoYXR0ckluZGV4LCBhdHRyVmFsdWUpID0+IHtcblx0XHRcdFx0Y29uc3QgY2VsbFZhbHVlID0gdXNlclthdHRySW5kZXhdIHx8ICcnO1xuXHRcdFx0XHRodG1sICs9ICc8dGQ+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihjZWxsVmFsdWUpKyc8L3RkPic7XG5cdFx0XHR9KTtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRyYW5zbGF0ZXMgdGhlIGdpdmVuIHRleHQgdXNpbmcgdGhlIGdsb2JhbCB0cmFuc2xhdGlvbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gVGhlIHRleHQgdG8gYmUgdHJhbnNsYXRlZC5cblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIHRyYW5zbGF0ZWQgdGV4dCBpZiBhdmFpbGFibGUsIG9yIHRoZSBvcmlnaW5hbCB0ZXh0LlxuXHQgKi9cblx0Z2V0VHJhbnNsYXRpb24odGV4dCl7XG5cdFx0Y29uc3QgbmFtZVRlbXBsYXRlID0gYG1vZHVsZV9sZGFwXyR7dGV4dH1gO1xuXHRcdGNvbnN0IG5hbWUgPSBnbG9iYWxUcmFuc2xhdGVbbmFtZVRlbXBsYXRlXTtcblx0XHRpZiAobmFtZSE9PXVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIG5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH1cblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=