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
    'repModuleLdapSync' => 'Sincronizare cu LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Sincronizare cu LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Sincronizare cu LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Modulul vă permite să încărcați utilizatori dintr-un domeniu',
    'module_ldap_LdapServerConnectionHeader' => 'Setări de conectare a controlerului de domeniu',
    'module_ldap_AddServer' => 'Adauga server',
    'module_ldap_AddServerShort' => 'Adăuga',
    'module_ldap_NoAnyServers' => 'Nu au fost configurate servere',
    'module_ldap_TableColumnServerName' => 'Adresa serverului',
    'module_ldap_OrganizationalUnit' => 'Subdiviziune',
    'module_ldap_BaseDN' => 'Rădăcina domeniului',
    'module_ldap_ldapType' => 'Tip server',
    'module_ldap_LdapServerName' => 'Adresa controlerului de domeniu',
    'module_ldap_LdapServerPort' => 'Port',
    'module_ldap_LdapAdminLogin' => 'Nume de utilizator și parolă cu acces de citire/scriere la domeniu',
    'module_ldap_LdapBaseDN' => 'Rădăcina domeniului',
    'module_ldap_LdapPassword' => 'Parola',
    'module_ldap_LdapAttributesHeader' => 'Atribute din domeniu pentru potrivirea cu datele din MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'numărul extensiei utilizatorului',
    'module_ldap_UserMobileAttribute' => 'telefon mobil',
    'module_ldap_UserEmailAttribute' => 'Adresa de e-mail',
    'module_ldap_UserNameAttribute' => 'numele și prenumele utilizatorului',
    'module_ldap_UserAccountControl' => 'atribut în care este stocată starea de blocare a utilizatorului',
    'module_ldap_UserAvatarAttribute' => 'atribut foto',
    'module_ldap_UpdateAttributes' => 'Actualizați numerele de telefon din domeniu când se schimbă în MikoPBX (necesită permisiuni de scriere)',
    'module_ldap_LdapOrganizationalUnit' => 'Subdiviziune',
    'module_ldap_LdapUserFilter' => 'Filtru suplimentar de utilizator',
    'module_ldap_LdapCheckGetListHeader' => 'Testați pentru a obține lista de utilizatori LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Folosind parametrii de acces și filtrele specificați, vom executa o solicitare către LDAP/AD și vom primi o porțiune din 20 de utilizatori pentru sincronizare',
    'module_ldap_LdapGetUsersButton' => 'Rulați cererea',
    'module_ldap_user_not_found' => 'Utilizatorul nu are acces la domeniu sau parametrii specificați sunt incorecți',
    'module_ldap_ValidateServerNameIsEmpty' => 'Adresa controlerului de domeniu nu este completată',
    'module_ldap_ValidateServerPortIsEmpty' => 'Portul controlerului de domeniu nu este populat',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Conectarea pentru utilizatorul de domeniu nu este completată',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Parola nu a fost completată pentru utilizatorul de domeniu',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Rădăcina domeniului nu este completată',
    'module_ldap_LdapManualSyncHeader' => 'Sincronizare manuală',
    'module_ldap_LdapManualSyncManual' => 'Când faceți clic pe butonul, o parte din 20 de utilizatori vor fi sincronizate între controlerul de domeniu specificat și MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Sincronizați datele',
    'module_ldap_usersSyncResult' => 'stare',
    'module_ldap_userHadChangesOnTheSide' => 'Actualizat',
    'module_ldap_OnPBXSide' => 'în interiorul MikoPBX',
    'module_ldap_OnDomainSide' => 'în domeniu',
    'module_ldap_SKIPPED' => 'sarit',
    'module_ldap_UPDATED' => 'prelucrate',
    'module_ldap_EnableAutoSync' => 'Activați sincronizarea programată',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Atributul cu numele de utilizator din domeniu nu este completat',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Atributul cu telefonul mobil al utilizatorului din domeniu nu este completat',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Atributul cu numărul de telefon intern al utilizatorului din domeniu nu este completat',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Atributul cu e-mailul utilizatorului din domeniu nu este completat',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Atributul cu atributul activității utilizatorului în domeniu nu este completat',
    'module_ldap_TableColumnAutoSync' => 'Auto-sincronizare',
    'module_ldap_ConflictTime' => 'Data',
    'module_ldap_ConflictsTabHeader' => 'Conflicte de sincronizare',
    'module_ldap_NoAnyConflicts' => 'Nu s-au găsit probleme',
    'module_ldap_deleteCurrentConflict' => 'Ștergeți intrarea curentă, nu modifică datele nici în PBX, nici pe partea serverului LDAP/AD',
    'module_ldap_ConflictUserData' => 'Date salvate',
    'module_ldap_ConflictSide' => 'Cine a refuzat',
    'module_ldap_ConflictErrorMessages' => 'Motivul refuzului',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
    'module_ldap_CONFLICT' => 'conflict',
    'module_ldap_SyncTabHeader' => 'Sincronizare și conflicte',
    'module_ldap_TabAttributes' => 'Câmpuri de sincronizare',
    'module_ldap_DeleteAllConflicts' => 'Ștergeți toate conflictele',
];
