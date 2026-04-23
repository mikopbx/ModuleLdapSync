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
const ModuleLdapSyncModify = {

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
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateServerNameIsEmpty,
				},
			],
		},
		serverPort: {
			identifier: 'serverPort',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateServerPortIsEmpty,
				},
			],
		},
		administrativeLogin: {
			identifier: 'administrativeLogin',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateAdministrativeLoginIsEmpty,
				},
			],
		},
		administrativePasswordHidden: {
			identifier: 'administrativePasswordHidden',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateAdministrativePasswordIsEmpty,
				},
			],
		},
		baseDN: {
			identifier: 'baseDN',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateBaseDNIsEmpty,
				},
			],
		},
		userNameAttribute: {
			identifier: 'userNameAttribute',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserNameAttributeIsEmpty,
				},
			],
		},
		userMobileAttribute: {
			identifier: 'userMobileAttribute',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserMobileAttributeIsEmpty,
				},
			],
		},
		userExtensionAttribute: {
			identifier: 'userExtensionAttribute',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserExtensionAttributeIsEmpty,
				},
			],
		},
		userEmailAttribute: {
			identifier: 'userEmailAttribute',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserEmailAttributeIsEmpty,
				},
			],
		},
		userAccountControl: {
			identifier: 'userAccountControl',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserAccountControlIsEmpty,
				},
			],
		},
	},

	/**
	 * Initializes the module.
	 */
	initialize() {
		ModuleLdapSyncModify.$ldapTypeDropdown.dropdown({
			onChange: ModuleLdapSyncModify.onChangeLdapType,
		});

		// Prime placeholders for the currently saved type on first render.
		const initialType = ModuleLdapSyncModify.$formObj.form('get value', 'ldapType')
			|| ModuleLdapSyncModify.$ldapTypeDropdown.dropdown('get value')
			|| 'ActiveDirectory';
		ModuleLdapSyncModify.onChangeLdapType(initialType);

		ModuleLdapSyncModify.initializeTooltips();

		// Native Fomantic tooltip on the icon-only "Test bind" button.
		ModuleLdapSyncModify.$testBindButton.popup({ position: 'top right', delay: { show: 200, hide: 80 } });

		ModuleLdapSyncModify.initializeForm();

		// Handle get users list button click
		ModuleLdapSyncModify.$checkGetUsersButton.on('click', function(e) {
			e.preventDefault();
			ModuleLdapSyncModify.apiCallGetLdapUsers();
		});

		// Handle sync users button click
		ModuleLdapSyncModify.$syncUsersButton.on('click', function(e) {
			e.preventDefault();
			ModuleLdapSyncModify.apiCallSyncUsers();
		});

		// Handle test-bind button click on the connection tab.
		ModuleLdapSyncModify.$testBindButton.on('click', function(e) {
			e.preventDefault();
			ModuleLdapSyncModify.apiCallTestBind();
		});

		ModuleLdapSyncModify.$mainTabMenu.tab();

		// Handle delete conflict button click
		$('body').on('click', '.delete-conflict', function(e) {
			e.preventDefault();
			const recordId = $(e.target).closest('tr').data('value');
			ModuleLdapSyncModify.apiCallDeleteConflict(recordId);
		});
		ModuleLdapSyncModify.apiCallGetConflicts();

		// Handle sync users button click
		ModuleLdapSyncModify.$deleteAllConflictsButton.on('click', function(e) {
			e.preventDefault();
			ModuleLdapSyncModify.apiCallDeleteConflicts();
		});

		ModuleLdapSyncModify.updateConflictsView();

		// Handle change TLS protocol — three-way selector.
		const currentTlsMode = ModuleLdapSyncModify.$formObj.form('get value', 'tlsMode') || 'none';
		ModuleLdapSyncModify.$useTlsDropdown.dropdown({
			values: [
				{
					name: 'ldap://',
					value: 'none',
					selected: currentTlsMode === 'none'
				},
				{
					name: 'ldap:// + STARTTLS',
					value: 'starttls',
					selected: currentTlsMode === 'starttls'
				},
				{
					name: 'ldaps://',
					value: 'ldaps',
					selected: currentTlsMode === 'ldaps'
				}
			],
			onChange: function (value) {
				ModuleLdapSyncModify.$formObj.form('set value', 'tlsMode', value);
				ModuleLdapSyncModify.refreshTlsSectionVisibility();
			},
		});

		// Certificate validation toggle — refresh UX state (insecure banner,
		// Certificate-tab warning triangle) on flip.
		ModuleLdapSyncModify.$verifyCertCheckbox.on('change', function () {
			ModuleLdapSyncModify.refreshTlsSectionVisibility();
		});
		// Typing into the CA textarea clears the "missing CA" warning.
		ModuleLdapSyncModify.$caCertTextarea.on('input', function () {
			ModuleLdapSyncModify.refreshTlsSectionVisibility();
		});
		ModuleLdapSyncModify.refreshTlsSectionVisibility();


		ModuleLdapSyncModify.updateDisabledUsersView();
		ModuleLdapSyncModify.apiCallGetDisabledUsers();

		// Handle find user in conflict row click
		$('body').on('click', 'tr.find-user-row', function(e) {
			e.preventDefault();
			const recordId = $(e.target).closest('tr').data('value');
			const searchValue =  `id:${recordId}`;
			window.open( `${globalRootUrl}extensions/index/?search=${encodeURIComponent(searchValue)}`, '_blank');
		});

		// Handle open user in sync table row click
		$('body').on('click', 'tr.open-user-row', function(e) {
			e.preventDefault();
			const recordId = $(e.target).closest('tr').data('value');
			window.open( `${globalRootUrl}extensions/modify/${encodeURIComponent(recordId)}`, '_blank');
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
	refreshTlsSectionVisibility(){
		const tlsMode = ModuleLdapSyncModify.$formObj.form('get value', 'tlsMode') || 'none';
		const verify = ModuleLdapSyncModify.$verifyCertCheckbox.is(':checked');
		const encrypted = tlsMode === 'starttls' || tlsMode === 'ldaps';
		const caEmpty = (ModuleLdapSyncModify.$caCertTextarea.val() || '').trim() === '';

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
	apiCallTestBind(){
		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/test-ldap-bind`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				ModuleLdapSyncModify.$testBindButton.addClass('loading disabled');
				ModuleLdapSyncModify.$testBindResult
					.removeClass('positive negative')
					.hide();
				settings.data = ModuleLdapSyncModify.$formObj.form('get values');
				return settings;
			},
			successTest: PbxApi.successTest,
			onSuccess(response) {
				ModuleLdapSyncModify.$testBindButton.removeClass('loading disabled');
				ModuleLdapSyncModify.$testBindResult
					.removeClass('negative')
					.addClass('positive')
					.text(globalTranslate.module_ldap_TestBindSuccess)
					.show();
			},
			onFailure(response) {
				ModuleLdapSyncModify.$testBindButton.removeClass('loading disabled');
				let text = globalTranslate.module_ldap_TestBindFailure;
				const detail = ModuleLdapSyncModify.flattenMessages(response ? response.messages : null);
				if (detail) {
					text = `${text}: ${detail}`;
				}
				ModuleLdapSyncModify.$testBindResult
					.removeClass('positive')
					.addClass('negative')
					.text(text)
					.show();
			},
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
	flattenMessages(messages){
		if (!messages) {
			return '';
		}
		if (Array.isArray(messages)) {
			return messages.join('; ');
		}
		if (typeof messages === 'object') {
			const lines = [];
			Object.keys(messages).forEach((key) => {
				const bucket = messages[key];
				if (Array.isArray(bucket)) {
					bucket.forEach((line) => lines.push(String(line)));
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
			userPasswordAttribute: '',
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
			userPasswordAttribute: 'userPassword',
		},
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
	onChangeLdapType(value){
		const preset = ModuleLdapSyncModify.ldapTypePresets[value];
		if (!preset) {
			return;
		}

		Object.keys(preset).forEach((field) => {
			const input = ModuleLdapSyncModify.$formObj.find(`[name="${field}"]`);
			if (!input.length) {
				return;
			}
			// Always refresh the placeholder — it's a hint, not data.
			input.attr('placeholder', preset[field] || '');
			// Only fill empty fields — never destroy the operator's input.
			const current = (input.val() || '').trim();
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
	initializeTooltips() {
		if (typeof TooltipBuilder === 'undefined') {
			return;
		}

		const tooltipConfigs = {
			serverName: TooltipBuilder.buildContent({
				header: globalTranslate.module_ldap_tt_serverName_header,
				list: [
					{ term: 'ldap://', definition: globalTranslate.module_ldap_tt_serverName_plain },
					{ term: 'ldap:// + STARTTLS', definition: globalTranslate.module_ldap_tt_serverName_starttls },
					{ term: 'ldaps://', definition: globalTranslate.module_ldap_tt_serverName_ldaps },
				],
			}),
			administrativeLogin: TooltipBuilder.buildContent({
				header: globalTranslate.module_ldap_tt_adminLogin_header,
				description: globalTranslate.module_ldap_tt_adminLogin_desc,
				list: [
					'mikopbx',
					'mikopbx@miko.ru',
					'MIKO\\mikopbx',
					'CN=mikopbx,CN=Users,DC=miko,DC=ru',
				],
				note: globalTranslate.module_ldap_tt_adminLogin_note,
			}),
			verifyCert: TooltipBuilder.buildContent({
				header: globalTranslate.module_ldap_tt_verify_header,
				description: globalTranslate.module_ldap_tt_verify_desc,
				warning: {
					header: globalTranslate.module_ldap_tt_verify_warning_header,
					text: globalTranslate.module_ldap_tt_verify_warning,
				},
			}),
			updateAttributes: TooltipBuilder.buildContent({
				header: globalTranslate.module_ldap_tt_updateAttr_header,
				description: globalTranslate.module_ldap_tt_updateAttr_desc,
				list: [
					globalTranslate.module_ldap_tt_updateAttr_extension,
					globalTranslate.module_ldap_tt_updateAttr_mobile,
					globalTranslate.module_ldap_tt_updateAttr_email,
					globalTranslate.module_ldap_tt_updateAttr_avatar,
					globalTranslate.module_ldap_tt_updateAttr_sip,
				],
				note: globalTranslate.module_ldap_tt_updateAttr_note,
			}),
		};

		$('.field-info-icon').each((i, el) => {
			const $icon = $(el);
			const content = tooltipConfigs[$icon.data('field')];
			if (!content) {
				return;
			}
			$icon.popup({
				html: content,
				position: 'top right',
				hoverable: true,
				delay: { show: 300, hide: 100 },
				variation: 'flowing',
			});
		});
	},

	/**
	 * Make an API call to get disabled/deleted users
	 */
	apiCallGetDisabledUsers(){
		const serverID = ModuleLdapSyncModify.$formObj.form('get value','id');
		if (!serverID) {
			return;
		}

		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/get-disabled-ldap-users`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				settings.data.id = serverID;
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'get-disabled-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				$('#disabled-users-result').remove();
				$('.ui.message.ajax').remove();
				ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.hide();
				const html = ModuleLdapSyncModify.buildTableFromDisabledUsersList(response.data);
				ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.after(html);
				ModuleLdapSyncModify.updateDisabledUsersView();
			},
			/**
			 * Handles the failure response of the 'get-disabled-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				$('.ui.message.ajax').remove();
				$('#disabled-users-result').remove();
				UserMessage.showMultiString(response.messages);
				ModuleLdapSyncModify.updateDisabledUsersView();
			},
		})
	},
	/**
	 * Build table from the disabled users list
	 *
	 * @param {Array} records - The list of disabled users
	 * @returns {string} The HTML table
	 */
	buildTableFromDisabledUsersList(records){
		let html = '<table class="ui very compact selectable table" id="disabled-users-result">';
		// Generate the HTML table head conflicts data attributes
		html += '<thead><tr>'
		html +='<th>'+ModuleLdapSyncModify.getTranslation('UserName')+'</th>';
		html +='<th>'+ModuleLdapSyncModify.getTranslation('UserNumber')+'</th>';
		html +='<th>'+ModuleLdapSyncModify.getTranslation('UserEmail')+'</th>';
		html += '</tr></thead><tbody>'

		// Generate the HTML table with conflicts data
		$.each(records, (index, record) => {
			html += `<tr class="item find-user-row" data-value="${record['extension_id']}">`;
			html += '<td><i class="icon user outline"></i>'+record['name']+'</td>';
			html += '<td>'+record['number']+'</td>';
			html += '<td>'+record['email']+'</td>';
			html += '</tr>';
		});
		html += '</tbody></table>';
		return html;
	},
	/**
	 * Update the disabled users view.
	 */
	updateDisabledUsersView(){
		if ($(`#disabled-users-result tbody tr`).length===0){
			ModuleLdapSyncModify.$noAnyDisabledUsersPlaceholder.show();
			$('#disabled-users-result').remove();
		}
	},

	/**
	 * Handles delete sync conflicts request and delete conflicts table
	 * @returns {*}
	 */
	apiCallDeleteConflicts(){
		const serverID = ModuleLdapSyncModify.$formObj.form('get value','id');
		if (!serverID) {
			return;
		}
		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/delete-server-conflicts`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				settings.data.id = serverID;
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'delete-server-conflicts' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				$('.ui.message.ajax').remove();
				$('#conflicts-result').remove();
				ModuleLdapSyncModify.updateConflictsView();
			},
			/**
			 * Handles the failure response of the 'delete-server-conflicts' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				$('.ui.message.ajax').remove();
				UserMessage.showMultiString(response.messages);
			},
		})
	},
	/**
	 * Handles delete sync conflict request and delete conflict row on the table
	 * @param recordId
	 * @returns {*}
	 */
	apiCallDeleteConflict(recordId){
		if (!recordId) {
			return;
		}

		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/delete-server-conflict`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				settings.data.recordId = recordId;
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'delete-server-conflict' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				$('.ui.message.ajax').remove();
				$(`#conflicts-result tr[data-value="${recordId}"]`).remove();
				ModuleLdapSyncModify.updateConflictsView();
			},
			/**
			 * Handles the failure response of the 'delete-server-conflict' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				$('.ui.message.ajax').remove();
				UserMessage.showMultiString(response.messages);
			},
		})
	},
	/**
	 * Make an API call to get last sync conflicts
	 */
	apiCallGetConflicts(){
		const serverID = ModuleLdapSyncModify.$formObj.form('get value','id');
		if (!serverID) {
			return;
		}

		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/get-server-conflicts`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				settings.data.id = serverID;
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'get-server-conflicts' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				$('#conflicts-result').remove();
				$('.ui.message.ajax').remove();
				ModuleLdapSyncModify.$noAnyConflictsPlaceholder.hide();
				const html = ModuleLdapSyncModify.buildTableFromConflictsList(response.data);
				ModuleLdapSyncModify.$noAnyConflictsPlaceholder.after(html);
				ModuleLdapSyncModify.updateConflictsView();
			},
			/**
			 * Handles the failure response of the 'get-server-conflicts' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				$('.ui.message.ajax').remove();
				$('#conflicts-result').remove();
				UserMessage.showMultiString(response.messages);
			},
		})
	},

	/**
	 * Update the conflicts view.
	 * @return {void}
	 */
	updateConflictsView(){
		if ($(`#conflicts-result tbody tr`).length===0){
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
	apiCallGetLdapUsers(){
		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/get-available-ldap-users`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				ModuleLdapSyncModify.$checkGetUsersButton.addClass('loading disabled');
				settings.data = ModuleLdapSyncModify.$formObj.form('get values');
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'get-available-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				ModuleLdapSyncModify.$checkGetUsersButton.removeClass('loading disabled');
				$('#ldap-result').remove();
				$('.ui.message.ajax').remove();
				const html = ModuleLdapSyncModify.buildTableFromUsersList(response.data);
				ModuleLdapSyncModify.$ldapCheckGetUsersSegment.after(html);
			},
			/**
			 * Handles the failure response of the 'get-available-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				ModuleLdapSyncModify.$checkGetUsersButton.removeClass('loading disabled');
				$('.ui.message.ajax').remove();
				$('#ldap-result').remove();
				UserMessage.showMultiString(response.messages);
			},
		})
	},

	/**
	 * Make an API call to sync LDAP users
	 */
	apiCallSyncUsers(){
		$.api({
			url: `${Config.pbxUrl}/pbxcore/api/modules/ModuleLdapSync/sync-ldap-users`,
			on: 'now',
			method: 'POST',
			beforeSend(settings) {
				ModuleLdapSyncModify.$syncUsersButton.addClass('loading disabled');
				settings.data = ModuleLdapSyncModify.$formObj.form('get values');
				return settings;
			},
			successTest:PbxApi.successTest,
			/**
			 * Handles the successful response of the 'sync-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onSuccess: function(response) {
				ModuleLdapSyncModify.$syncUsersButton.removeClass('loading disabled');
				$('#ldap-result').remove();
				$('.ui.message.ajax').remove();
				const html = ModuleLdapSyncModify.buildTableFromUsersList(response.data);
				ModuleLdapSyncModify.$syncUsersSegment.after(html);
				ModuleLdapSyncModify.apiCallGetConflicts();
				ModuleLdapSyncModify.apiCallGetDisabledUsers();
			},
			/**
			 * Handles the failure response of the 'sync-ldap-users' API request.
			 * @param {object} response - The response object.
			 */
			onFailure: function(response) {
				ModuleLdapSyncModify.$syncUsersButton.removeClass('loading disabled');
				$('.ui.message.ajax').remove();
				$('#ldap-result').remove();
				UserMessage.showMultiString(response.messages);
			},
		})
	},

	/**
	 * Build table from the user's list
	 *
	 * @param {Array} usersList - The list of users
	 * @returns {string} The HTML table
	 */
	buildTableFromUsersList(usersList){

		let html = '<table class="ui very compact selectable table" id="ldap-result">';
		const uniqueAttributes = {};

		// Extract unique attributes from the response data
		$.each(usersList, (userKey, userValue) => {
			$.each(userValue, (index, value) => {
				if (ModuleLdapSyncModify.hiddenAttributes.includes(index)) {
					return;
				}
				uniqueAttributes[index] = true;
			});
		});

		// Generate the HTML table head user data attributes
		html += '<thead><tr>'
		$.each(uniqueAttributes, (index, value) => {
			if (index==='usersSyncResult' || index==='userHadChangesOnTheSide'){
				html +='<th>'+ModuleLdapSyncModify.getTranslation(index)+'</th>';
			} else {
				let columnName = $(`input`).filter(function() {
					return $(this).val() === index;
				}).closest('.field').find('label').text();
				html +='<th>'+columnName+'</th>';
			}

		});
		html += '</tr></thead>'

		// Generate the HTML table with user data
		$.each(usersList, (index, user) => {
			// Determine the row class based on whether the user is disabled
			let rowClass = user[ModuleLdapSyncModify.userDisabledAttribute] === true ? 'disabled' : 'item';

			// Check if usersSyncResult is 'conflict' and add a class to highlight the row
			if (user['usersSyncResult'] === 'CONFLICT') {
				rowClass += ' negative';
			} else if(user['usersSyncResult'] === 'UPDATED'){
				rowClass += ' positive';
			}

			html += `<tr data-value="${user['userIdInMikoPBX']}" class="${rowClass} open-user-row">`;

			$.each(uniqueAttributes, (attrIndex, attrValue) => {
				const cellValue = user[attrIndex] || '';
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
	buildTableFromConflictsList(conflicts){
		let html = '<table class="ui very compact selectable table" id="conflicts-result">';
		// Generate the HTML table head conflicts data attributes
		html += '<thead><tr>'
		html +='<th>'+ModuleLdapSyncModify.getTranslation('ConflictTime')+'</th>';
		html +='<th>'+ModuleLdapSyncModify.getTranslation('ConflictSide')+'</th>';
		html +='<th>'+ModuleLdapSyncModify.getTranslation('ConflictErrorMessages')+'</th>';
		html +='<th>'+ModuleLdapSyncModify.getTranslation('ConflictUserData')+'</th>';
		html +='<th></th>';
		html += '</tr></thead><tbody>'

		// Generate the HTML table with conflicts data
		$.each(conflicts, (index, record) => {
			const prettyJSON = JSON.stringify(record['params'], null, 2);
			html += `<tr class="item" data-value="${record['id']}">`;
			html += '<td>'+record['lastTime']+'</td>';
			html += '<td>'+ModuleLdapSyncModify.getTranslation(record['side'])+'</td>';
			html += '<td>'+record['errors']+'</td>';
			html += '<td><pre>'+prettyJSON+'</pre></td>';
			html += `<td><div class="ui icon basic button popuped delete-conflict" data-content="${ModuleLdapSyncModify.getTranslation('deleteCurrentConflict')}"><i class="icon trash red"></i></div></td>`;
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
	getTranslation(text){
		if (text.length===0){
			return text;
		}
		const nameTemplate = `module_ldap_${text}`;
		const name = globalTranslate[nameTemplate];
		if (name!==undefined) {
			return name;
		}

		return text;
	},
	
	/**
	 * Callback function before sending the form.
	 * @param {object} settings - The settings object.
	 * @returns {object} - The modified settings object.
	 */
	cbBeforeSendForm(settings) {
		const result = settings;
		result.data = ModuleLdapSyncModify.$formObj.form('get values');

		ModuleLdapSyncModify.$formObj.find('.checkbox').each((index, obj) => {
			const input = $(obj).find('input');
			const id = input.attr('id');
			if ($(obj).checkbox('is checked')) {
				result.data[id]='1';
			} else {
				result.data[id]='0';
			}
		});

		return result;
	},

	/**
	 * Callback function after sending the form.
	 */
	cbAfterSendForm() {
		// Callback implementation
	},

	/**
	 * Initializes the form.
	 */
	initializeForm() {
		Form.$formObj = ModuleLdapSyncModify.$formObj;
		Form.url = `${globalRootUrl}module-ldap-sync/module-ldap-sync/save`;
		Form.validateRules = ModuleLdapSyncModify.validateRules;
		Form.cbBeforeSendForm = ModuleLdapSyncModify.cbBeforeSendForm;
		Form.cbAfterSendForm = ModuleLdapSyncModify.cbAfterSendForm;
		Form.initialize();
	},
};

$(document).ready(() => {
	ModuleLdapSyncModify.initialize();
});

