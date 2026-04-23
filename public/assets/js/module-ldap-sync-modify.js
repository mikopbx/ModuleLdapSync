"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
   * jQuery object for the whole TLS settings block (shown only for
   * encrypted modes — starttls / ldaps).
   * @type {jQuery}
   */
  $tlsSettingsBlock: $('.tls-settings'),

  /**
   * jQuery object for the "verify certificate" toggle.
   * @type {jQuery}
   */
  $verifyCertCheckbox: $('input[name="verifyCert"]'),

  /**
   * jQuery object for the "insecure TLS" warning banner.
   * @type {jQuery}
   */
  $insecureTlsWarning: $('.insecure-tls-warning'),

  /**
   * jQuery object for the Certificate tab header (shown only when encrypted).
   * @type {jQuery}
   */
  $certificateTab: $('.item.tab-certificate'),

  /**
   * jQuery object for the warning triangle icon inside the Certificate tab header.
   * @type {jQuery}
   */
  $caMissingWarning: $('.ca-missing-warning'),

  /**
   * jQuery object for the CA certificate textarea.
   * @type {jQuery}
   */
  $caCertTextarea: $('textarea[name="caCertificate"]'),

  /**
   * jQuery object for the "test bind" button on tabConnection.
   * @type {jQuery}
   */
  $testBindButton: $('.test-ldap-bind'),

  /**
   * jQuery object for the inline message that carries the result of the
   * bind test.
   * @type {jQuery}
   */
  $testBindResult: $('.test-bind-result'),

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
    ModuleLdapSyncModify.$ldapTypeDropdown.dropdown({
      onChange: ModuleLdapSyncModify.onChangeLdapType
    }); // Prime placeholders for the currently saved type on first render.

    var initialType = ModuleLdapSyncModify.$formObj.form('get value', 'ldapType') || ModuleLdapSyncModify.$ldapTypeDropdown.dropdown('get value') || 'ActiveDirectory';
    ModuleLdapSyncModify.onChangeLdapType(initialType);
    ModuleLdapSyncModify.initializeTooltips(); // Native Fomantic tooltip on the icon-only "Test bind" button.

    ModuleLdapSyncModify.$testBindButton.popup({
      position: 'top right',
      delay: {
        show: 200,
        hide: 80
      }
    });
    ModuleLdapSyncModify.initializeForm(); // Handle get users list button click

    ModuleLdapSyncModify.$checkGetUsersButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallGetLdapUsers();
    }); // Handle sync users button click

    ModuleLdapSyncModify.$syncUsersButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallSyncUsers();
    }); // Handle test-bind button click on the connection tab.

    ModuleLdapSyncModify.$testBindButton.on('click', function (e) {
      e.preventDefault();
      ModuleLdapSyncModify.apiCallTestBind();
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
    ModuleLdapSyncModify.updateConflictsView(); // Handle change TLS protocol — three-way selector.

    var currentTlsMode = ModuleLdapSyncModify.$formObj.form('get value', 'tlsMode') || 'none';
    ModuleLdapSyncModify.$useTlsDropdown.dropdown({
      values: [{
        name: 'ldap://',
        value: 'none',
        selected: currentTlsMode === 'none'
      }, {
        name: 'ldap:// + STARTTLS',
        value: 'starttls',
        selected: currentTlsMode === 'starttls'
      }, {
        name: 'ldaps://',
        value: 'ldaps',
        selected: currentTlsMode === 'ldaps'
      }],
      onChange: function onChange(value) {
        ModuleLdapSyncModify.$formObj.form('set value', 'tlsMode', value);
        ModuleLdapSyncModify.refreshTlsSectionVisibility();
      }
    }); // Certificate validation toggle — refresh UX state (insecure banner,
    // Certificate-tab warning triangle) on flip.

    ModuleLdapSyncModify.$verifyCertCheckbox.on('change', function () {
      ModuleLdapSyncModify.refreshTlsSectionVisibility();
    }); // Typing into the CA textarea clears the "missing CA" warning.

    ModuleLdapSyncModify.$caCertTextarea.on('input', function () {
      ModuleLdapSyncModify.refreshTlsSectionVisibility();
    });
    ModuleLdapSyncModify.refreshTlsSectionVisibility();
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
   * Recomputes visibility of TLS-related UI elements based on the current
   * tlsMode / verifyCert / caCertificate state.
   *
   *  - verifyCert toggle and insecure-TLS warning live inside .tls-settings
   *    inside tabConnection; shown only for encrypted modes (starttls|ldaps).
   *  - Certificate tab header itself appears only for encrypted modes.
   *  - Warning triangle on the Certificate tab lights up when verification
   *    is on but the CA textarea is empty — i.e. the operator enabled
   *    strict validation but hasn't provided the trust anchor yet.
   *  - Insecure-TLS warning banner lights up only for ldaps:// without
   *    verification: traffic is encrypted but server identity is unverified.
   */
  refreshTlsSectionVisibility: function refreshTlsSectionVisibility() {
    var tlsMode = ModuleLdapSyncModify.$formObj.form('get value', 'tlsMode') || 'none';
    var verify = ModuleLdapSyncModify.$verifyCertCheckbox.is(':checked');
    var encrypted = tlsMode === 'starttls' || tlsMode === 'ldaps';
    var caEmpty = (ModuleLdapSyncModify.$caCertTextarea.val() || '').trim() === '';

    if (encrypted) {
      ModuleLdapSyncModify.$tlsSettingsBlock.show();
      ModuleLdapSyncModify.$certificateTab.show();
    } else {
      ModuleLdapSyncModify.$tlsSettingsBlock.hide();
      ModuleLdapSyncModify.$certificateTab.hide();
    }

    if (encrypted && verify && caEmpty) {
      ModuleLdapSyncModify.$caMissingWarning.show();
    } else {
      ModuleLdapSyncModify.$caMissingWarning.hide();
    }

    if (tlsMode === 'ldaps' && !verify) {
      ModuleLdapSyncModify.$insecureTlsWarning.show();
    } else {
      ModuleLdapSyncModify.$insecureTlsWarning.hide();
    }
  },

  /**
   * Fires the lightweight bind check against the current form values.
   * Shows a green success message or a red error message inline under
   * the button, without touching any other form state.
   */
  apiCallTestBind: function apiCallTestBind() {
    $.api({
      url: "".concat(Config.pbxUrl, "/pbxcore/api/modules/ModuleLdapSync/test-ldap-bind"),
      on: 'now',
      method: 'POST',
      beforeSend: function beforeSend(settings) {
        ModuleLdapSyncModify.$testBindButton.addClass('loading disabled');
        ModuleLdapSyncModify.$testBindResult.removeClass('positive negative').hide();
        settings.data = ModuleLdapSyncModify.$formObj.form('get values');
        return settings;
      },
      successTest: PbxApi.successTest,
      onSuccess: function onSuccess(response) {
        ModuleLdapSyncModify.$testBindButton.removeClass('loading disabled');
        ModuleLdapSyncModify.$testBindResult.removeClass('negative').addClass('positive').text(globalTranslate.module_ldap_TestBindSuccess).show();
      },
      onFailure: function onFailure(response) {
        ModuleLdapSyncModify.$testBindButton.removeClass('loading disabled');
        var text = globalTranslate.module_ldap_TestBindFailure;
        var detail = ModuleLdapSyncModify.flattenMessages(response ? response.messages : null);

        if (detail) {
          text = "".concat(text, ": ").concat(detail);
        }

        ModuleLdapSyncModify.$testBindResult.removeClass('positive').addClass('negative').text(text).show();
      }
    });
  },

  /**
   * Flattens a PBXApiResult messages payload into a single string.
   * Accepts either a flat array of strings or a dict keyed by severity
   * (error/info/warning) whose values are arrays of strings.
   *
   * @param {*} messages
   * @returns {string}
   */
  flattenMessages: function flattenMessages(messages) {
    if (!messages) {
      return '';
    }

    if (Array.isArray(messages)) {
      return messages.join('; ');
    }

    if (_typeof(messages) === 'object') {
      var lines = [];
      Object.keys(messages).forEach(function (key) {
        var bucket = messages[key];

        if (Array.isArray(bucket)) {
          bucket.forEach(function (line) {
            return lines.push(String(line));
          });
        } else if (bucket) {
          lines.push(String(bucket));
        }
      });
      return lines.join('; ');
    }

    return String(messages);
  },

  /**
   * Per-server-type defaults. Values are used as placeholders (always) and
   * pre-fills (only for fields the user hasn't filled yet). Filter strings
   * are the only field for which we also overwrite non-empty values — the
   * old filter from a different server type would be objectively wrong on
   * the new one, and this field is short enough that losing it is cheap.
   */
  ldapTypePresets: {
    ActiveDirectory: {
      administrativeLogin: 'CN=Admin,CN=Users,DC=example,DC=com',
      baseDN: 'DC=example,DC=com',
      organizationalUnit: 'OU=Users,DC=example,DC=com',
      userFilter: '(&(objectClass=user)(objectCategory=PERSON))',
      userNameAttribute: 'displayName',
      userExtensionAttribute: 'telephoneNumber',
      userMobileAttribute: 'mobile',
      userEmailAttribute: 'mail',
      userAvatarAttribute: 'thumbnailPhoto',
      userAccountControl: 'userAccountControl',
      userPasswordAttribute: ''
    },
    OpenLDAP: {
      administrativeLogin: 'cn=admin,dc=example,dc=com',
      baseDN: 'dc=example,dc=com',
      organizationalUnit: 'ou=people,dc=example,dc=com',
      userFilter: '(objectClass=inetOrgPerson)',
      userNameAttribute: 'cn',
      userExtensionAttribute: 'telephoneNumber',
      userMobileAttribute: 'mobile',
      userEmailAttribute: 'mail',
      userAvatarAttribute: 'jpegPhoto',
      userAccountControl: '',
      userPasswordAttribute: 'userPassword'
    }
  },

  /**
   * Handles change of the LDAP type dropdown.
   *
   * Rules:
   *  - Always refresh placeholders so the operator sees format hints for
   *    the new type even when fields are already populated.
   *  - Pre-fill empty fields from the preset; never overwrite user input.
   *  - Filter + bind-login hint banner are always swapped to the new type
   *    so stale examples don't linger.
   */
  onChangeLdapType: function onChangeLdapType(value) {
    var preset = ModuleLdapSyncModify.ldapTypePresets[value];

    if (!preset) {
      return;
    }

    Object.keys(preset).forEach(function (field) {
      var input = ModuleLdapSyncModify.$formObj.find("[name=\"".concat(field, "\"]"));

      if (!input.length) {
        return;
      } // Always refresh the placeholder — it's a hint, not data.


      input.attr('placeholder', preset[field] || ''); // Only fill empty fields — never destroy the operator's input.

      var current = (input.val() || '').trim();

      if (current === '' && preset[field]) {
        ModuleLdapSyncModify.$formObj.form('set value', field, preset[field]);
      }
    });
  },

  /**
   * Wires tooltips for every annotated field on the form. Uses the shared
   * TooltipBuilder helper from the admin cabinet so the popup structure
   * matches the rest of MikoPBX (see docs/TOOLTIP_GUIDELINES.md).
   */
  initializeTooltips: function initializeTooltips() {
    if (typeof TooltipBuilder === 'undefined') {
      return;
    }

    var tooltipConfigs = {
      serverName: TooltipBuilder.buildContent({
        header: globalTranslate.module_ldap_tt_serverName_header,
        list: [{
          term: 'ldap://',
          definition: globalTranslate.module_ldap_tt_serverName_plain
        }, {
          term: 'ldap:// + STARTTLS',
          definition: globalTranslate.module_ldap_tt_serverName_starttls
        }, {
          term: 'ldaps://',
          definition: globalTranslate.module_ldap_tt_serverName_ldaps
        }]
      }),
      administrativeLogin: TooltipBuilder.buildContent({
        header: globalTranslate.module_ldap_tt_adminLogin_header,
        description: globalTranslate.module_ldap_tt_adminLogin_desc,
        list: ['mikopbx', 'mikopbx@miko.ru', 'MIKO\\mikopbx', 'CN=mikopbx,CN=Users,DC=miko,DC=ru'],
        note: globalTranslate.module_ldap_tt_adminLogin_note
      }),
      verifyCert: TooltipBuilder.buildContent({
        header: globalTranslate.module_ldap_tt_verify_header,
        description: globalTranslate.module_ldap_tt_verify_desc,
        warning: {
          header: globalTranslate.module_ldap_tt_verify_warning_header,
          text: globalTranslate.module_ldap_tt_verify_warning
        }
      }),
      updateAttributes: TooltipBuilder.buildContent({
        header: globalTranslate.module_ldap_tt_updateAttr_header,
        description: globalTranslate.module_ldap_tt_updateAttr_desc,
        list: [globalTranslate.module_ldap_tt_updateAttr_extension, globalTranslate.module_ldap_tt_updateAttr_mobile, globalTranslate.module_ldap_tt_updateAttr_email, globalTranslate.module_ldap_tt_updateAttr_avatar, globalTranslate.module_ldap_tt_updateAttr_sip],
        note: globalTranslate.module_ldap_tt_updateAttr_note
      })
    };
    $('.field-info-icon').each(function (i, el) {
      var $icon = $(el);
      var content = tooltipConfigs[$icon.data('field')];

      if (!content) {
        return;
      }

      $icon.popup({
        html: content,
        position: 'top right',
        hoverable: true,
        delay: {
          show: 300,
          hide: 100
        },
        variation: 'flowing'
      });
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

      html += "<tr data-value=\"".concat(user['userIdInMikoPBX'], "\" class=\"").concat(rowClass, " open-user-row\">");
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
      var errorsHtml = ModuleLdapSyncModify.renderConflictErrors(record['errors']);
      html += "<tr class=\"item\" data-value=\"".concat(record['id'], "\">");
      html += '<td>' + record['lastTime'] + '</td>';
      html += '<td>' + ModuleLdapSyncModify.getTranslation(record['side']) + '</td>';
      html += '<td class="conflict-errors">' + errorsHtml + '</td>';
      html += '<td><pre>' + prettyJSON + '</pre></td>';
      html += "<td><div class=\"ui icon basic button popuped delete-conflict\" data-content=\"".concat(ModuleLdapSyncModify.getTranslation('deleteCurrentConflict'), "\"><i class=\"icon trash red\"></i></div></td>");
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  },

  /**
   * Renders the `errors` field of a conflict record as a stack of short
   * lines instead of one huge blob. Accepts the decoded shape returned by
   * getServerConflicts: an array of strings, a single string, or null.
   *
   * @param {*} errors Decoded errors payload from the conflict row.
   * @returns {string} Sanitised HTML fragment.
   */
  renderConflictErrors: function renderConflictErrors(errors) {
    var escape = function escape(s) {
      return $('<div>').text(String(s)).html();
    };
    var lines = [];
    if (Array.isArray(errors)) {
      lines = errors.map(String);
    } else if (errors !== null && errors !== undefined && errors !== '') {
      lines = [String(errors)];
    }
    if (lines.length === 0) {
      return '';
    }
    var body = lines.map(function (line) {
      return '<div>' + escape(line) + '</div>';
    }).join('');
    return '<div class="conflict-errors-body">' + body + '</div>';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9tb2R1bGUtbGRhcC1zeW5jLW1vZGlmeS5qcyJdLCJuYW1lcyI6WyJNb2R1bGVMZGFwU3luY01vZGlmeSIsIiRmb3JtT2JqIiwiJCIsIiRsZGFwVHlwZURyb3Bkb3duIiwiJGNoZWNrR2V0VXNlcnNCdXR0b24iLCIkbGRhcENoZWNrR2V0VXNlcnNTZWdtZW50IiwiJHN5bmNVc2Vyc0J1dHRvbiIsIiRzeW5jVXNlcnNTZWdtZW50IiwidXNlckRpc2FibGVkQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlIiwiaGlkZGVuQXR0cmlidXRlcyIsIkpTT04iLCJwYXJzZSIsIm1vZHVsZV9sZGFwX2hpZGRlbkF0dHJpYnV0ZXMiLCIkbWFpblRhYk1lbnUiLCIkbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlciIsIiRkZWxldGVBbGxDb25mbGljdHNCdXR0b24iLCIkc3RhdHVzVG9nZ2xlIiwiJHVzZVRsc0Ryb3Bkb3duIiwiJHRsc1NldHRpbmdzQmxvY2siLCIkdmVyaWZ5Q2VydENoZWNrYm94IiwiJGluc2VjdXJlVGxzV2FybmluZyIsIiRjZXJ0aWZpY2F0ZVRhYiIsIiRjYU1pc3NpbmdXYXJuaW5nIiwiJGNhQ2VydFRleHRhcmVhIiwiJHRlc3RCaW5kQnV0dG9uIiwiJHRlc3RCaW5kUmVzdWx0IiwiJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyIiwidmFsaWRhdGVSdWxlcyIsInNlcnZlck5hbWUiLCJpZGVudGlmaWVyIiwicnVsZXMiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSIsInNlcnZlclBvcnQiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5IiwiYWRtaW5pc3RyYXRpdmVMb2dpbiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHkiLCJhZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSGlkZGVuIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSIsImJhc2VETiIsIm1vZHVsZV9sZGFwX1ZhbGlkYXRlQmFzZUROSXNFbXB0eSIsInVzZXJOYW1lQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHkiLCJ1c2VyTW9iaWxlQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSIsInVzZXJFeHRlbnNpb25BdHRyaWJ1dGUiLCJtb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5IiwidXNlckVtYWlsQXR0cmlidXRlIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyRW1haWxBdHRyaWJ1dGVJc0VtcHR5IiwidXNlckFjY291bnRDb250cm9sIiwibW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyQWNjb3VudENvbnRyb2xJc0VtcHR5IiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwib25DaGFuZ2UiLCJvbkNoYW5nZUxkYXBUeXBlIiwiaW5pdGlhbFR5cGUiLCJmb3JtIiwiaW5pdGlhbGl6ZVRvb2x0aXBzIiwicG9wdXAiLCJwb3NpdGlvbiIsImRlbGF5Iiwic2hvdyIsImhpZGUiLCJpbml0aWFsaXplRm9ybSIsIm9uIiwiZSIsInByZXZlbnREZWZhdWx0IiwiYXBpQ2FsbEdldExkYXBVc2VycyIsImFwaUNhbGxTeW5jVXNlcnMiLCJhcGlDYWxsVGVzdEJpbmQiLCJ0YWIiLCJyZWNvcmRJZCIsInRhcmdldCIsImNsb3Nlc3QiLCJkYXRhIiwiYXBpQ2FsbERlbGV0ZUNvbmZsaWN0IiwiYXBpQ2FsbEdldENvbmZsaWN0cyIsImFwaUNhbGxEZWxldGVDb25mbGljdHMiLCJ1cGRhdGVDb25mbGljdHNWaWV3IiwiY3VycmVudFRsc01vZGUiLCJ2YWx1ZXMiLCJuYW1lIiwidmFsdWUiLCJzZWxlY3RlZCIsInJlZnJlc2hUbHNTZWN0aW9uVmlzaWJpbGl0eSIsInVwZGF0ZURpc2FibGVkVXNlcnNWaWV3IiwiYXBpQ2FsbEdldERpc2FibGVkVXNlcnMiLCJzZWFyY2hWYWx1ZSIsIndpbmRvdyIsIm9wZW4iLCJnbG9iYWxSb290VXJsIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwidGxzTW9kZSIsInZlcmlmeSIsImlzIiwiZW5jcnlwdGVkIiwiY2FFbXB0eSIsInZhbCIsInRyaW0iLCJhcGkiLCJ1cmwiLCJDb25maWciLCJwYnhVcmwiLCJtZXRob2QiLCJiZWZvcmVTZW5kIiwic2V0dGluZ3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwic3VjY2Vzc1Rlc3QiLCJQYnhBcGkiLCJvblN1Y2Nlc3MiLCJyZXNwb25zZSIsInRleHQiLCJtb2R1bGVfbGRhcF9UZXN0QmluZFN1Y2Nlc3MiLCJvbkZhaWx1cmUiLCJtb2R1bGVfbGRhcF9UZXN0QmluZEZhaWx1cmUiLCJkZXRhaWwiLCJmbGF0dGVuTWVzc2FnZXMiLCJtZXNzYWdlcyIsIkFycmF5IiwiaXNBcnJheSIsImpvaW4iLCJsaW5lcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiYnVja2V0IiwibGluZSIsInB1c2giLCJTdHJpbmciLCJsZGFwVHlwZVByZXNldHMiLCJBY3RpdmVEaXJlY3RvcnkiLCJvcmdhbml6YXRpb25hbFVuaXQiLCJ1c2VyRmlsdGVyIiwidXNlckF2YXRhckF0dHJpYnV0ZSIsInVzZXJQYXNzd29yZEF0dHJpYnV0ZSIsIk9wZW5MREFQIiwicHJlc2V0IiwiZmllbGQiLCJpbnB1dCIsImZpbmQiLCJsZW5ndGgiLCJhdHRyIiwiY3VycmVudCIsIlRvb2x0aXBCdWlsZGVyIiwidG9vbHRpcENvbmZpZ3MiLCJidWlsZENvbnRlbnQiLCJoZWFkZXIiLCJtb2R1bGVfbGRhcF90dF9zZXJ2ZXJOYW1lX2hlYWRlciIsImxpc3QiLCJ0ZXJtIiwiZGVmaW5pdGlvbiIsIm1vZHVsZV9sZGFwX3R0X3NlcnZlck5hbWVfcGxhaW4iLCJtb2R1bGVfbGRhcF90dF9zZXJ2ZXJOYW1lX3N0YXJ0dGxzIiwibW9kdWxlX2xkYXBfdHRfc2VydmVyTmFtZV9sZGFwcyIsIm1vZHVsZV9sZGFwX3R0X2FkbWluTG9naW5faGVhZGVyIiwiZGVzY3JpcHRpb24iLCJtb2R1bGVfbGRhcF90dF9hZG1pbkxvZ2luX2Rlc2MiLCJub3RlIiwibW9kdWxlX2xkYXBfdHRfYWRtaW5Mb2dpbl9ub3RlIiwidmVyaWZ5Q2VydCIsIm1vZHVsZV9sZGFwX3R0X3ZlcmlmeV9oZWFkZXIiLCJtb2R1bGVfbGRhcF90dF92ZXJpZnlfZGVzYyIsIndhcm5pbmciLCJtb2R1bGVfbGRhcF90dF92ZXJpZnlfd2FybmluZ19oZWFkZXIiLCJtb2R1bGVfbGRhcF90dF92ZXJpZnlfd2FybmluZyIsInVwZGF0ZUF0dHJpYnV0ZXMiLCJtb2R1bGVfbGRhcF90dF91cGRhdGVBdHRyX2hlYWRlciIsIm1vZHVsZV9sZGFwX3R0X3VwZGF0ZUF0dHJfZGVzYyIsIm1vZHVsZV9sZGFwX3R0X3VwZGF0ZUF0dHJfZXh0ZW5zaW9uIiwibW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9tb2JpbGUiLCJtb2R1bGVfbGRhcF90dF91cGRhdGVBdHRyX2VtYWlsIiwibW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9hdmF0YXIiLCJtb2R1bGVfbGRhcF90dF91cGRhdGVBdHRyX3NpcCIsIm1vZHVsZV9sZGFwX3R0X3VwZGF0ZUF0dHJfbm90ZSIsImVhY2giLCJpIiwiZWwiLCIkaWNvbiIsImNvbnRlbnQiLCJodG1sIiwiaG92ZXJhYmxlIiwidmFyaWF0aW9uIiwic2VydmVySUQiLCJpZCIsInJlbW92ZSIsImJ1aWxkVGFibGVGcm9tRGlzYWJsZWRVc2Vyc0xpc3QiLCJhZnRlciIsIlVzZXJNZXNzYWdlIiwic2hvd011bHRpU3RyaW5nIiwicmVjb3JkcyIsImdldFRyYW5zbGF0aW9uIiwiaW5kZXgiLCJyZWNvcmQiLCJidWlsZFRhYmxlRnJvbUNvbmZsaWN0c0xpc3QiLCJidWlsZFRhYmxlRnJvbVVzZXJzTGlzdCIsInVzZXJzTGlzdCIsInVuaXF1ZUF0dHJpYnV0ZXMiLCJ1c2VyS2V5IiwidXNlclZhbHVlIiwiaW5jbHVkZXMiLCJjb2x1bW5OYW1lIiwiZmlsdGVyIiwidXNlciIsInJvd0NsYXNzIiwiYXR0ckluZGV4IiwiYXR0clZhbHVlIiwiY2VsbFZhbHVlIiwiY29uZmxpY3RzIiwicHJldHR5SlNPTiIsInN0cmluZ2lmeSIsIm5hbWVUZW1wbGF0ZSIsInVuZGVmaW5lZCIsImNiQmVmb3JlU2VuZEZvcm0iLCJyZXN1bHQiLCJvYmoiLCJjaGVja2JveCIsImNiQWZ0ZXJTZW5kRm9ybSIsIkZvcm0iLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxvQkFBb0IsR0FBRztBQUU1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDQyxFQUFBQSxRQUFRLEVBQUVDLENBQUMsQ0FBQyx3QkFBRCxDQU5pQjs7QUFRNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0MsRUFBQUEsaUJBQWlCLEVBQUVELENBQUMsQ0FBQyxvQkFBRCxDQVpROztBQWM1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDRSxFQUFBQSxvQkFBb0IsRUFBRUYsQ0FBQyxDQUFDLHVCQUFELENBbEJLOztBQW9CNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ0csRUFBQUEseUJBQXlCLEVBQUVILENBQUMsQ0FBQyx1QkFBRCxDQXhCQTs7QUEwQjVCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0NJLEVBQUFBLGdCQUFnQixFQUFFSixDQUFDLENBQUMsa0JBQUQsQ0E5QlM7O0FBZ0M1QjtBQUNEO0FBQ0E7QUFDQTtBQUNDSyxFQUFBQSxpQkFBaUIsRUFBRUwsQ0FBQyxDQUFDLGtCQUFELENBcENROztBQXNDNUI7QUFDRDtBQUNBO0FBQ0E7QUFDQ00sRUFBQUEscUJBQXFC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LGVBLy9CNEIsNkJBKy9CVixDQUNqQjtBQUNBLEdBamdDMkI7O0FBbWdDNUI7QUFDRDtBQUNBO0FBQ0MzSixFQUFBQSxjQXRnQzRCLDRCQXNnQ1g7QUFDaEI0SixJQUFBQSxJQUFJLENBQUM3TixRQUFMLEdBQWdCRCxvQkFBb0IsQ0FBQ0MsUUFBckM7QUFDQTZOLElBQUFBLElBQUksQ0FBQ3ZILEdBQUwsYUFBY1YsYUFBZDtBQUNBaUksSUFBQUEsSUFBSSxDQUFDbE0sYUFBTCxHQUFxQjVCLG9CQUFvQixDQUFDNEIsYUFBMUM7QUFDQWtNLElBQUFBLElBQUksQ0FBQ0wsZ0JBQUwsR0FBd0J6TixvQkFBb0IsQ0FBQ3lOLGdCQUE3QztBQUNBSyxJQUFBQSxJQUFJLENBQUNELGVBQUwsR0FBdUI3TixvQkFBb0IsQ0FBQzZOLGVBQTVDO0FBQ0FDLElBQUFBLElBQUksQ0FBQ3hLLFVBQUw7QUFDQTtBQTdnQzJCLENBQTdCO0FBZ2hDQXBELENBQUMsQ0FBQzZOLFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJoTyxFQUFBQSxvQkFBb0IsQ0FBQ3NELFVBQXJCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBNaWtvUEJYIC0gZnJlZSBwaG9uZSBzeXN0ZW0gZm9yIHNtYWxsIGJ1c2luZXNzXG4gKiBDb3B5cmlnaHQgwqkgMjAxNy0yMDIzIEFsZXhleSBQb3J0bm92IGFuZCBOaWtvbGF5IEJla2V0b3ZcbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uXG4gKiBJZiBub3QsIHNlZSA8aHR0cHM6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIFBieEFwaSwgbW9kdWxlX2xkYXBfdXNlckRpc2FibGVkQXR0cmlidXRlLCBtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzLCBDb25maWcsIFVzZXJNZXNzYWdlICovXG5cbi8qKlxuICogTW9kdWxlTGRhcFN5bmNNb2RpZnlcbiAqXG4gKiBUaGlzIG9iamVjdCBoYW5kbGVzIHRoZSBmdW5jdGlvbmFsaXR5IG9mIHN5bmNocm9uaXppbmcgTERBUCB1c2VycyBhbmRcbiAqIG90aGVyIHJlbGF0ZWQgZmVhdHVyZXMuXG4gKi9cbmNvbnN0IE1vZHVsZUxkYXBTeW5jTW9kaWZ5ID0ge1xuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZm9ybS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRmb3JtT2JqOiAkKCcjbW9kdWxlLWxkYXAtc3luYy1mb3JtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBzZXJ2ZXIgdHlwZSBkcm9wZG93bi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwVHlwZURyb3Bkb3duOiAkKCcuc2VsZWN0LWxkYXAtZmllbGQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGdldHRpbmcgTERBUCB1c2VycyBsaXN0IGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjaGVja0dldFVzZXJzQnV0dG9uOiAkKCcuY2hlY2stbGRhcC1nZXQtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgY2hlY2sgc2VnbWVudC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRsZGFwQ2hlY2tHZXRVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLWNoZWNrLWdldC11c2VycycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgc3luYyBMREFQIHVzZXJzIGJ1dHRvbi5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRzeW5jVXNlcnNCdXR0b246ICQoJy5sZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIGxkYXAgc3luYyB1c2VycyBzZWdtZW50LlxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN5bmNVc2Vyc1NlZ21lbnQ6ICQoJyNsZGFwLXN5bmMtdXNlcnMnKSxcblxuXHQvKipcblx0ICogQ29uc3RhbnQgd2l0aCB1c2VyIGRpc2FibGVkIGF0dHJpYnV0ZSBpZFxuXHQgKiBAdHlwZSB7c3RyaW5nfVxuXHQgKi9cblx0dXNlckRpc2FibGVkQXR0cmlidXRlOiBtb2R1bGVfbGRhcF91c2VyRGlzYWJsZWRBdHRyaWJ1dGUsXG5cblx0LyoqXG5cdCAqIENvbnN0YW50IHdpdGggaGlkZGVuIHVzZXJzIGF0dHJpYnV0ZXNcblx0ICogQHR5cGUge2FycmF5fVxuXHQgKi9cblx0aGlkZGVuQXR0cmlidXRlczogSlNPTi5wYXJzZShtb2R1bGVfbGRhcF9oaWRkZW5BdHRyaWJ1dGVzKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1hbiB0YWIgbWVudS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRtYWluVGFiTWVudTogJCgnI21vZHVsZS1sZGFwLXN5bmMtbW9kaWZ5LW1lbnUgIC5pdGVtJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtZXNzYWdlIG5vIGFueSBjb25mbGljdHNcblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRub0FueUNvbmZsaWN0c1BsYWNlaG9sZGVyOiAkKCcjbm8tYW55LWNvbmZsaWN0cy1wbGFjZWhvbGRlcicpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgYnV0dG9uIHRvIGRlbGV0ZSBhbGwgY29uZmxpY3RzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uOiAkKCcjZGVsZXRlLWFsbC1jb25mbGljdHMtYnV0dG9uJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBtb2R1bGUgc3RhdHVzIHRvZ2dsZVxuXHQgKiBAdHlwZSB7alF1ZXJ5fVxuXHQgKi9cblx0JHN0YXR1c1RvZ2dsZTogJCgnI21vZHVsZS1zdGF0dXMtdG9nZ2xlJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB1c2UgVExTIHNlbGVjdG9yXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdXNlVGxzRHJvcGRvd246ICQoJy51c2UtdGxzLWRyb3Bkb3duJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSB3aG9sZSBUTFMgc2V0dGluZ3MgYmxvY2sgKHNob3duIG9ubHkgZm9yXG5cdCAqIGVuY3J5cHRlZCBtb2RlcyDigJQgc3RhcnR0bHMgLyBsZGFwcykuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdGxzU2V0dGluZ3NCbG9jazogJCgnLnRscy1zZXR0aW5ncycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgXCJ2ZXJpZnkgY2VydGlmaWNhdGVcIiB0b2dnbGUuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdmVyaWZ5Q2VydENoZWNrYm94OiAkKCdpbnB1dFtuYW1lPVwidmVyaWZ5Q2VydFwiXScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgXCJpbnNlY3VyZSBUTFNcIiB3YXJuaW5nIGJhbm5lci5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRpbnNlY3VyZVRsc1dhcm5pbmc6ICQoJy5pbnNlY3VyZS10bHMtd2FybmluZycpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgQ2VydGlmaWNhdGUgdGFiIGhlYWRlciAoc2hvd24gb25seSB3aGVuIGVuY3J5cHRlZCkuXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkY2VydGlmaWNhdGVUYWI6ICQoJy5pdGVtLnRhYi1jZXJ0aWZpY2F0ZScpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgd2FybmluZyB0cmlhbmdsZSBpY29uIGluc2lkZSB0aGUgQ2VydGlmaWNhdGUgdGFiIGhlYWRlci5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjYU1pc3NpbmdXYXJuaW5nOiAkKCcuY2EtbWlzc2luZy13YXJuaW5nJyksXG5cblx0LyoqXG5cdCAqIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBDQSBjZXJ0aWZpY2F0ZSB0ZXh0YXJlYS5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCRjYUNlcnRUZXh0YXJlYTogJCgndGV4dGFyZWFbbmFtZT1cImNhQ2VydGlmaWNhdGVcIl0nKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIFwidGVzdCBiaW5kXCIgYnV0dG9uIG9uIHRhYkNvbm5lY3Rpb24uXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkdGVzdEJpbmRCdXR0b246ICQoJy50ZXN0LWxkYXAtYmluZCcpLFxuXG5cdC8qKlxuXHQgKiBqUXVlcnkgb2JqZWN0IGZvciB0aGUgaW5saW5lIG1lc3NhZ2UgdGhhdCBjYXJyaWVzIHRoZSByZXN1bHQgb2YgdGhlXG5cdCAqIGJpbmQgdGVzdC5cblx0ICogQHR5cGUge2pRdWVyeX1cblx0ICovXG5cdCR0ZXN0QmluZFJlc3VsdDogJCgnLnRlc3QtYmluZC1yZXN1bHQnKSxcblxuXHQvKipcblx0ICogalF1ZXJ5IG9iamVjdCBmb3IgdGhlIG1lc3NhZ2Ugbm8gYW55IGRpc2FibGVkIHVzZXJzXG5cdCAqIEB0eXBlIHtqUXVlcnl9XG5cdCAqL1xuXHQkbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXI6ICQoJyNuby1hbnktZGlzYWJsZWQtdXNlcnMtcGxhY2Vob2xkZXInKSxcblxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0aW9uIHJ1bGVzIGZvciB0aGUgZm9ybSBmaWVsZHMuXG5cdCAqIEB0eXBlIHtPYmplY3R9XG5cdCAqL1xuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0c2VydmVyTmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3NlcnZlck5hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVTZXJ2ZXJOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRzZXJ2ZXJQb3J0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnc2VydmVyUG9ydCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVNlcnZlclBvcnRJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGFkbWluaXN0cmF0aXZlTG9naW46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhZG1pbmlzdHJhdGl2ZUxvZ2luJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlQWRtaW5pc3RyYXRpdmVMb2dpbklzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0YWRtaW5pc3RyYXRpdmVQYXNzd29yZEhpZGRlbjoge1xuXHRcdFx0aWRlbnRpZmllcjogJ2FkbWluaXN0cmF0aXZlUGFzc3dvcmRIaWRkZW4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVBZG1pbmlzdHJhdGl2ZVBhc3N3b3JkSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRiYXNlRE46IHtcblx0XHRcdGlkZW50aWZpZXI6ICdiYXNlRE4nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVCYXNlRE5Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJOYW1lQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlck5hbWVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTmFtZUF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlck1vYmlsZUF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJNb2JpbGVBdHRyaWJ1dGUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfVmFsaWRhdGVVc2VyTW9iaWxlQXR0cmlidXRlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR1c2VyRXh0ZW5zaW9uQXR0cmlidXRlOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckV4dGVuc2lvbkF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFeHRlbnNpb25BdHRyaWJ1dGVJc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdHVzZXJFbWFpbEF0dHJpYnV0ZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ3VzZXJFbWFpbEF0dHJpYnV0ZScsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9WYWxpZGF0ZVVzZXJFbWFpbEF0dHJpYnV0ZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dXNlckFjY291bnRDb250cm9sOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndXNlckFjY291bnRDb250cm9sJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1ZhbGlkYXRlVXNlckFjY291bnRDb250cm9sSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oe1xuXHRcdFx0b25DaGFuZ2U6IE1vZHVsZUxkYXBTeW5jTW9kaWZ5Lm9uQ2hhbmdlTGRhcFR5cGUsXG5cdFx0fSk7XG5cblx0XHQvLyBQcmltZSBwbGFjZWhvbGRlcnMgZm9yIHRoZSBjdXJyZW50bHkgc2F2ZWQgdHlwZSBvbiBmaXJzdCByZW5kZXIuXG5cdFx0Y29uc3QgaW5pdGlhbFR5cGUgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCAnbGRhcFR5cGUnKVxuXHRcdFx0fHwgTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBUeXBlRHJvcGRvd24uZHJvcGRvd24oJ2dldCB2YWx1ZScpXG5cdFx0XHR8fCAnQWN0aXZlRGlyZWN0b3J5Jztcblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5vbkNoYW5nZUxkYXBUeXBlKGluaXRpYWxUeXBlKTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVUb29sdGlwcygpO1xuXG5cdFx0Ly8gTmF0aXZlIEZvbWFudGljIHRvb2x0aXAgb24gdGhlIGljb24tb25seSBcIlRlc3QgYmluZFwiIGJ1dHRvbi5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdGVzdEJpbmRCdXR0b24ucG9wdXAoeyBwb3NpdGlvbjogJ3RvcCByaWdodCcsIGRlbGF5OiB7IHNob3c6IDIwMCwgaGlkZTogODAgfSB9KTtcblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHQvLyBIYW5kbGUgZ2V0IHVzZXJzIGxpc3QgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldExkYXBVc2VycygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHN5bmNVc2Vyc0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsU3luY1VzZXJzKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgdGVzdC1iaW5kIGJ1dHRvbiBjbGljayBvbiB0aGUgY29ubmVjdGlvbiB0YWIuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRlc3RCaW5kQnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxUZXN0QmluZCgpO1xuXHRcdH0pO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG1haW5UYWJNZW51LnRhYigpO1xuXG5cdFx0Ly8gSGFuZGxlIGRlbGV0ZSBjb25mbGljdCBidXR0b24gY2xpY2tcblx0XHQkKCdib2R5Jykub24oJ2NsaWNrJywgJy5kZWxldGUtY29uZmxpY3QnLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRjb25zdCByZWNvcmRJZCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RyJykuZGF0YSgndmFsdWUnKTtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmFwaUNhbGxEZWxldGVDb25mbGljdChyZWNvcmRJZCk7XG5cdFx0fSk7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldENvbmZsaWN0cygpO1xuXG5cdFx0Ly8gSGFuZGxlIHN5bmMgdXNlcnMgYnV0dG9uIGNsaWNrXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsRGVsZXRlQ29uZmxpY3RzKCk7XG5cdFx0fSk7XG5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVDb25mbGljdHNWaWV3KCk7XG5cblx0XHQvLyBIYW5kbGUgY2hhbmdlIFRMUyBwcm90b2NvbCDigJQgdGhyZWUtd2F5IHNlbGVjdG9yLlxuXHRcdGNvbnN0IGN1cnJlbnRUbHNNb2RlID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ3Rsc01vZGUnKSB8fCAnbm9uZSc7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHVzZVRsc0Ryb3Bkb3duLmRyb3Bkb3duKHtcblx0XHRcdHZhbHVlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZTogJ2xkYXA6Ly8nLFxuXHRcdFx0XHRcdHZhbHVlOiAnbm9uZScsXG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IGN1cnJlbnRUbHNNb2RlID09PSAnbm9uZSdcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWU6ICdsZGFwOi8vICsgU1RBUlRUTFMnLFxuXHRcdFx0XHRcdHZhbHVlOiAnc3RhcnR0bHMnLFxuXHRcdFx0XHRcdHNlbGVjdGVkOiBjdXJyZW50VGxzTW9kZSA9PT0gJ3N0YXJ0dGxzJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bmFtZTogJ2xkYXBzOi8vJyxcblx0XHRcdFx0XHR2YWx1ZTogJ2xkYXBzJyxcblx0XHRcdFx0XHRzZWxlY3RlZDogY3VycmVudFRsc01vZGUgPT09ICdsZGFwcydcblx0XHRcdFx0fVxuXHRcdFx0XSxcblx0XHRcdG9uQ2hhbmdlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnc2V0IHZhbHVlJywgJ3Rsc01vZGUnLCB2YWx1ZSk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnJlZnJlc2hUbHNTZWN0aW9uVmlzaWJpbGl0eSgpO1xuXHRcdFx0fSxcblx0XHR9KTtcblxuXHRcdC8vIENlcnRpZmljYXRlIHZhbGlkYXRpb24gdG9nZ2xlIOKAlCByZWZyZXNoIFVYIHN0YXRlIChpbnNlY3VyZSBiYW5uZXIsXG5cdFx0Ly8gQ2VydGlmaWNhdGUtdGFiIHdhcm5pbmcgdHJpYW5nbGUpIG9uIGZsaXAuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHZlcmlmeUNlcnRDaGVja2JveC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkucmVmcmVzaFRsc1NlY3Rpb25WaXNpYmlsaXR5KCk7XG5cdFx0fSk7XG5cdFx0Ly8gVHlwaW5nIGludG8gdGhlIENBIHRleHRhcmVhIGNsZWFycyB0aGUgXCJtaXNzaW5nIENBXCIgd2FybmluZy5cblx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2FDZXJ0VGV4dGFyZWEub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkucmVmcmVzaFRsc1NlY3Rpb25WaXNpYmlsaXR5KCk7XG5cdFx0fSk7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkucmVmcmVzaFRsc1NlY3Rpb25WaXNpYmlsaXR5KCk7XG5cblxuXHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZURpc2FibGVkVXNlcnNWaWV3KCk7XG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldERpc2FibGVkVXNlcnMoKTtcblxuXHRcdC8vIEhhbmRsZSBmaW5kIHVzZXIgaW4gY29uZmxpY3Qgcm93IGNsaWNrXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICd0ci5maW5kLXVzZXItcm93JywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgcmVjb3JkSWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmRhdGEoJ3ZhbHVlJyk7XG5cdFx0XHRjb25zdCBzZWFyY2hWYWx1ZSA9ICBgaWQ6JHtyZWNvcmRJZH1gO1xuXHRcdFx0d2luZG93Lm9wZW4oIGAke2dsb2JhbFJvb3RVcmx9ZXh0ZW5zaW9ucy9pbmRleC8/c2VhcmNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFZhbHVlKX1gLCAnX2JsYW5rJyk7XG5cdFx0fSk7XG5cblx0XHQvLyBIYW5kbGUgb3BlbiB1c2VyIGluIHN5bmMgdGFibGUgcm93IGNsaWNrXG5cdFx0JCgnYm9keScpLm9uKCdjbGljaycsICd0ci5vcGVuLXVzZXItcm93JywgZnVuY3Rpb24oZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgcmVjb3JkSWQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0cicpLmRhdGEoJ3ZhbHVlJyk7XG5cdFx0XHR3aW5kb3cub3BlbiggYCR7Z2xvYmFsUm9vdFVybH1leHRlbnNpb25zL21vZGlmeS8ke2VuY29kZVVSSUNvbXBvbmVudChyZWNvcmRJZCl9YCwgJ19ibGFuaycpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWNvbXB1dGVzIHZpc2liaWxpdHkgb2YgVExTLXJlbGF0ZWQgVUkgZWxlbWVudHMgYmFzZWQgb24gdGhlIGN1cnJlbnRcblx0ICogdGxzTW9kZSAvIHZlcmlmeUNlcnQgLyBjYUNlcnRpZmljYXRlIHN0YXRlLlxuXHQgKlxuXHQgKiAgLSB2ZXJpZnlDZXJ0IHRvZ2dsZSBhbmQgaW5zZWN1cmUtVExTIHdhcm5pbmcgbGl2ZSBpbnNpZGUgLnRscy1zZXR0aW5nc1xuXHQgKiAgICBpbnNpZGUgdGFiQ29ubmVjdGlvbjsgc2hvd24gb25seSBmb3IgZW5jcnlwdGVkIG1vZGVzIChzdGFydHRsc3xsZGFwcykuXG5cdCAqICAtIENlcnRpZmljYXRlIHRhYiBoZWFkZXIgaXRzZWxmIGFwcGVhcnMgb25seSBmb3IgZW5jcnlwdGVkIG1vZGVzLlxuXHQgKiAgLSBXYXJuaW5nIHRyaWFuZ2xlIG9uIHRoZSBDZXJ0aWZpY2F0ZSB0YWIgbGlnaHRzIHVwIHdoZW4gdmVyaWZpY2F0aW9uXG5cdCAqICAgIGlzIG9uIGJ1dCB0aGUgQ0EgdGV4dGFyZWEgaXMgZW1wdHkg4oCUIGkuZS4gdGhlIG9wZXJhdG9yIGVuYWJsZWRcblx0ICogICAgc3RyaWN0IHZhbGlkYXRpb24gYnV0IGhhc24ndCBwcm92aWRlZCB0aGUgdHJ1c3QgYW5jaG9yIHlldC5cblx0ICogIC0gSW5zZWN1cmUtVExTIHdhcm5pbmcgYmFubmVyIGxpZ2h0cyB1cCBvbmx5IGZvciBsZGFwczovLyB3aXRob3V0XG5cdCAqICAgIHZlcmlmaWNhdGlvbjogdHJhZmZpYyBpcyBlbmNyeXB0ZWQgYnV0IHNlcnZlciBpZGVudGl0eSBpcyB1bnZlcmlmaWVkLlxuXHQgKi9cblx0cmVmcmVzaFRsc1NlY3Rpb25WaXNpYmlsaXR5KCl7XG5cdFx0Y29uc3QgdGxzTW9kZSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICd0bHNNb2RlJykgfHwgJ25vbmUnO1xuXHRcdGNvbnN0IHZlcmlmeSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiR2ZXJpZnlDZXJ0Q2hlY2tib3guaXMoJzpjaGVja2VkJyk7XG5cdFx0Y29uc3QgZW5jcnlwdGVkID0gdGxzTW9kZSA9PT0gJ3N0YXJ0dGxzJyB8fCB0bHNNb2RlID09PSAnbGRhcHMnO1xuXHRcdGNvbnN0IGNhRW1wdHkgPSAoTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNhQ2VydFRleHRhcmVhLnZhbCgpIHx8ICcnKS50cmltKCkgPT09ICcnO1xuXG5cdFx0aWYgKGVuY3J5cHRlZCkge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRsc1NldHRpbmdzQmxvY2suc2hvdygpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNlcnRpZmljYXRlVGFiLnNob3coKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRsc1NldHRpbmdzQmxvY2suaGlkZSgpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNlcnRpZmljYXRlVGFiLmhpZGUoKTtcblx0XHR9XG5cblx0XHRpZiAoZW5jcnlwdGVkICYmIHZlcmlmeSAmJiBjYUVtcHR5KSB7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2FNaXNzaW5nV2FybmluZy5zaG93KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjYU1pc3NpbmdXYXJuaW5nLmhpZGUoKTtcblx0XHR9XG5cblx0XHRpZiAodGxzTW9kZSA9PT0gJ2xkYXBzJyAmJiAhdmVyaWZ5KSB7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kaW5zZWN1cmVUbHNXYXJuaW5nLnNob3coKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGluc2VjdXJlVGxzV2FybmluZy5oaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBGaXJlcyB0aGUgbGlnaHR3ZWlnaHQgYmluZCBjaGVjayBhZ2FpbnN0IHRoZSBjdXJyZW50IGZvcm0gdmFsdWVzLlxuXHQgKiBTaG93cyBhIGdyZWVuIHN1Y2Nlc3MgbWVzc2FnZSBvciBhIHJlZCBlcnJvciBtZXNzYWdlIGlubGluZSB1bmRlclxuXHQgKiB0aGUgYnV0dG9uLCB3aXRob3V0IHRvdWNoaW5nIGFueSBvdGhlciBmb3JtIHN0YXRlLlxuXHQgKi9cblx0YXBpQ2FsbFRlc3RCaW5kKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL3Rlc3QtbGRhcC1iaW5kYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdGVzdEJpbmRCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRlc3RCaW5kUmVzdWx0XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCdwb3NpdGl2ZSBuZWdhdGl2ZScpXG5cdFx0XHRcdFx0LmhpZGUoKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OiBQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHRvblN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRlc3RCaW5kQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiR0ZXN0QmluZFJlc3VsdFxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmVnYXRpdmUnKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygncG9zaXRpdmUnKVxuXHRcdFx0XHRcdC50ZXh0KGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF9UZXN0QmluZFN1Y2Nlc3MpXG5cdFx0XHRcdFx0LnNob3coKTtcblx0XHRcdH0sXG5cdFx0XHRvbkZhaWx1cmUocmVzcG9uc2UpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJHRlc3RCaW5kQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdGxldCB0ZXh0ID0gZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX1Rlc3RCaW5kRmFpbHVyZTtcblx0XHRcdFx0Y29uc3QgZGV0YWlsID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuZmxhdHRlbk1lc3NhZ2VzKHJlc3BvbnNlID8gcmVzcG9uc2UubWVzc2FnZXMgOiBudWxsKTtcblx0XHRcdFx0aWYgKGRldGFpbCkge1xuXHRcdFx0XHRcdHRleHQgPSBgJHt0ZXh0fTogJHtkZXRhaWx9YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kdGVzdEJpbmRSZXN1bHRcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ3Bvc2l0aXZlJylcblx0XHRcdFx0XHQuYWRkQ2xhc3MoJ25lZ2F0aXZlJylcblx0XHRcdFx0XHQudGV4dCh0ZXh0KVxuXHRcdFx0XHRcdC5zaG93KCk7XG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBGbGF0dGVucyBhIFBCWEFwaVJlc3VsdCBtZXNzYWdlcyBwYXlsb2FkIGludG8gYSBzaW5nbGUgc3RyaW5nLlxuXHQgKiBBY2NlcHRzIGVpdGhlciBhIGZsYXQgYXJyYXkgb2Ygc3RyaW5ncyBvciBhIGRpY3Qga2V5ZWQgYnkgc2V2ZXJpdHlcblx0ICogKGVycm9yL2luZm8vd2FybmluZykgd2hvc2UgdmFsdWVzIGFyZSBhcnJheXMgb2Ygc3RyaW5ncy5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBtZXNzYWdlc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKi9cblx0ZmxhdHRlbk1lc3NhZ2VzKG1lc3NhZ2VzKXtcblx0XHRpZiAoIW1lc3NhZ2VzKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuXHRcdFx0cmV0dXJuIG1lc3NhZ2VzLmpvaW4oJzsgJyk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgbWVzc2FnZXMgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRjb25zdCBsaW5lcyA9IFtdO1xuXHRcdFx0T2JqZWN0LmtleXMobWVzc2FnZXMpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdFx0XHRjb25zdCBidWNrZXQgPSBtZXNzYWdlc1trZXldO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShidWNrZXQpKSB7XG5cdFx0XHRcdFx0YnVja2V0LmZvckVhY2goKGxpbmUpID0+IGxpbmVzLnB1c2goU3RyaW5nKGxpbmUpKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYnVja2V0KSB7XG5cdFx0XHRcdFx0bGluZXMucHVzaChTdHJpbmcoYnVja2V0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGxpbmVzLmpvaW4oJzsgJyk7XG5cdFx0fVxuXHRcdHJldHVybiBTdHJpbmcobWVzc2FnZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQZXItc2VydmVyLXR5cGUgZGVmYXVsdHMuIFZhbHVlcyBhcmUgdXNlZCBhcyBwbGFjZWhvbGRlcnMgKGFsd2F5cykgYW5kXG5cdCAqIHByZS1maWxscyAob25seSBmb3IgZmllbGRzIHRoZSB1c2VyIGhhc24ndCBmaWxsZWQgeWV0KS4gRmlsdGVyIHN0cmluZ3Ncblx0ICogYXJlIHRoZSBvbmx5IGZpZWxkIGZvciB3aGljaCB3ZSBhbHNvIG92ZXJ3cml0ZSBub24tZW1wdHkgdmFsdWVzIOKAlCB0aGVcblx0ICogb2xkIGZpbHRlciBmcm9tIGEgZGlmZmVyZW50IHNlcnZlciB0eXBlIHdvdWxkIGJlIG9iamVjdGl2ZWx5IHdyb25nIG9uXG5cdCAqIHRoZSBuZXcgb25lLCBhbmQgdGhpcyBmaWVsZCBpcyBzaG9ydCBlbm91Z2ggdGhhdCBsb3NpbmcgaXQgaXMgY2hlYXAuXG5cdCAqL1xuXHRsZGFwVHlwZVByZXNldHM6IHtcblx0XHRBY3RpdmVEaXJlY3Rvcnk6IHtcblx0XHRcdGFkbWluaXN0cmF0aXZlTG9naW46ICdDTj1BZG1pbixDTj1Vc2VycyxEQz1leGFtcGxlLERDPWNvbScsXG5cdFx0XHRiYXNlRE46ICdEQz1leGFtcGxlLERDPWNvbScsXG5cdFx0XHRvcmdhbml6YXRpb25hbFVuaXQ6ICdPVT1Vc2VycyxEQz1leGFtcGxlLERDPWNvbScsXG5cdFx0XHR1c2VyRmlsdGVyOiAnKCYob2JqZWN0Q2xhc3M9dXNlcikob2JqZWN0Q2F0ZWdvcnk9UEVSU09OKSknLFxuXHRcdFx0dXNlck5hbWVBdHRyaWJ1dGU6ICdkaXNwbGF5TmFtZScsXG5cdFx0XHR1c2VyRXh0ZW5zaW9uQXR0cmlidXRlOiAndGVsZXBob25lTnVtYmVyJyxcblx0XHRcdHVzZXJNb2JpbGVBdHRyaWJ1dGU6ICdtb2JpbGUnLFxuXHRcdFx0dXNlckVtYWlsQXR0cmlidXRlOiAnbWFpbCcsXG5cdFx0XHR1c2VyQXZhdGFyQXR0cmlidXRlOiAndGh1bWJuYWlsUGhvdG8nLFxuXHRcdFx0dXNlckFjY291bnRDb250cm9sOiAndXNlckFjY291bnRDb250cm9sJyxcblx0XHRcdHVzZXJQYXNzd29yZEF0dHJpYnV0ZTogJycsXG5cdFx0fSxcblx0XHRPcGVuTERBUDoge1xuXHRcdFx0YWRtaW5pc3RyYXRpdmVMb2dpbjogJ2NuPWFkbWluLGRjPWV4YW1wbGUsZGM9Y29tJyxcblx0XHRcdGJhc2VETjogJ2RjPWV4YW1wbGUsZGM9Y29tJyxcblx0XHRcdG9yZ2FuaXphdGlvbmFsVW5pdDogJ291PXBlb3BsZSxkYz1leGFtcGxlLGRjPWNvbScsXG5cdFx0XHR1c2VyRmlsdGVyOiAnKG9iamVjdENsYXNzPWluZXRPcmdQZXJzb24pJyxcblx0XHRcdHVzZXJOYW1lQXR0cmlidXRlOiAnY24nLFxuXHRcdFx0dXNlckV4dGVuc2lvbkF0dHJpYnV0ZTogJ3RlbGVwaG9uZU51bWJlcicsXG5cdFx0XHR1c2VyTW9iaWxlQXR0cmlidXRlOiAnbW9iaWxlJyxcblx0XHRcdHVzZXJFbWFpbEF0dHJpYnV0ZTogJ21haWwnLFxuXHRcdFx0dXNlckF2YXRhckF0dHJpYnV0ZTogJ2pwZWdQaG90bycsXG5cdFx0XHR1c2VyQWNjb3VudENvbnRyb2w6ICcnLFxuXHRcdFx0dXNlclBhc3N3b3JkQXR0cmlidXRlOiAndXNlclBhc3N3b3JkJyxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGNoYW5nZSBvZiB0aGUgTERBUCB0eXBlIGRyb3Bkb3duLlxuXHQgKlxuXHQgKiBSdWxlczpcblx0ICogIC0gQWx3YXlzIHJlZnJlc2ggcGxhY2Vob2xkZXJzIHNvIHRoZSBvcGVyYXRvciBzZWVzIGZvcm1hdCBoaW50cyBmb3Jcblx0ICogICAgdGhlIG5ldyB0eXBlIGV2ZW4gd2hlbiBmaWVsZHMgYXJlIGFscmVhZHkgcG9wdWxhdGVkLlxuXHQgKiAgLSBQcmUtZmlsbCBlbXB0eSBmaWVsZHMgZnJvbSB0aGUgcHJlc2V0OyBuZXZlciBvdmVyd3JpdGUgdXNlciBpbnB1dC5cblx0ICogIC0gRmlsdGVyICsgYmluZC1sb2dpbiBoaW50IGJhbm5lciBhcmUgYWx3YXlzIHN3YXBwZWQgdG8gdGhlIG5ldyB0eXBlXG5cdCAqICAgIHNvIHN0YWxlIGV4YW1wbGVzIGRvbid0IGxpbmdlci5cblx0ICovXG5cdG9uQ2hhbmdlTGRhcFR5cGUodmFsdWUpe1xuXHRcdGNvbnN0IHByZXNldCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmxkYXBUeXBlUHJlc2V0c1t2YWx1ZV07XG5cdFx0aWYgKCFwcmVzZXQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRPYmplY3Qua2V5cyhwcmVzZXQpLmZvckVhY2goKGZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBpbnB1dCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZpbmQoYFtuYW1lPVwiJHtmaWVsZH1cIl1gKTtcblx0XHRcdGlmICghaW5wdXQubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdC8vIEFsd2F5cyByZWZyZXNoIHRoZSBwbGFjZWhvbGRlciDigJQgaXQncyBhIGhpbnQsIG5vdCBkYXRhLlxuXHRcdFx0aW5wdXQuYXR0cigncGxhY2Vob2xkZXInLCBwcmVzZXRbZmllbGRdIHx8ICcnKTtcblx0XHRcdC8vIE9ubHkgZmlsbCBlbXB0eSBmaWVsZHMg4oCUIG5ldmVyIGRlc3Ryb3kgdGhlIG9wZXJhdG9yJ3MgaW5wdXQuXG5cdFx0XHRjb25zdCBjdXJyZW50ID0gKGlucHV0LnZhbCgpIHx8ICcnKS50cmltKCk7XG5cdFx0XHRpZiAoY3VycmVudCA9PT0gJycgJiYgcHJlc2V0W2ZpZWxkXSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdzZXQgdmFsdWUnLCBmaWVsZCwgcHJlc2V0W2ZpZWxkXSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFdpcmVzIHRvb2x0aXBzIGZvciBldmVyeSBhbm5vdGF0ZWQgZmllbGQgb24gdGhlIGZvcm0uIFVzZXMgdGhlIHNoYXJlZFxuXHQgKiBUb29sdGlwQnVpbGRlciBoZWxwZXIgZnJvbSB0aGUgYWRtaW4gY2FiaW5ldCBzbyB0aGUgcG9wdXAgc3RydWN0dXJlXG5cdCAqIG1hdGNoZXMgdGhlIHJlc3Qgb2YgTWlrb1BCWCAoc2VlIGRvY3MvVE9PTFRJUF9HVUlERUxJTkVTLm1kKS5cblx0ICovXG5cdGluaXRpYWxpemVUb29sdGlwcygpIHtcblx0XHRpZiAodHlwZW9mIFRvb2x0aXBCdWlsZGVyID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRvb2x0aXBDb25maWdzID0ge1xuXHRcdFx0c2VydmVyTmFtZTogVG9vbHRpcEJ1aWxkZXIuYnVpbGRDb250ZW50KHtcblx0XHRcdFx0aGVhZGVyOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfc2VydmVyTmFtZV9oZWFkZXIsXG5cdFx0XHRcdGxpc3Q6IFtcblx0XHRcdFx0XHR7IHRlcm06ICdsZGFwOi8vJywgZGVmaW5pdGlvbjogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX3R0X3NlcnZlck5hbWVfcGxhaW4gfSxcblx0XHRcdFx0XHR7IHRlcm06ICdsZGFwOi8vICsgU1RBUlRUTFMnLCBkZWZpbml0aW9uOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfc2VydmVyTmFtZV9zdGFydHRscyB9LFxuXHRcdFx0XHRcdHsgdGVybTogJ2xkYXBzOi8vJywgZGVmaW5pdGlvbjogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX3R0X3NlcnZlck5hbWVfbGRhcHMgfSxcblx0XHRcdFx0XSxcblx0XHRcdH0pLFxuXHRcdFx0YWRtaW5pc3RyYXRpdmVMb2dpbjogVG9vbHRpcEJ1aWxkZXIuYnVpbGRDb250ZW50KHtcblx0XHRcdFx0aGVhZGVyOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfYWRtaW5Mb2dpbl9oZWFkZXIsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfYWRtaW5Mb2dpbl9kZXNjLFxuXHRcdFx0XHRsaXN0OiBbXG5cdFx0XHRcdFx0J21pa29wYngnLFxuXHRcdFx0XHRcdCdtaWtvcGJ4QG1pa28ucnUnLFxuXHRcdFx0XHRcdCdNSUtPXFxcXG1pa29wYngnLFxuXHRcdFx0XHRcdCdDTj1taWtvcGJ4LENOPVVzZXJzLERDPW1pa28sREM9cnUnLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHRub3RlOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfYWRtaW5Mb2dpbl9ub3RlLFxuXHRcdFx0fSksXG5cdFx0XHR2ZXJpZnlDZXJ0OiBUb29sdGlwQnVpbGRlci5idWlsZENvbnRlbnQoe1xuXHRcdFx0XHRoZWFkZXI6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF90dF92ZXJpZnlfaGVhZGVyLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogZ2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX3R0X3ZlcmlmeV9kZXNjLFxuXHRcdFx0XHR3YXJuaW5nOiB7XG5cdFx0XHRcdFx0aGVhZGVyOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdmVyaWZ5X3dhcm5pbmdfaGVhZGVyLFxuXHRcdFx0XHRcdHRleHQ6IGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF90dF92ZXJpZnlfd2FybmluZyxcblx0XHRcdFx0fSxcblx0XHRcdH0pLFxuXHRcdFx0dXBkYXRlQXR0cmlidXRlczogVG9vbHRpcEJ1aWxkZXIuYnVpbGRDb250ZW50KHtcblx0XHRcdFx0aGVhZGVyOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9oZWFkZXIsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9kZXNjLFxuXHRcdFx0XHRsaXN0OiBbXG5cdFx0XHRcdFx0Z2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX3R0X3VwZGF0ZUF0dHJfZXh0ZW5zaW9uLFxuXHRcdFx0XHRcdGdsb2JhbFRyYW5zbGF0ZS5tb2R1bGVfbGRhcF90dF91cGRhdGVBdHRyX21vYmlsZSxcblx0XHRcdFx0XHRnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9lbWFpbCxcblx0XHRcdFx0XHRnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9hdmF0YXIsXG5cdFx0XHRcdFx0Z2xvYmFsVHJhbnNsYXRlLm1vZHVsZV9sZGFwX3R0X3VwZGF0ZUF0dHJfc2lwLFxuXHRcdFx0XHRdLFxuXHRcdFx0XHRub3RlOiBnbG9iYWxUcmFuc2xhdGUubW9kdWxlX2xkYXBfdHRfdXBkYXRlQXR0cl9ub3RlLFxuXHRcdFx0fSksXG5cdFx0fTtcblxuXHRcdCQoJy5maWVsZC1pbmZvLWljb24nKS5lYWNoKChpLCBlbCkgPT4ge1xuXHRcdFx0Y29uc3QgJGljb24gPSAkKGVsKTtcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSB0b29sdGlwQ29uZmlnc1skaWNvbi5kYXRhKCdmaWVsZCcpXTtcblx0XHRcdGlmICghY29udGVudCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHQkaWNvbi5wb3B1cCh7XG5cdFx0XHRcdGh0bWw6IGNvbnRlbnQsXG5cdFx0XHRcdHBvc2l0aW9uOiAndG9wIHJpZ2h0Jyxcblx0XHRcdFx0aG92ZXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRkZWxheTogeyBzaG93OiAzMDAsIGhpZGU6IDEwMCB9LFxuXHRcdFx0XHR2YXJpYXRpb246ICdmbG93aW5nJyxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBkaXNhYmxlZC9kZWxldGVkIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0RGlzYWJsZWRVc2Vycygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtZGlzYWJsZWQtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJyNkaXNhYmxlZC11c2Vycy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlEaXNhYmxlZFVzZXJzUGxhY2Vob2xkZXIuaGlkZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLmFmdGVyKGh0bWwpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS51cGRhdGVEaXNhYmxlZFVzZXJzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1kaXNhYmxlZC1sZGFwLXVzZXJzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjZGlzYWJsZWQtdXNlcnMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdFVzZXJNZXNzYWdlLnNob3dNdWx0aVN0cmluZyhyZXNwb25zZS5tZXNzYWdlcyk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZURpc2FibGVkVXNlcnNWaWV3KCk7XG5cdFx0XHR9LFxuXHRcdH0pXG5cdH0sXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBkaXNhYmxlZCB1c2VycyBsaXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHJlY29yZHMgLSBUaGUgbGlzdCBvZiBkaXNhYmxlZCB1c2Vyc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgSFRNTCB0YWJsZVxuXHQgKi9cblx0YnVpbGRUYWJsZUZyb21EaXNhYmxlZFVzZXJzTGlzdChyZWNvcmRzKXtcblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwiZGlzYWJsZWQtdXNlcnMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdVc2VyTmFtZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlck51bWJlcicpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignVXNlckVtYWlsJykrJzwvdGg+Jztcblx0XHRodG1sICs9ICc8L3RyPjwvdGhlYWQ+PHRib2R5PidcblxuXHRcdC8vIEdlbmVyYXRlIHRoZSBIVE1MIHRhYmxlIHdpdGggY29uZmxpY3RzIGRhdGFcblx0XHQkLmVhY2gocmVjb3JkcywgKGluZGV4LCByZWNvcmQpID0+IHtcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIml0ZW0gZmluZC11c2VyLXJvd1wiIGRhdGEtdmFsdWU9XCIke3JlY29yZFsnZXh0ZW5zaW9uX2lkJ119XCI+YDtcblx0XHRcdGh0bWwgKz0gJzx0ZD48aSBjbGFzcz1cImljb24gdXNlciBvdXRsaW5lXCI+PC9pPicrcmVjb3JkWyduYW1lJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnbnVtYmVyJ10rJzwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnZW1haWwnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdGJvZHk+PC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBkaXNhYmxlZCB1c2VycyB2aWV3LlxuXHQgKi9cblx0dXBkYXRlRGlzYWJsZWRVc2Vyc1ZpZXcoKXtcblx0XHRpZiAoJChgI2Rpc2FibGVkLXVzZXJzLXJlc3VsdCB0Ym9keSB0cmApLmxlbmd0aD09PTApe1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55RGlzYWJsZWRVc2Vyc1BsYWNlaG9sZGVyLnNob3coKTtcblx0XHRcdCQoJyNkaXNhYmxlZC11c2Vycy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZGVsZXRlIHN5bmMgY29uZmxpY3RzIHJlcXVlc3QgYW5kIGRlbGV0ZSBjb25mbGljdHMgdGFibGVcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3RzKCl7XG5cdFx0Y29uc3Qgc2VydmVySUQgPSBNb2R1bGVMZGFwU3luY01vZGlmeS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCdpZCcpO1xuXHRcdGlmICghc2VydmVySUQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JCgnI2NvbmZsaWN0cy1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2RlbGV0ZS1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlcyBkZWxldGUgc3luYyBjb25mbGljdCByZXF1ZXN0IGFuZCBkZWxldGUgY29uZmxpY3Qgcm93IG9uIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gcmVjb3JkSWRcblx0ICogQHJldHVybnMgeyp9XG5cdCAqL1xuXHRhcGlDYWxsRGVsZXRlQ29uZmxpY3QocmVjb3JkSWQpe1xuXHRcdGlmICghcmVjb3JkSWQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQkLmFwaSh7XG5cdFx0XHR1cmw6IGAke0NvbmZpZy5wYnhVcmx9L3BieGNvcmUvYXBpL21vZHVsZXMvTW9kdWxlTGRhcFN5bmMvZGVsZXRlLXNlcnZlci1jb25mbGljdGAsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YS5yZWNvcmRJZCA9IHJlY29yZElkO1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdFx0XHR9LFxuXHRcdFx0c3VjY2Vzc1Rlc3Q6UGJ4QXBpLnN1Y2Nlc3NUZXN0LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBIYW5kbGVzIHRoZSBzdWNjZXNzZnVsIHJlc3BvbnNlIG9mIHRoZSAnZGVsZXRlLXNlcnZlci1jb25mbGljdCcgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0JChgI2NvbmZsaWN0cy1yZXN1bHQgdHJbZGF0YS12YWx1ZT1cIiR7cmVjb3JkSWR9XCJdYCkucmVtb3ZlKCk7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LnVwZGF0ZUNvbmZsaWN0c1ZpZXcoKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdkZWxldGUtc2VydmVyLWNvbmZsaWN0JyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXHQvKipcblx0ICogTWFrZSBhbiBBUEkgY2FsbCB0byBnZXQgbGFzdCBzeW5jIGNvbmZsaWN0c1xuXHQgKi9cblx0YXBpQ2FsbEdldENvbmZsaWN0cygpe1xuXHRcdGNvbnN0IHNlcnZlcklEID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywnaWQnKTtcblx0XHRpZiAoIXNlcnZlcklEKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1zZXJ2ZXItY29uZmxpY3RzYCxcblx0XHRcdG9uOiAnbm93Jyxcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0YmVmb3JlU2VuZChzZXR0aW5ncykge1xuXHRcdFx0XHRzZXR0aW5ncy5kYXRhLmlkID0gc2VydmVySUQ7XG5cdFx0XHRcdHJldHVybiBzZXR0aW5ncztcblx0XHRcdH0sXG5cdFx0XHRzdWNjZXNzVGVzdDpQYnhBcGkuc3VjY2Vzc1Rlc3QsXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIHN1Y2Nlc3NmdWwgcmVzcG9uc2Ugb2YgdGhlICdnZXQtc2VydmVyLWNvbmZsaWN0cycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCQoJyNjb25mbGljdHMtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuaGlkZSgpO1xuXHRcdFx0XHRjb25zdCBodG1sID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuYnVpbGRUYWJsZUZyb21Db25mbGljdHNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kbm9BbnlDb25mbGljdHNQbGFjZWhvbGRlci5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkudXBkYXRlQ29uZmxpY3RzVmlldygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ2dldC1zZXJ2ZXItY29uZmxpY3RzJyBBUEkgcmVxdWVzdC5cblx0XHRcdCAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSAtIFRoZSByZXNwb25zZSBvYmplY3QuXG5cdFx0XHQgKi9cblx0XHRcdG9uRmFpbHVyZTogZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGNvbmZsaWN0cyB2aWV3LlxuXHQgKiBAcmV0dXJuIHt2b2lkfVxuXHQgKi9cblx0dXBkYXRlQ29uZmxpY3RzVmlldygpe1xuXHRcdGlmICgkKGAjY29uZmxpY3RzLXJlc3VsdCB0Ym9keSB0cmApLmxlbmd0aD09PTApe1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJG5vQW55Q29uZmxpY3RzUGxhY2Vob2xkZXIuc2hvdygpO1xuXHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGRlbGV0ZUFsbENvbmZsaWN0c0J1dHRvbi5oaWRlKCk7XG5cdFx0XHQkKCcjY29uZmxpY3RzLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kZGVsZXRlQWxsQ29uZmxpY3RzQnV0dG9uLnNob3coKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBMREFQIHVzZXJzXG5cdCAqL1xuXHRhcGlDYWxsR2V0TGRhcFVzZXJzKCl7XG5cdFx0JC5hcGkoe1xuXHRcdFx0dXJsOiBgJHtDb25maWcucGJ4VXJsfS9wYnhjb3JlL2FwaS9tb2R1bGVzL01vZHVsZUxkYXBTeW5jL2dldC1hdmFpbGFibGUtbGRhcC11c2Vyc2AsXG5cdFx0XHRvbjogJ25vdycsXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJlZm9yZVNlbmQoc2V0dGluZ3MpIHtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGNoZWNrR2V0VXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ2dldC1hdmFpbGFibGUtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRjaGVja0dldFVzZXJzQnV0dG9uLnJlbW92ZUNsYXNzKCdsb2FkaW5nIGRpc2FibGVkJyk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdGNvbnN0IGh0bWwgPSBNb2R1bGVMZGFwU3luY01vZGlmeS5idWlsZFRhYmxlRnJvbVVzZXJzTGlzdChyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGxkYXBDaGVja0dldFVzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEhhbmRsZXMgdGhlIGZhaWx1cmUgcmVzcG9uc2Ugb2YgdGhlICdnZXQtYXZhaWxhYmxlLWxkYXAtdXNlcnMnIEFQSSByZXF1ZXN0LlxuXHRcdFx0ICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIC0gVGhlIHJlc3BvbnNlIG9iamVjdC5cblx0XHRcdCAqL1xuXHRcdFx0b25GYWlsdXJlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kY2hlY2tHZXRVc2Vyc0J1dHRvbi5yZW1vdmVDbGFzcygnbG9hZGluZyBkaXNhYmxlZCcpO1xuXHRcdFx0XHQkKCcudWkubWVzc2FnZS5hamF4JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJyNsZGFwLXJlc3VsdCcpLnJlbW92ZSgpO1xuXHRcdFx0XHRVc2VyTWVzc2FnZS5zaG93TXVsdGlTdHJpbmcocmVzcG9uc2UubWVzc2FnZXMpO1xuXHRcdFx0fSxcblx0XHR9KVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGFuIEFQSSBjYWxsIHRvIHN5bmMgTERBUCB1c2Vyc1xuXHQgKi9cblx0YXBpQ2FsbFN5bmNVc2Vycygpe1xuXHRcdCQuYXBpKHtcblx0XHRcdHVybDogYCR7Q29uZmlnLnBieFVybH0vcGJ4Y29yZS9hcGkvbW9kdWxlcy9Nb2R1bGVMZGFwU3luYy9zeW5jLWxkYXAtdXNlcnNgLFxuXHRcdFx0b246ICdub3cnLFxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRiZWZvcmVTZW5kKHNldHRpbmdzKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24uYWRkQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0c2V0dGluZ3MuZGF0YSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZXMnKTtcblx0XHRcdFx0cmV0dXJuIHNldHRpbmdzO1xuXHRcdFx0fSxcblx0XHRcdHN1Y2Nlc3NUZXN0OlBieEFwaS5zdWNjZXNzVGVzdCxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgc3VjY2Vzc2Z1bCByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnI2xkYXAtcmVzdWx0JykucmVtb3ZlKCk7XG5cdFx0XHRcdCQoJy51aS5tZXNzYWdlLmFqYXgnKS5yZW1vdmUoKTtcblx0XHRcdFx0Y29uc3QgaHRtbCA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS4kc3luY1VzZXJzU2VnbWVudC5hZnRlcihodG1sKTtcblx0XHRcdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuYXBpQ2FsbEdldENvbmZsaWN0cygpO1xuXHRcdFx0XHRNb2R1bGVMZGFwU3luY01vZGlmeS5hcGlDYWxsR2V0RGlzYWJsZWRVc2VycygpO1xuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSGFuZGxlcyB0aGUgZmFpbHVyZSByZXNwb25zZSBvZiB0aGUgJ3N5bmMtbGRhcC11c2VycycgQVBJIHJlcXVlc3QuXG5cdFx0XHQgKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgLSBUaGUgcmVzcG9uc2Ugb2JqZWN0LlxuXHRcdFx0ICovXG5cdFx0XHRvbkZhaWx1cmU6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LiRzeW5jVXNlcnNCdXR0b24ucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcgZGlzYWJsZWQnKTtcblx0XHRcdFx0JCgnLnVpLm1lc3NhZ2UuYWpheCcpLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCcjbGRhcC1yZXN1bHQnKS5yZW1vdmUoKTtcblx0XHRcdFx0VXNlck1lc3NhZ2Uuc2hvd011bHRpU3RyaW5nKHJlc3BvbnNlLm1lc3NhZ2VzKTtcblx0XHRcdH0sXG5cdFx0fSlcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgdGFibGUgZnJvbSB0aGUgdXNlcidzIGxpc3Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gdXNlcnNMaXN0IC0gVGhlIGxpc3Qgb2YgdXNlcnNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tVXNlcnNMaXN0KHVzZXJzTGlzdCl7XG5cblx0XHRsZXQgaHRtbCA9ICc8dGFibGUgY2xhc3M9XCJ1aSB2ZXJ5IGNvbXBhY3Qgc2VsZWN0YWJsZSB0YWJsZVwiIGlkPVwibGRhcC1yZXN1bHRcIj4nO1xuXHRcdGNvbnN0IHVuaXF1ZUF0dHJpYnV0ZXMgPSB7fTtcblxuXHRcdC8vIEV4dHJhY3QgdW5pcXVlIGF0dHJpYnV0ZXMgZnJvbSB0aGUgcmVzcG9uc2UgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsICh1c2VyS2V5LCB1c2VyVmFsdWUpID0+IHtcblx0XHRcdCQuZWFjaCh1c2VyVmFsdWUsIChpbmRleCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmhpZGRlbkF0dHJpYnV0ZXMuaW5jbHVkZXMoaW5kZXgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHVuaXF1ZUF0dHJpYnV0ZXNbaW5kZXhdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gR2VuZXJhdGUgdGhlIEhUTUwgdGFibGUgaGVhZCB1c2VyIGRhdGEgYXR0cmlidXRlc1xuXHRcdGh0bWwgKz0gJzx0aGVhZD48dHI+J1xuXHRcdCQuZWFjaCh1bmlxdWVBdHRyaWJ1dGVzLCAoaW5kZXgsIHZhbHVlKSA9PiB7XG5cdFx0XHRpZiAoaW5kZXg9PT0ndXNlcnNTeW5jUmVzdWx0JyB8fCBpbmRleD09PSd1c2VySGFkQ2hhbmdlc09uVGhlU2lkZScpe1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKGluZGV4KSsnPC90aD4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bGV0IGNvbHVtbk5hbWUgPSAkKGBpbnB1dGApLmZpbHRlcihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4gJCh0aGlzKS52YWwoKSA9PT0gaW5kZXg7XG5cdFx0XHRcdH0pLmNsb3Nlc3QoJy5maWVsZCcpLmZpbmQoJ2xhYmVsJykudGV4dCgpO1xuXHRcdFx0XHRodG1sICs9Jzx0aD4nK2NvbHVtbk5hbWUrJzwvdGg+Jztcblx0XHRcdH1cblxuXHRcdH0pO1xuXHRcdGh0bWwgKz0gJzwvdHI+PC90aGVhZD4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIHVzZXIgZGF0YVxuXHRcdCQuZWFjaCh1c2Vyc0xpc3QsIChpbmRleCwgdXNlcikgPT4ge1xuXHRcdFx0Ly8gRGV0ZXJtaW5lIHRoZSByb3cgY2xhc3MgYmFzZWQgb24gd2hldGhlciB0aGUgdXNlciBpcyBkaXNhYmxlZFxuXHRcdFx0bGV0IHJvd0NsYXNzID0gdXNlcltNb2R1bGVMZGFwU3luY01vZGlmeS51c2VyRGlzYWJsZWRBdHRyaWJ1dGVdID09PSB0cnVlID8gJ2Rpc2FibGVkJyA6ICdpdGVtJztcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgdXNlcnNTeW5jUmVzdWx0IGlzICdjb25mbGljdCcgYW5kIGFkZCBhIGNsYXNzIHRvIGhpZ2hsaWdodCB0aGUgcm93XG5cdFx0XHRpZiAodXNlclsndXNlcnNTeW5jUmVzdWx0J10gPT09ICdDT05GTElDVCcpIHtcblx0XHRcdFx0cm93Q2xhc3MgKz0gJyBuZWdhdGl2ZSc7XG5cdFx0XHR9IGVsc2UgaWYodXNlclsndXNlcnNTeW5jUmVzdWx0J10gPT09ICdVUERBVEVEJyl7XG5cdFx0XHRcdHJvd0NsYXNzICs9ICcgcG9zaXRpdmUnO1xuXHRcdFx0fVxuXG5cdFx0XHRodG1sICs9IGA8dHIgZGF0YS12YWx1ZT1cIiR7dXNlclsnZXh0ZW5zaW9uSWRJbk1pa29QQlgnXX1cIiBjbGFzcz1cIiR7cm93Q2xhc3N9IG9wZW4tdXNlci1yb3dcIj5gO1xuXG5cdFx0XHQkLmVhY2godW5pcXVlQXR0cmlidXRlcywgKGF0dHJJbmRleCwgYXR0clZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNlbGxWYWx1ZSA9IHVzZXJbYXR0ckluZGV4XSB8fCAnJztcblx0XHRcdFx0aWYgKGF0dHJJbmRleCA9PT0gJ3VzZXJzU3luY1Jlc3VsdCcgfHwgYXR0ckluZGV4ID09PSAndXNlckhhZENoYW5nZXNPblRoZVNpZGUnKSB7XG5cdFx0XHRcdFx0aHRtbCArPSAnPHRkPicgKyBNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbihjZWxsVmFsdWUpICsgJzwvdGQ+Jztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRodG1sICs9ICc8dGQ+JyArIGNlbGxWYWx1ZSArICc8L3RkPic7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aHRtbCArPSAnPC90cj4nO1xuXHRcdH0pO1xuXG5cdFx0aHRtbCArPSAnPC90YWJsZT4nO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBCdWlsZCB0YWJsZSBmcm9tIHRoZSBjb25mbGljdHMgbGlzdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb25mbGljdHMgLSBUaGUgbGlzdCBvZiBjb25mbGljdHNcblx0ICogQHJldHVybnMge3N0cmluZ30gVGhlIEhUTUwgdGFibGVcblx0ICovXG5cdGJ1aWxkVGFibGVGcm9tQ29uZmxpY3RzTGlzdChjb25mbGljdHMpe1xuXHRcdGxldCBodG1sID0gJzx0YWJsZSBjbGFzcz1cInVpIHZlcnkgY29tcGFjdCBzZWxlY3RhYmxlIHRhYmxlXCIgaWQ9XCJjb25mbGljdHMtcmVzdWx0XCI+Jztcblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSBoZWFkIGNvbmZsaWN0cyBkYXRhIGF0dHJpYnV0ZXNcblx0XHRodG1sICs9ICc8dGhlYWQ+PHRyPidcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFRpbWUnKSsnPC90aD4nO1xuXHRcdGh0bWwgKz0nPHRoPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24oJ0NvbmZsaWN0U2lkZScpKyc8L3RoPic7XG5cdFx0aHRtbCArPSc8dGg+JytNb2R1bGVMZGFwU3luY01vZGlmeS5nZXRUcmFuc2xhdGlvbignQ29uZmxpY3RFcnJvck1lc3NhZ2VzJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD4nK01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdDb25mbGljdFVzZXJEYXRhJykrJzwvdGg+Jztcblx0XHRodG1sICs9Jzx0aD48L3RoPic7XG5cdFx0aHRtbCArPSAnPC90cj48L3RoZWFkPjx0Ym9keT4nXG5cblx0XHQvLyBHZW5lcmF0ZSB0aGUgSFRNTCB0YWJsZSB3aXRoIGNvbmZsaWN0cyBkYXRhXG5cdFx0JC5lYWNoKGNvbmZsaWN0cywgKGluZGV4LCByZWNvcmQpID0+IHtcblx0XHRcdGNvbnN0IHByZXR0eUpTT04gPSBKU09OLnN0cmluZ2lmeShyZWNvcmRbJ3BhcmFtcyddLCBudWxsLCAyKTtcblx0XHRcdGh0bWwgKz0gYDx0ciBjbGFzcz1cIml0ZW1cIiBkYXRhLXZhbHVlPVwiJHtyZWNvcmRbJ2lkJ119XCI+YDtcblx0XHRcdGh0bWwgKz0gJzx0ZD4nK3JlY29yZFsnbGFzdFRpbWUnXSsnPC90ZD4nO1xuXHRcdFx0aHRtbCArPSAnPHRkPicrTW9kdWxlTGRhcFN5bmNNb2RpZnkuZ2V0VHJhbnNsYXRpb24ocmVjb3JkWydzaWRlJ10pKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+JytyZWNvcmRbJ2Vycm9ycyddKyc8L3RkPic7XG5cdFx0XHRodG1sICs9ICc8dGQ+PHByZT4nK3ByZXR0eUpTT04rJzwvcHJlPjwvdGQ+Jztcblx0XHRcdGh0bWwgKz0gYDx0ZD48ZGl2IGNsYXNzPVwidWkgaWNvbiBiYXNpYyBidXR0b24gcG9wdXBlZCBkZWxldGUtY29uZmxpY3RcIiBkYXRhLWNvbnRlbnQ9XCIke01vZHVsZUxkYXBTeW5jTW9kaWZ5LmdldFRyYW5zbGF0aW9uKCdkZWxldGVDdXJyZW50Q29uZmxpY3QnKX1cIj48aSBjbGFzcz1cImljb24gdHJhc2ggcmVkXCI+PC9pPjwvZGl2PjwvdGQ+YDtcblx0XHRcdGh0bWwgKz0gJzwvdHI+Jztcblx0XHR9KTtcblx0XHRodG1sICs9ICc8L3Rib2R5PjwvdGFibGU+Jztcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gdGV4dCB1c2luZyB0aGUgZ2xvYmFsIHRyYW5zbGF0aW9uIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBUaGUgdGV4dCB0byBiZSB0cmFuc2xhdGVkLlxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgdHJhbnNsYXRlZCB0ZXh0IGlmIGF2YWlsYWJsZSwgb3IgdGhlIG9yaWdpbmFsIHRleHQuXG5cdCAqL1xuXHRnZXRUcmFuc2xhdGlvbih0ZXh0KXtcblx0XHRpZiAodGV4dC5sZW5ndGg9PT0wKXtcblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH1cblx0XHRjb25zdCBuYW1lVGVtcGxhdGUgPSBgbW9kdWxlX2xkYXBfJHt0ZXh0fWA7XG5cdFx0Y29uc3QgbmFtZSA9IGdsb2JhbFRyYW5zbGF0ZVtuYW1lVGVtcGxhdGVdO1xuXHRcdGlmIChuYW1lIT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBDYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgc2VuZGluZyB0aGUgZm9ybS5cblx0ICogQHBhcmFtIHtvYmplY3R9IHNldHRpbmdzIC0gVGhlIHNldHRpbmdzIG9iamVjdC5cblx0ICogQHJldHVybnMge29iamVjdH0gLSBUaGUgbW9kaWZpZWQgc2V0dGluZ3Mgb2JqZWN0LlxuXHQgKi9cblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGNvbnN0IHJlc3VsdCA9IHNldHRpbmdzO1xuXHRcdHJlc3VsdC5kYXRhID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXG5cdFx0TW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmouZmluZCgnLmNoZWNrYm94JykuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdFx0Y29uc3QgaW5wdXQgPSAkKG9iaikuZmluZCgnaW5wdXQnKTtcblx0XHRcdGNvbnN0IGlkID0gaW5wdXQuYXR0cignaWQnKTtcblx0XHRcdGlmICgkKG9iaikuY2hlY2tib3goJ2lzIGNoZWNrZWQnKSkge1xuXHRcdFx0XHRyZXN1bHQuZGF0YVtpZF09JzEnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0LmRhdGFbaWRdPScwJztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGZ1bmN0aW9uIGFmdGVyIHNlbmRpbmcgdGhlIGZvcm0uXG5cdCAqL1xuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cdFx0Ly8gQ2FsbGJhY2sgaW1wbGVtZW50YXRpb25cblx0fSxcblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGZvcm0uXG5cdCAqL1xuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gTW9kdWxlTGRhcFN5bmNNb2RpZnkuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfW1vZHVsZS1sZGFwLXN5bmMvbW9kdWxlLWxkYXAtc3luYy9zYXZlYDtcblx0XHRGb3JtLnZhbGlkYXRlUnVsZXMgPSBNb2R1bGVMZGFwU3luY01vZGlmeS52YWxpZGF0ZVJ1bGVzO1xuXHRcdEZvcm0uY2JCZWZvcmVTZW5kRm9ybSA9IE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBNb2R1bGVMZGFwU3luY01vZGlmeS5jYkFmdGVyU2VuZEZvcm07XG5cdFx0Rm9ybS5pbml0aWFsaXplKCk7XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdE1vZHVsZUxkYXBTeW5jTW9kaWZ5LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=