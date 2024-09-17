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
    'repModuleLdapSync' => 'Synchronisation avec LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synchronisation avec LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Synchronisation avec LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Le module vous permet de charger des utilisateurs d\'un domaine',
    'module_ldap_LdapServerConnectionHeader' => 'Paramètres de connexion du contrôleur de domaine',
    'module_ldap_AddServer' => 'Ajouter un serveur',
    'module_ldap_AddServerShort' => 'Ajouter',
    'module_ldap_NoAnyServers' => 'Aucun serveur configuré',
    'module_ldap_TableColumnServerName' => 'Adresse du serveur',
    'module_ldap_OrganizationalUnit' => 'Subdivision',
    'module_ldap_BaseDN' => 'Racine du domaine',
    'module_ldap_ldapType' => 'Type de serveur',
    'module_ldap_LdapServerName' => 'Adresse du contrôleur de domaine',
    'module_ldap_LdapServerPort' => 'Port',
    'module_ldap_LdapAdminLogin' => 'Nom d\'utilisateur et mot de passe avec accès en lecture/écriture au domaine',
    'module_ldap_LdapBaseDN' => 'Racine du domaine',
    'module_ldap_LdapPassword' => 'Mot de passe',
    'module_ldap_LdapAttributesHeader' => 'Attributs du domaine pour la correspondance avec les données dans MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'numéro de poste de l\'utilisateur',
    'module_ldap_UserMobileAttribute' => 'téléphone mobile',
    'module_ldap_UserEmailAttribute' => 'Adresse e-mail',
    'module_ldap_UserNameAttribute' => 'nom et prénom de l\'utilisateur',
    'module_ldap_UserAccountControl' => 'attribut où l\'état de verrouillage de l\'utilisateur est stocké',
    'module_ldap_UserAvatarAttribute' => 'attribut photo',
    'module_ldap_UpdateAttributes' => 'Mettre à jour les numéros de téléphone du domaine lorsqu\'ils changent dans MikoPBX (nécessite des autorisations en écriture)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdivision',
    'module_ldap_LdapUserFilter' => 'Filtre utilisateur supplémentaire',
    'module_ldap_LdapCheckGetListHeader' => 'Test pour obtenir la liste des utilisateurs LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'En utilisant les paramètres d\'accès et les filtres spécifiés, nous exécuterons une requête vers LDAP/AD et recevrons une partie de 20 utilisateurs pour la synchronisation',
    'module_ldap_LdapGetUsersButton' => 'Exécuter la demande',
    'module_ldap_user_not_found' => 'L\'utilisateur n\'a pas accès au domaine ou les paramètres spécifiés sont incorrects',
    'module_ldap_ValidateServerNameIsEmpty' => 'Adresse du contrôleur de domaine non renseignée',
    'module_ldap_ValidateServerPortIsEmpty' => 'Port du contrôleur de domaine non renseigné',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'La connexion pour l\'utilisateur du domaine n\'est pas renseignée',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Mot de passe non renseigné pour l\'utilisateur du domaine',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Racine du domaine non renseignée',
    'module_ldap_LdapManualSyncHeader' => 'Synchronisation manuelle',
    'module_ldap_LdapManualSyncManual' => 'Lorsque vous cliquez sur le bouton, une partie de 20 utilisateurs sera synchronisée entre le contrôleur de domaine spécifié et MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Synchroniser les données',
    'module_ldap_usersSyncResult' => 'Statut',
    'module_ldap_userHadChangesOnTheSide' => 'Mis à jour',
    'module_ldap_OnPBXSide' => 'à l\'intérieur de MikoPBX',
    'module_ldap_OnDomainSide' => 'dans le domaine',
    'module_ldap_SKIPPED' => 'ignoré',
    'module_ldap_UPDATED' => 'traité',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'L\'attribut avec le nom d\'utilisateur dans le domaine n\'est pas renseigné',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'L\'attribut avec l\'e-mail de l\'utilisateur dans le domaine n\'est pas renseigné',
    'module_ldap_EnableAutoSync' => 'Activer la synchronisation planifiée',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'L\'attribut avec le téléphone mobile de l\'utilisateur dans le domaine n\'est pas renseigné',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'L\'attribut avec le numéro de téléphone interne de l\'utilisateur dans le domaine n\'est pas renseigné',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'L\'attribut avec l\'attribut d\'activité de l\'utilisateur dans le domaine n\'est pas renseigné',
    'module_ldap_TableColumnAutoSync' => 'Synchronisation automatique',
    'module_ldap_ConflictsTabHeader' => 'Conflits de synchronisation',
    'module_ldap_NoAnyConflicts' => 'Aucun problème trouvé',
    'module_ldap_deleteCurrentConflict' => 'Supprime l\'entrée actuelle, ne modifie les données ni dans le PBX ni du côté du serveur LDAP/AD',
    'module_ldap_ConflictTime' => 'Date',
    'module_ldap_ConflictUserData' => 'Données enregistrées',
    'module_ldap_ConflictSide' => 'Qui a refusé',
    'module_ldap_ConflictErrorMessages' => 'Motif du refus',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/ANNONCE',
    'module_ldap_CONFLICT' => 'conflit',
    'module_ldap_SyncTabHeader' => 'Synchronisation et conflits',
    'module_ldap_TabAttributes' => 'Champs de synchronisation',
    'module_ldap_DeleteAllConflicts' => 'Effacer tous les conflits',
];
