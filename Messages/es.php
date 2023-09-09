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
    'repModuleLdapSync' => 'Sincronización con LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Sincronización con LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Sincronización con LDAP/AD',
    'SubHeaderModuleLdapSync' => 'El módulo le permite cargar usuarios desde un dominio.',
    'module_ldap_LdapServerConnectionHeader' => 'Configuración de conexión del controlador de dominio',
    'module_ldap_AddServer' => 'Agregar servidor',
    'module_ldap_AddServerShort' => 'Agregar',
    'module_ldap_NoAnyServers' => 'No hay servidores configurados',
    'module_ldap_TableColumnServerName' => 'Dirección del servidor',
    'module_ldap_OrganizationalUnit' => 'Subdivisión',
    'module_ldap_BaseDN' => 'raíz del dominio',
    'module_ldap_ldapType' => 'Tipo de servidor',
    'module_ldap_LdapServerName' => 'Dirección del controlador de dominio',
    'module_ldap_LdapServerPort' => 'Puerto',
    'module_ldap_LdapAdminLogin' => 'Nombre de usuario y contraseña con acceso de lectura/escritura al dominio',
    'module_ldap_LdapBaseDN' => 'raíz del dominio',
    'module_ldap_LdapPassword' => 'Contraseña',
    'module_ldap_LdapAttributesHeader' => 'Atributos en el dominio para comparar con datos en MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'número de extensión de usuario',
    'module_ldap_UserMobileAttribute' => 'teléfono móvil',
    'module_ldap_UserEmailAttribute' => 'Dirección de correo electrónico',
    'module_ldap_UserNameAttribute' => 'nombre y apellido del usuario',
    'module_ldap_UserAccountControl' => 'atributo donde se almacena el estado de bloqueo del usuario',
    'module_ldap_UserAvatarAttribute' => 'atributo de foto',
    'module_ldap_UpdateAttributes' => 'Actualizar números de teléfono en el dominio cuando cambian en MikoPBX (requiere permisos de escritura)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdivisión',
    'module_ldap_LdapUserFilter' => 'Filtro de usuario adicional',
    'module_ldap_LdapCheckGetListHeader' => 'Pruebe para obtener una lista de usuarios de LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Usando los parámetros y filtros de acceso especificados, consultaremos LDAP/AD y obtendremos una lista de usuarios para sincronizar.',
    'module_ldap_LdapGetUsersButton' => 'Ejecutar solicitud',
    'module_ldap_user_not_found' => 'El usuario no tiene acceso al dominio o los parámetros especificados son incorrectos',
    'module_ldap_ValidateServerNameIsEmpty' => 'Dirección del controlador de dominio no completada',
    'module_ldap_ValidateServerPortIsEmpty' => 'Puerto del controlador de dominio no poblado',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'El inicio de sesión para el usuario del dominio no está completo',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Contraseña no completada para el usuario del dominio',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Raíz del dominio no llena',
    'module_ldap_LdapManualSyncHeader' => 'Sincronización manual',
    'module_ldap_LdapManualSyncManual' => 'Al hacer clic en el botón se sincronizarán los usuarios entre el controlador de dominio especificado y MikoPBX.',
    'module_ldap_LdapManualSyncButton' => 'Sincronizar datos',
    'module_ldap_usersSyncResult' => 'Estado',
    'module_ldap_userHadChangesOnTheSide' => 'Actualizado',
    'module_ldap_OnPBXSide' => 'dentro de MikoPBX',
    'module_ldap_OnDomainSide' => 'en el dominio',
    'module_ldap_SKIPPED' => 'saltado',
    'module_ldap_UPDATED' => 'procesada',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'El atributo con el nombre de usuario en el dominio no está completo',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'El atributo con el teléfono móvil del usuario en el dominio no está completo',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'El atributo con el número de teléfono interno del usuario en el dominio no está completo',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'El atributo con el correo electrónico del usuario en el dominio no está completado',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'El atributo con el atributo de actividad del usuario en el dominio no está completo',
    'module_ldap_EnableAutoSync' => 'Habilitar la sincronización programada (cada hora)',
    'module_ldap_TableColumnAutoSync' => 'Sincronización automática',
];
