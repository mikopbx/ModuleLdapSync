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
    'repModuleLdapSync' => 'Συγχρονισμός με LDAP/AD - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Συγχρονισμός με LDAP/AD',
    'BreadcrumbModuleLdapSync' => 'Συγχρονισμός με LDAP/AD',
    'SubHeaderModuleLdapSync' => 'Η ενότητα σάς επιτρέπει να φορτώνετε χρήστες από έναν τομέα',
    'module_ldap_LdapServerConnectionHeader' => 'Ρυθμίσεις σύνδεσης ελεγκτή τομέα',
    'module_ldap_AddServer' => 'Προσθήκη διακομιστή',
    'module_ldap_AddServerShort' => 'Προσθήκη',
    'module_ldap_NoAnyServers' => 'Δεν έχουν διαμορφωθεί διακομιστές',
    'module_ldap_TableColumnServerName' => 'Διεύθυνση διακομιστή',
    'module_ldap_OrganizationalUnit' => 'Υποδιαίρεση',
    'module_ldap_BaseDN' => 'Ρίζα τομέα',
    'module_ldap_ldapType' => 'Τύπος διακομιστή',
    'module_ldap_LdapServerName' => 'Διεύθυνση ελεγκτή τομέα',
    'module_ldap_LdapServerPort' => 'Λιμάνι',
    'module_ldap_LdapAdminLogin' => 'Όνομα χρήστη και κωδικός πρόσβασης με πρόσβαση ανάγνωσης/εγγραφής στον τομέα',
    'module_ldap_LdapBaseDN' => 'Ρίζα τομέα',
    'module_ldap_LdapPassword' => 'Κωδικός πρόσβασης',
    'module_ldap_LdapAttributesHeader' => 'Χαρακτηριστικά στον τομέα για αντιστοίχιση με δεδομένα στο MikoPBX',
    'module_ldap_UserExtensionAttribute' => 'αριθμός επέκτασης χρήστη',
    'module_ldap_UserMobileAttribute' => 'κινητό τηλέφωνο',
    'module_ldap_UserEmailAttribute' => 'Διεύθυνση ηλεκτρονικού ταχυδρομείου',
    'module_ldap_UserNameAttribute' => 'όνομα και επώνυμο χρήστη',
    'module_ldap_UserAccountControl' => 'χαρακτηριστικό όπου είναι αποθηκευμένη η κατάσταση κλειδώματος του χρήστη',
    'module_ldap_UserAvatarAttribute' => 'χαρακτηριστικό φωτογραφίας',
    'module_ldap_UpdateAttributes' => 'Ενημέρωση αριθμών τηλεφώνου στον τομέα όταν αλλάζουν στο MikoPBX (απαιτεί δικαιώματα εγγραφής)',
    'module_ldap_LdapOrganizationalUnit' => 'Υποδιαίρεση',
    'module_ldap_LdapUserFilter' => 'Πρόσθετο φίλτρο χρήστη',
    'module_ldap_LdapCheckGetListHeader' => 'Δοκιμή για λήψη λίστας χρηστών LDAP',
    'module_ldap_LdapCheckGetUsersList' => 'Χρησιμοποιώντας τις καθορισμένες παραμέτρους πρόσβασης και τα φίλτρα, θα εκτελέσουμε ένα αίτημα στο LDAP/AD και θα λάβουμε ένα τμήμα 20 χρηστών για συγχρονισμό',
    'module_ldap_LdapGetUsersButton' => 'Εκτέλεση αιτήματος',
    'module_ldap_user_not_found' => 'Ο χρήστης δεν έχει πρόσβαση στον τομέα ή οι καθορισμένες παράμετροι είναι εσφαλμένες',
    'module_ldap_ValidateServerNameIsEmpty' => 'Η διεύθυνση ελεγκτή τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateServerPortIsEmpty' => 'Η θύρα ελεγκτή τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Η σύνδεση για χρήστη τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Ο κωδικός πρόσβασης δεν έχει συμπληρωθεί για τον χρήστη τομέα',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Η ρίζα τομέα δεν έχει συμπληρωθεί',
    'module_ldap_LdapManualSyncHeader' => 'Χειροκίνητος συγχρονισμός',
    'module_ldap_LdapManualSyncManual' => 'Όταν κάνετε κλικ στο κουμπί, ένα τμήμα 20 χρηστών θα συγχρονιστεί μεταξύ του καθορισμένου ελεγκτή τομέα και του MikoPBX',
    'module_ldap_LdapManualSyncButton' => 'Συγχρονισμός δεδομένων',
    'module_ldap_usersSyncResult' => 'Κατάσταση',
    'module_ldap_userHadChangesOnTheSide' => 'ΕΠΙΚΑΙΡΟΠΟΙΗΜΕΝΟ',
    'module_ldap_OnPBXSide' => 'μέσα στο MikoPBX',
    'module_ldap_OnDomainSide' => 'στον τομέα',
    'module_ldap_SKIPPED' => 'παρακάμπτεται',
    'module_ldap_UPDATED' => 'επεξεργασμένα',
    'module_ldap_EnableAutoSync' => 'Ενεργοποίηση προγραμματισμένου συγχρονισμού',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Το χαρακτηριστικό με το όνομα χρήστη στον τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Το χαρακτηριστικό με το κινητό τηλέφωνο του χρήστη στον τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Το χαρακτηριστικό με τον εσωτερικό αριθμό τηλεφώνου του χρήστη στον τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Το χαρακτηριστικό με το e-mail του χρήστη στον τομέα δεν έχει συμπληρωθεί',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Το χαρακτηριστικό με το χαρακτηριστικό της δραστηριότητας χρήστη στον τομέα δεν έχει συμπληρωθεί',
    'module_ldap_TableColumnAutoSync' => 'Αυτόματος συγχρονισμός',
    'module_ldap_ConflictsTabHeader' => 'Συγκρούσεις συγχρονισμού',
    'module_ldap_NoAnyConflicts' => 'Δεν βρέθηκαν προβλήματα',
    'module_ldap_deleteCurrentConflict' => 'Διαγράψτε την τρέχουσα καταχώρηση, δεν αλλάζει τα δεδομένα ούτε στο PBX ούτε στην πλευρά του διακομιστή LDAP/AD',
    'module_ldap_ConflictTime' => 'Ημερομηνία',
    'module_ldap_ConflictUserData' => 'Αποθηκευμένα δεδομένα',
    'module_ldap_ConflictSide' => 'Ο οποίος αρνήθηκε',
    'module_ldap_ConflictErrorMessages' => 'Λόγος άρνησης',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'ΛΔΑΠ/ΑΔ',
    'module_ldap_CONFLICT' => 'σύγκρουση',
    'module_ldap_SyncTabHeader' => 'Συγχρονισμός και συγκρούσεις',
    'module_ldap_TabAttributes' => 'Πεδία συγχρονισμού',
    'module_ldap_DeleteAllConflicts' => 'Εκκαθάριση όλων των διενέξεων',
    'module_ldap_UserPasswordAttribute' => 'Κωδικός πρόσβασης SIP',
    'module_ldap_UseTLS' => 'TLS/SSL',
    'module_ldap_UpdateAttributesMessage' => 'Όταν αλλάξουν τα δεδομένα στο MikoPBX, τα ακόλουθα θα ενημερωθούν στον τομέα: εσωτερικός αριθμός, αριθμός κινητού τηλεφώνου, email, avatar, κωδικός πρόσβασης SIP',
    'module_ldap_UserName' => 'Όνομα χρήστη',
    'module_ldap_UserNumber' => 'Αριθμός επέκτασης',
    'module_ldap_findExtension' => 'Βρείτε στη λίστα των χρηστών',
    'module_ldap_DeletedUsersHeader' => 'Εργαζόμενοι εξ αποστάσεως σε LDAP/AD',
    'module_ldap_DeletedUsersEmpty' => 'Όχι απομακρυσμένοι υπάλληλοι',
];
