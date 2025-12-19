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
    'SubHeaderModuleLdapSync' => 'El módulo le permite cargar usuarios desde un dominio',
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
    'module_ldap_UserExtensionAttribute' => 'Número interno del usuario',
    'module_ldap_UserMobileAttribute' => 'Teléfono móvil',
    'module_ldap_UserEmailAttribute' => 'Dirección de correo electrónico',
    'module_ldap_UserNameAttribute' => 'Nombre y apellido del usuario',
    'module_ldap_UserAccountControl' => 'Atributo donde se almacena el estado de bloqueo del usuario',
    'module_ldap_UserAvatarAttribute' => 'Atributo con foto',
    'module_ldap_UpdateAttributes' => 'Actualizar datos en el dominio al cambiarlos en MikoPBX (se requieren derechos de escritura)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdivisión',
    'module_ldap_LdapUserFilter' => 'Filtro de usuario adicional',
    'module_ldap_LdapCheckGetListHeader' => 'Pruebe para obtener una lista de usuarios de LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Usando los parámetros de acceso y filtros especificados, ejecutaremos una solicitud a LDAP/AD y recibiremos una porción de 20 usuarios para sincronización',
    'module_ldap_LdapGetUsersButton' => 'Ejecutar solicitud',
    'module_ldap_user_not_found' => 'El usuario no tiene acceso al dominio o los parámetros especificados son incorrectos',
    'module_ldap_ValidateServerNameIsEmpty' => 'Dirección del controlador de dominio no completada',
    'module_ldap_ValidateServerPortIsEmpty' => 'Puerto del controlador de dominio no poblado',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'El inicio de sesión para el usuario del dominio no está completo',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Contraseña no completada para el usuario del dominio',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Raíz del dominio no llena',
    'module_ldap_LdapManualSyncHeader' => 'Sincronización manual',
    'module_ldap_LdapManualSyncManual' => 'Al hacer clic en el botón, una parte de 20 usuarios se sincronizará entre el controlador de dominio especificado y MikoPBX',
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
    'module_ldap_EnableAutoSync' => 'Habilitar sincronización programada',
    'module_ldap_TableColumnAutoSync' => 'Sincronización automática',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_ConflictsTabHeader' => 'Conflictos de sincronización',
    'module_ldap_NoAnyConflicts' => 'No se encontraron problemas',
    'module_ldap_deleteCurrentConflict' => 'Elimina la entrada actual, no cambia los datos ni en la PBX ni en el lado del servidor LDAP/AD',
    'module_ldap_ConflictTime' => 'Fecha',
    'module_ldap_ConflictUserData' => 'Datos guardados',
    'module_ldap_ConflictSide' => 'quien se negó',
    'module_ldap_ConflictErrorMessages' => 'Motivo del rechazo',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'conflicto',
    'module_ldap_SyncTabHeader' => 'Sincronización y conflictos',
    'module_ldap_TabAttributes' => 'Campos de sincronización',
    'module_ldap_DeleteAllConflicts' => 'Borrar todos los conflictos',
    'module_ldap_UserPasswordAttribute' => 'Contraseña SIP',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'Cuando los datos cambien en MikoPBX, se actualizará en el dominio lo siguiente: número interno, número de móvil, correo electrónico, avatar, contraseña SIP',
    'module_ldap_UserName' => 'Nombre de usuario',
    'module_ldap_UserNumber' => 'Número de extensión',
    'module_ldap_findExtension' => 'Buscar en la lista de usuarios',
    'module_ldap_DeletedUsersHeader' => 'Empleados deshabilitados en LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'No se admiten empleados discapacitados',
    'module_ldap_UserEmail' => 'Correo electrónico',
];
