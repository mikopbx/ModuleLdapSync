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
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/module-ldap-sync/get-available-ldap-users"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        ModuleLdapSyncModify.$checkGetUsersButton.addClass('loading disabled');
        settings.data = ModuleLdapSyncModify.$formObj.form('get values');
        return settings;
      },
      successTest: function successTest(response) {
        return response.success;
      },

      /**
       * Handles the successful response of the 'get-available-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        ModuleLdapSyncModify.$checkGetUsersButton.removeClass('loading disabled');
        $('#ldap-result').remove();
        $('.ui.message.ajax').remove();
        var html = '<table class="ui very compact selectable table" id="ldap-result">';
        var uniqueAttributes = {}; // Extract unique attributes from the response data

        $.each(response.data, function (userKey, userValue) {
          $.each(userValue, function (index, value) {
            uniqueAttributes[index] = true;
          });
        });
        html += '<thead><tr>';
        $.each(uniqueAttributes, function (index, value) {
          html += "<th>".concat(index, "</th>");
        });
        html += '</tr></thead>'; // Generate the HTML table with user data

        $.each(response.data, function (index, user) {
          html += '<tr class="item">';
          $.each(uniqueAttributes, function (attrIndex, attrValue) {
            var cellValue = user[attrIndex] || '';
            html += "<td>".concat(cellValue, "</td>");
          });
          html += '</tr>';
        });
        html += '</table>';
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
        ModuleLdapSyncModify.$ldapCheckGetUsersSegment.after("<div class=\"ui icon message ajax negative\"><i class=\"icon exclamation circle\"></i>".concat(response.message, "</div>"));
      }
    });
  },
  apiCallSyncUsers: function apiCallSyncUsers() {
    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/module-ldap-sync/sync-ldap-users"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        ModuleLdapSyncModify.$syncUsersButton.addClass('loading disabled');
        settings.data = ModuleLdapSyncModify.$formObj.form('get values');
        return settings;
      },
      successTest: function successTest(response) {
        return response.success;
      },

      /**
       * Handles the successful response of the 'sync-ldap-users' API request.
       * @param {object} response - The response object.
       */
      onSuccess: function onSuccess(response) {
        ModuleLdapSyncModify.$syncUsersButton.removeClass('loading disabled');
        $('#ldap-result').remove();
        $('.ui.message.ajax').remove();
        var html = '<table class="ui very compact selectable table" id="ldap-result">';
        var uniqueAttributes = {}; // Extract unique attributes from the response data

        $.each(response.data, function (userKey, userValue) {
          $.each(userValue, function (index, value) {
            uniqueAttributes[index] = true;
          });
        });
        html += '<thead><tr>';
        $.each(uniqueAttributes, function (index, value) {
          html += "<th>".concat(index, "</th>");
        });
        html += '</tr></thead>'; // Generate the HTML table with user data

        $.each(response.data, function (index, user) {
          html += '<tr class="item">';
          $.each(uniqueAttributes, function (attrIndex, attrValue) {
            var cellValue = user[attrIndex] || '';
            html += "<td>".concat(cellValue, "</td>");
          });
          html += '</tr>';
        });
        html += '</table>';
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
        ModuleLdapSyncModify.$syncUsersSegment.after("<div class=\"ui icon message ajax negative\"><i class=\"icon exclamation circle\"></i>".concat(response.message, "</div>"));
      }
    });
  },

  /**
   * Callback function before sending the form.
   * @param {object} settings - The settings object.
   * @returns {object} - The modified settings object.
   */
  cbBeforeSendForm: function cbBeforeSendForm(settings) {
    var result = settings;
    result.data = ModuleLdapSyncModify.$formObj.form('get values');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJJZEF0dHJpYnV0ZSIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlcklkQXR0cmlidXRlSXNFbXB0eSIsImluaXRpYWxpemUiLCJkcm9wZG93biIsImluaXRpYWxpemVGb3JtIiwib24iLCJlIiwicHJldmVudERlZmF1bHQiLCJhcGlDYWxsR2V0TGRhcFVzZXJzIiwiYXBpQ2FsbFN5bmNVc2VycyIsImFwaSIsInVybCIsIkNvbmZpZyIsInBieFVybCIsIm1ldGhvZCIsImJlZm9yZVNlbmQiLCJzZXR0aW5ncyIsImFkZENsYXNzIiwiZGF0YSIsImZvcm0iLCJzdWNjZXNzVGVzdCIsInJlc3BvbnNlIiwic3VjY2VzcyIsIm9uU3VjY2VzcyIsInJlbW92ZUNsYXNzIiwicmVtb3ZlIiwiaHRtbCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJlYWNoIiwidXNlcktleSIsInVzZXJWYWx1ZSIsImluZGV4IiwidmFsdWUiLCJ1c2VyIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwiYWZ0ZXIiLCJvbkZhaWx1cmUiLCJtZXNzYWdlIiwiY2JCZWZvcmVTZW5kRm9ybSIsInJlc3VsdCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJnbG9iYWxSb290VXJsIiwiZG9jdW1lbnQiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBR0EsSUFBTUEsb0JBQW9CLEdBQUc7QUFFNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsUUFBUSxFQUFFQyxDQUFDLENBQUMsd0JBQUQsQ0FOaUI7O0FBUTVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NDLEVBQUFBLGlCQUFpQixFQUFFRCxDQUFDLENBQUMsb0JBQUQsQ0FaUTs7QUFjNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0UsRUFBQUEsb0JBQW9CLEVBQUVGLENBQUMsQ0FBQyx1QkFBRCxDQWxCSzs7QUFvQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NHLEVBQUFBLHlCQUF5QixFQUFFSCxDQUFDLENBQUMsdUJBQUQsQ0F4QkE7O0FBMEI1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDSSxFQUFBQSxnQkFBZ0IsRUFBRUosQ0FBQyxDQUFDLGtCQUFELENBOUJTOztBQWdDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0ssRUFBQUEsaUJBQWlCLEVBQUVMLENBQUMsQ0FBQyxrQkFBRCxDQXBDUTs7QUFzQzVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NNLEVBQUFBLGFBQWEsRUFBRTtBQUNkQyxJQUFBQSxVQUFVLEVBQUU7QUFDWEMsTUFBQUEsVUFBVSxFQUFFLFlBREQ7QUFFWEMsTUFBQUEs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LFdBQU9zQixNQUFQO0FBQ0EsR0FuUTJCOztBQXFRNUI7QUFDRDtBQUNBO0FBQ0NDLEVBQUFBLGVBeFE0Qiw2QkF3UVYsQ0FDakI7QUFDQSxHQTFRMkI7O0FBNFE1QjtBQUNEO0FBQ0E7QUFDQ3RDLEVBQUFBLGNBL1E0Qiw0QkErUVg7QUFDaEJ1QyxJQUFBQSxJQUFJLENBQUNsRSxRQUFMLEdBQWdCRCxvQkFBb0IsQ0FBQ0MsUUFBckM7QUFDQWtFLElBQUFBLElBQUksQ0FBQ2hDLEdBQUwsYUFBY2lDLGFBQWQ7QUFDQUQsSUFBQUEsSUFBSSxDQUFDM0QsYUFBTCxHQUFxQlIsb0JBQW9CLENBQUNRLGFBQTFDO0FBQ0EyRCxJQUFBQSxJQUFJLENBQUNILGdCQUFMLEdBQXdCaEUsb0JBQW9CLENBQUNnRSxnQkFBN0M7QUFDQUcsSUFBQUEsSUFBSSxDQUFDRCxlQUFMLEdBQXVCbEUsb0JBQW9CLENBQUNrRSxlQUE1QztBQUNBQyxJQUFBQSxJQUFJLENBQUN6QyxVQUFMO0FBQ0E7QUF0UjJCLENBQTdCO0FBeVJBeEIsQ0FBQyxDQUFDbUUsUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QnRFLEVBQUFBLG9CQUFvQixDQUFDMEIsVUFBckI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIE1pa29QQlggLSBmcmVlIHBob25lIHN5c3RlbSBmb3Igc21hbGwgYnVzaW5lc3NcbiAqIENvcHlyaWdodCDCqSAyMDE3LTIwMjMgQWxleGV5IFBvcnRub3YgYW5kIE5pa29sYXkgQmVrZXRvdlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS5cbiAqIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuLyogZ2xvYmFsIGdsb2JhbFJvb3RVcmwsIGdsb2JhbFRyYW5zbGF0ZSwgRm9ybSwgUGJ4QXBpICovXG5cblxuY29uc3QgTW9kdWxlTGRhcFN5bmNNb2RpZnkgPSB7XG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBmb3JtLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGZvcm1PYmo6ICQoJyNtb2R1bGUtbGRhcC1zeW5jLWZvcm0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIHNlcnZlciB0eXBlIGRyb3Bkb3duLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBUeXBlRHJvcGRvd246ICQoJy5zZWxlY3QtbGRhcC1maWVsZCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZ2V0dGluZyBMREFQIHVzZXJzIGxpc3QgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGNoZWNrR2V0VXNlcnNCdXR0b246ICQoJy5jaGVjay1sZGFwLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBjaGVjayBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JGxkYXBDaGVja0dldFVzZXJzU2VnbWVudDogJCgnI2xkYXAtY2hlY2stZ2V0LXVzZXJzJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzeW5jIExEQVAgdXNlcnMgYnV0dG9uLlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc0J1dHRvbjogJCgnLmxkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgbGRhcCBzeW5jIHVzZXJzIHNlZ21lbnQuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkc3luY1VzZXJzU2VnbWVudDogJCgnI2xkYXAtc3luYy11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgZm9ybSBmaWVsZHMuXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0c2VydmVyTmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlck5hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZXJ2ZXJQb3J0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyUG9ydCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlTG9naW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZUxvZ2luJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRiYXNlRE46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYXNlRE4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJJZEF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJJZEF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJJZEF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRpbml0aWFsaXplKCkge1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwVHlwZURyb3Bkb3duLmRyb3Bkb3duKCk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5pbml0aWFsaXplRm9ybSgpO1xuXG5cdFx0Ly8gSGFuZGxlIGdldCB1c2VycyBsaXN0IGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxHZXRMZGFwVXNlcnMoKTtcblx0XHR9KTtcblxuXHRcdC8vIEhhbmRsZSBzeW5jIHVzZXJzIGJ1dHRvbiBjbGlja1xuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbFN5bmNVc2VycygpO1xuXHRcdH0pO1xuXG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZ2V0IExEQVAgdXNlcnMgbGlzdCBidXR0b24gY2xpY2suXG5cdCAqL1xuXHRhcGlDYWxsR2V0TGRhcFVzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL21vZHVsZS1sZGFwLXN5bmMvZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3QocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2Uuc3VjY2Vzcztcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdFx0XHRjb25zdCB1bmlxdWVBdHRyaWJ1dGVzID0ge307XG5cblx0XHRcdFx0Ly8gRXh0cmFjdCB1bmlxdWUgYXR0cmlidXRlcyBmcm9tIHRoZSByZXNwb25zZSBkYXRhXG5cdFx0XHRcdCQuZWFjaChyZXNwb25zZS5kYXRhLCAodXNlcktleSwgdXNlclZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHQkLmVhY2godXNlclZhbHVlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0XHRodG1sICs9YDx0aD4ke2luZGV4fTwvdGg+YDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHRcdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgd2l0aCB1c2VyIGRhdGFcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0XHRcdGh0bWwgKz0gJzx0ciBjbGFzcz1cIml0ZW1cIj4nO1xuXHRcdFx0XHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoYXR0ckluZGV4LCBhdHRyVmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGNlbGxWYWx1ZSA9IHVzZXJbYXR0ckluZGV4XSB8fCAnJztcblx0XHRcdFx0XHRcdGh0bWwgKz0gYDx0ZD4ke2NlbGxWYWx1ZX08L3RkPmA7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnZ2V0LWF2YWlsYWJsZS1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBDaGVja0dldFVzZXJzU2VnbWVudC5hZnRlcihgPGRpdiBjbGFzcz1cInVpIGljb24gbWVzc2FnZSBhamF4IG5lZ2F0aXZlXCI+PGkgY2xhc3M9XCJpY29uIGV4Y2xhbWF0aW9uIGNpcmNsZVwiPjwvaT4ke3Jlc3BvbnNlLm1lc3NhZ2V9PC9kaXY+YCk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0YXBpQ2FsbFN5bmNVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9tb2R1bGUtbGRhcC1zeW5jL3N5bmMtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5hZGRDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3QocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2Uuc3VjY2Vzcztcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdzeW5jLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJsZGFwLXJlc3VsdFwiPic7XG5cdFx0XHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdFx0XHQvLyBFeHRyYWN0IHVuaXF1ZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHJlc3BvbnNlIGRhdGFcblx0XHRcdFx0JC5lYWNoKHJlc3BvbnNlLmRhdGEsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdFx0XHQkLmVhY2godXNlclZhbHVlLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHR1bmlxdWVBdHRyaWJ1dGVzW2luZGV4XSA9IHRydWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdFx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGluZGV4LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRcdGh0bWwgKz1gPHRoPiR7aW5kZXh9PC90aD5gO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPidcblxuXHRcdFx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdFx0XHQkLmVhY2gocmVzcG9uc2UuZGF0YSwgKGluZGV4LCB1c2VyKSA9PiB7XG5cdFx0XHRcdFx0aHRtbCArPSAnPHRyIGNsYXNzPVwiaXRlbVwiPic7XG5cdFx0XHRcdFx0JC5lYWNoKHVuaXF1ZUF0dHJpYnV0ZXMsIChhdHRySW5kZXgsIGF0dHJWYWx1ZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgY2VsbFZhbHVlID0gdXNlclthdHRySW5kZXhdIHx8ICcnO1xuXHRcdFx0XHRcdFx0aHRtbCArPSBgPHRkPiR7Y2VsbFZhbHVlfTwvdGQ+YDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRodG1sICs9ICc8L3RyPic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRodG1sICs9ICc8L3RhYmxlPic7XG5cblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc1NlZ21lbnQuYWZ0ZXIoaHRtbCk7XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBmYWlsdXJlIHJlc3BvbnNlIG9mIHRoZSAnc3luYy1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzU2VnbWVudC5hZnRlcihgPGRpdiBjbGFzcz1cInVpIGljb24gbWVzc2FnZSBhamF4IG5lZ2F0aXZlXCI+PGkgY2xhc3M9XCJpY29uIGV4Y2xhbWF0aW9uIGNpcmNsZVwiPjwvaT4ke3Jlc3BvbnNlLm1lc3NhZ2V9PC9kaXY+YCk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBzZW5kaW5nIHRoZSBmb3JtLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2V0dGluZ3MgLSBUaGUgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSBtb2RpZmllZCBzZXR0aW5ncyBvYmplY3QuXG5cdCAqL1xuXHRjYkJlZm9yZVNlbmRGb3JtKHNldHRpbmdzKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gc2V0dGluZ3M7XG5cdFx0cmVzdWx0LmRhdGEgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgZnVuY3Rpb24gYWZ0ZXIgc2VuZGluZyB0aGUgZm9ybS5cblx0ICovXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblx0XHQvLyBDYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgZm9ybS5cblx0ICovXG5cdGluaXRpYWxpemVGb3JtKCkge1xuXHRcdEZvcm0uJGZvcm1PYmogPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9bW9kdWxlLWxkYXAtc3luYy9tb2R1bGUtbGRhcC1zeW5jL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnZhbGlkYXRlUnVsZXM7XG5cdFx0Rm9ybS5jYkJlZm9yZVNlbmRGb3JtID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuY2JCZWZvcmVTZW5kRm9ybTtcblx0XHRGb3JtLmNiQWZ0ZXJTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuaW5pdGlhbGl6ZSgpO1xufSk7XG5cbiJdfQ==