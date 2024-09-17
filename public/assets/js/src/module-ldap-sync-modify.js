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
		ModuleLdapSyncModify.$ldapTypeDropdown.dropdown();

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

		// Handle change TLS protocol
		ModuleLdapSyncModify.$useTlsDropdown.dropdown({
			values: [
				{
					name: 'ldap://',
					value: '0',
					selected : ModuleLdapSyncModify.$formObj.form('get value','useTLS')==='0'
				},
				{
					name     : 'ldaps://',
					value    : '1',
					selected : ModuleLdapSyncModify.$formObj.form('get value','useTLS')==='1'
				}
			],
		});
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
			const rowClass = user[ModuleLdapSyncModify.userDisabledAttribute]===true?'disabled':'item';
			html += `<tr class="${rowClass}">`;
			$.each(uniqueAttributes, (attrIndex, attrValue) => {
				const cellValue = user[attrIndex] || '';
				if (attrIndex==='usersSyncResult' || attrIndex==='userHadChangesOnTheSide'){
					html +='<td>'+ModuleLdapSyncModify.getTranslation(cellValue)+'</td>';
				} else {
					html += '<td>'+cellValue+'</td>';
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

