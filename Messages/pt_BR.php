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
    'module_ldap_UserExtensionAttribute' => 'Número interno do usuário',
    'module_ldap_UserMobileAttribute' => 'Celular',
    'module_ldap_UserEmailAttribute' => 'Endereço de email',
    'module_ldap_UserNameAttribute' => 'Nome e sobrenome do usuário',
    'module_ldap_UserAccountControl' => 'Atributo onde o status de bloqueio do usuário é armazenado',
    'module_ldap_UserAvatarAttribute' => 'Atributo com foto',
    'module_ldap_UpdateAttributes' => 'Atualizar dados no domínio ao alterá-los no MikoPBX (direitos de gravação necessários)',
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
    'module_ldap_ConflictsTabHeader' => 'Conflitos de sincronização',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_NoAnyConflicts' => 'Nenhum problema encontrado',
    'module_ldap_deleteCurrentConflict' => 'Excluir a entrada atual, não altera os dados no PBX ou no servidor LDAP/AD',
    'module_ldap_ConflictTime' => 'Data',
    'module_ldap_ConflictUserData' => 'Dados salvos',
    'module_ldap_ConflictSide' => 'Quem recusou',
    'module_ldap_ConflictErrorMessages' => 'Motivo da recusa',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PABX',
    'module_ldap_CONFLICT' => 'conflito',
    'module_ldap_SyncTabHeader' => 'Sincronização e conflitos',
    'module_ldap_TabAttributes' => 'Campos de sincronização',
    'module_ldap_DeleteAllConflicts' => 'Limpe todos os conflitos',
    'module_ldap_UserPasswordAttribute' => 'Senha SIP',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'Quando os dados mudam no MikoPBX, serão atualizados no domínio: número interno, número de celular, email, avatar, senha SIP',
    'module_ldap_UserName' => 'Nome de usuário',
    'module_ldap_UserNumber' => 'Número do ramal',
    'module_ldap_findExtension' => 'Encontre na lista de usuários',
    'module_ldap_DeletedUsersHeader' => 'Funcionários desabilitados no LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'Nenhum funcionário com deficiência',
    'module_ldap_UserEmail' => 'E-mail',
];
