<?php
return [
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
    'repModuleLdapSync' => 'Sincronização com LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Sincronização com LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Sincronização com LDAP/AD',
    'SubHeaderModuleLdapSync' => 'O módulo permite carregar usuários de um domínio',
    'module_ldap_LdapServerConnectionHeader' => 'Configurações de conexão do controlador de domínio',
    'module_ldap_AddServer' => 'Adicionar servidor',
    'module_ldap_AddServerShort' => 'Adicionar',
    'module_ldap_NoAnyServers' => 'Nenhum servidor configurado',
    'module_ldap_TableColumnServerName' => 'Endereço do servidor',
    'module_ldap_OrganizationalUnit' => 'Subdivisão',
    'module_ldap_BaseDN' => 'Raiz do domínio',
    'module_ldap_ldapType' => 'Tipo de servidor',
    'module_ldap_LdapServerName' => 'Endereço do controlador de domínio',
    'module_ldap_LdapServerPort' => 'Porta',
    'module_ldap_LdapAdminLogin' => 'Nome de usuário e senha com acesso de leitura/gravação ao domínio',
    'module_ldap_LdapBaseDN' => 'Raiz do domínio',
    'module_ldap_LdapPassword' => 'Senha',
    'module_ldap_LdapAttributesHeader' => 'Atributos no domínio para correspondência com dados no MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'número do ramal do usuário',
    'module_ldap_UserMobileAttribute' => 'celular',
    'module_ldap_UserEmailAttribute' => 'Endereço de email',
    'module_ldap_UserNameAttribute' => 'nome e sobrenome do usuário',
    'module_ldap_UserAccountControl' => 'atributo onde o status de bloqueio do usuário é armazenado',
    'module_ldap_UserAvatarAttribute' => 'atributo de foto',
    'module_ldap_UpdateAttributes' => 'Atualize os números de telefone no domínio quando eles mudarem no MikoPBX (requer permissões de gravação)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdivisão',
    'module_ldap_LdapUserFilter' => 'Filtro de usuário adicional',
    'module_ldap_LdapCheckGetListHeader' => 'Teste para obter lista de usuários LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Utilizando os parâmetros e filtros de acesso especificados, executaremos uma solicitação ao LDAP/AD e receberemos uma parcela de 20 usuários para sincronização',
    'module_ldap_LdapGetUsersButton' => 'Executar solicitação',
    'module_ldap_user_not_found' => 'O usuário não tem acesso ao domínio ou os parâmetros especificados estão incorretos',
    'module_ldap_ValidateServerNameIsEmpty' => 'Endereço do controlador de domínio não preenchido',
    'module_ldap_ValidateServerPortIsEmpty' => 'Porta do controlador de domínio não preenchida',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'O login do usuário do domínio não foi preenchido',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Senha não preenchida para usuário do domínio',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Raiz do domínio não preenchida',
    'module_ldap_LdapManualSyncHeader' => 'Sincronização manual',
    'module_ldap_LdapManualSyncManual' => 'Ao clicar no botão, uma parte de 20 usuários será sincronizada entre o controlador de domínio especificado e o MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Sincronizar dados',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Atualizada',
    'module_ldap_OnPBXSide' => 'dentro do MikoPBX',
    'module_ldap_OnDomainSide' => 'no domínio',
    'module_ldap_SKIPPED' => 'ignorado',
    'module_ldap_UPDATED' => 'processado',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'O atributo com o número de telefone interno do usuário no domínio não está preenchido',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'O atributo com o nome de usuário no domínio não está preenchido',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'O atributo com o e-mail do usuário no domínio não está preenchido',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'O atributo com o atributo de atividade do usuário no domínio não está preenchido',
    'module_ldap_EnableAutoSync' => 'Habilitar sincronização agendada',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'O atributo com o celular do usuário no domínio não está preenchido',
    'module_ldap_TableColumnAutoSync' => 'Sincronização automática',
];
