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
    'repModuleLdapSync' => 'Sincronizzazione con LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Sincronizzazione con LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Sincronizzazione con LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Il modulo consente di caricare utenti da un dominio',
    'module_ldap_LdapServerConnectionHeader' => 'Impostazioni di connessione del controller di dominio',
    'module_ldap_AddServer' => 'Aggiungi server',
    'module_ldap_AddServerShort' => 'Aggiungere',
    'module_ldap_NoAnyServers' => 'Nessun server configurato',
    'module_ldap_TableColumnServerName' => 'Indirizzo del server',
    'module_ldap_OrganizationalUnit' => 'Suddivisione',
    'module_ldap_BaseDN' => 'Radice del dominio',
    'module_ldap_ldapType' => 'Tipo di server',
    'module_ldap_LdapServerName' => 'Indirizzo del controller di dominio',
    'module_ldap_LdapServerPort' => 'Porta',
    'module_ldap_LdapAdminLogin' => 'Nome utente e password con accesso in lettura/scrittura al dominio',
    'module_ldap_LdapBaseDN' => 'Radice del dominio',
    'module_ldap_LdapPassword' => 'Parola d\'ordine',
    'module_ldap_LdapAttributesHeader' => 'Attributi nel dominio per la corrispondenza con i dati in MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'numero di interno dell\'utente',
    'module_ldap_UserMobileAttribute' => 'cellulare',
    'module_ldap_UserEmailAttribute' => 'Indirizzo e-mail',
    'module_ldap_UserNameAttribute' => 'nome e cognome dell\'utente',
    'module_ldap_UserAccountControl' => 'attributo in cui è archiviato lo stato di blocco dell\'utente',
    'module_ldap_UserAvatarAttribute' => 'attributo della foto',
    'module_ldap_UpdateAttributes' => 'Aggiorna i numeri di telefono nel dominio quando cambiano in MikoPBX (richiede permessi di scrittura)',
    'module_ldap_LdapOrganizationalUnit' => 'Suddivisione',
    'module_ldap_LdapUserFilter' => 'Filtro utente aggiuntivo',
    'module_ldap_LdapCheckGetListHeader' => 'Prova per ottenere l\'elenco degli utenti LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Utilizzando i parametri di accesso e i filtri specificati, interrogheremo LDAP/AD e otterremo un elenco di utenti da sincronizzare',
    'module_ldap_LdapGetUsersButton' => 'Esegui richiesta',
    'module_ldap_user_not_found' => 'L\'utente non ha accesso al dominio oppure i parametri specificati non sono corretti',
    'module_ldap_ValidateServerNameIsEmpty' => 'Indirizzo del controller di dominio non compilato',
    'module_ldap_ValidateServerPortIsEmpty' => 'Porta del controller di dominio non popolata',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Il login per l\'utente del dominio non è stato compilato',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Password non inserita per l\'utente del dominio',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Radice del dominio non compilata',
    'module_ldap_LdapManualSyncHeader' => 'Sincronizzazione manuale',
    'module_ldap_LdapManualSyncManual' => 'Facendo clic sul pulsante verranno sincronizzati gli utenti tra il controller di dominio specificato e MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Sincronizza i dati',
    'module_ldap_usersSyncResult' => 'Stato',
    'module_ldap_userHadChangesOnTheSide' => 'Aggiornato',
    'module_ldap_OnPBXSide' => 'all\'interno del MikoPBX',
    'module_ldap_OnDomainSide' => 'nel dominio',
    'module_ldap_SKIPPED' => 'saltato',
    'module_ldap_UPDATED' => 'elaborato',
    'module_ldap_EnableAutoSync' => 'Abilita la sincronizzazione pianificata (ogni ora)',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'L\'attributo con il nome utente nel dominio non è compilato',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'L\'attributo con il cellulare dell\'utente nel dominio non è compilato',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'L\'attributo con il numero di telefono interno dell\'utente nel dominio non è compilato',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'L\'attributo con l\'e-mail dell\'utente nel dominio non è compilato',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'L\'attributo con l\'attributo dell\'attività dell\'utente nel dominio non è compilato',
];
