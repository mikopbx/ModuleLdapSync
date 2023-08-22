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
		userIdAttribute: {
			identifier: 'userIdAttribute',
			rules: [
				{
					type: 'empty',
					prompt: globalTranslate.module_ldap_ValidateUserIdAttributeIsEmpty,
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

	},

	/**
	 * Handles get LDAP users list button click.
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
			html +=`<th>${index}</th>`;
		});
		html += '</tr></thead>'

		// Generate the HTML table with user data
		$.each(usersList, (index, user) => {
			const rowClass = user[ModuleLdapSyncModify.userDisabledAttribute]===true?'disabled':'item';
			html += `<tr class="${rowClass}">`;
			$.each(uniqueAttributes, (attrIndex, attrValue) => {
				const cellValue = user[attrIndex] || '';
				html += `<td>${cellValue}</td>`;
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

