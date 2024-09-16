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
    'repModuleLdapSync' => 'Synkronointi LDAP/AD:n kanssa - %repesent%',
    'mo_ModuleModuleLdapSync' => 'Synkronointi LDAP/AD:n kanssa',
    'BreadcrumbModuleLdapSync' => 'Synkronointi LDAP/AD:n kanssa',
    'SubHeaderModuleLdapSync' => 'Moduulin avulla voit ladata käyttäjiä verkkotunnuksesta',
    'module_ldap_LdapServerConnectionHeader' => 'Yhteysasetukset toimialueen ohjaimeen',
    'module_ldap_EnableAutoSync' => 'Ota ajoitettu synkronointi käyttöön',
    'module_ldap_AddServer' => 'Lisää palvelin',
    'module_ldap_AddServerShort' => 'Lisätä',
    'module_ldap_NoAnyServers' => 'Palvelimia ei ole määritetty',
    'module_ldap_TableColumnAutoSync' => 'Automaattinen synkronointi',
    'module_ldap_TableColumnServerName' => 'Palvelimen osoite',
    'module_ldap_OrganizationalUnit' => 'Alajako',
    'module_ldap_BaseDN' => 'Verkkotunnuksen juuri',
    'module_ldap_ldapType' => 'Palvelimen tyyppi',
    'module_ldap_LdapServerName' => 'Verkkotunnuksen ohjaimen osoite',
    'module_ldap_LdapServerPort' => 'Portti',
    'module_ldap_LdapAdminLogin' => 'Käyttäjätunnus ja salasana luku- ja kirjoitusoikeuksilla verkkotunnuksessa',
    'module_ldap_LdapBaseDN' => 'Verkkotunnuksen juuri',
    'module_ldap_LdapPassword' => 'Salasana',
    'module_ldap_LdapAttributesHeader' => 'Verkkotunnuksen attribuutit MikoPBX:n tietojen täsmäyttämiseksi',
    'module_ldap_UserExtensionAttribute' => 'käyttäjälaajennuksen numero',
    'module_ldap_UserMobileAttribute' => 'matkapuhelin',
    'module_ldap_UserEmailAttribute' => 'sähköpostiosoite',
    'module_ldap_UserNameAttribute' => 'käyttäjän etu- ja sukunimi',
    'module_ldap_UserAccountControl' => 'attribuutti, johon käyttäjän lukituksen tila on tallennettu',
    'module_ldap_UserAvatarAttribute' => 'attribuutti valokuvalla',
    'module_ldap_UpdateAttributes' => 'Päivitä verkkotunnuksen puhelinnumerot, kun ne muuttuvat MikoPBX:ssä (vaatii kirjoitusoikeudet)',
    'module_ldap_LdapOrganizationalUnit' => 'Alajako',
    'module_ldap_LdapUserFilter' => 'Lisäkäyttäjäsuodatin',
    'module_ldap_LdapCheckGetListHeader' => 'Testaa LDAP-käyttäjien luettelon saaminen',
    'module_ldap_LdapCheckGetUsersList' => 'Määritettyjen pääsyparametrien ja suodattimien avulla suoritamme pyynnön LDAP/AD:lle ja vastaanotamme 20 käyttäjän osan synkronoitavaksi',
    'module_ldap_LdapGetUsersButton' => 'Suorita pyyntö',
    'module_ldap_user_not_found' => 'Käyttäjällä ei ole pääsyä verkkotunnukseen tai parametrit ovat virheellisiä.',
    'module_ldap_ValidateServerNameIsEmpty' => 'Verkkotunnuksen ohjaimen osoite on tyhjä',
    'module_ldap_ValidateServerPortIsEmpty' => 'Toimialueen ohjaimen portti ei ole täynnä',
    'module_ldap_ValidateAdministrativeLoginIsEmpty' => 'Verkkotunnuksen käyttäjän kirjautumistunnusta ei ole täytetty',
    'module_ldap_ValidateAdministrativePasswordIsEmpty' => 'Verkkotunnuksen käyttäjän salasanaa ei ole täytetty',
    'module_ldap_ValidateBaseDNIsEmpty' => 'Verkkotunnuksen juurta ei ole täytetty',
    'module_ldap_ValidateUserNameAttributeIsEmpty' => 'Attribuuttia verkkotunnuksen käyttäjänimellä ei ole täytetty',
    'module_ldap_ValidateUserMobileAttributeIsEmpty' => 'Attribuuttia käyttäjän matkapuhelimella verkkotunnuksessa ei ole täytetty',
    'module_ldap_ValidateUserExtensionAttributeIsEmpty' => 'Attribuuttia, jossa on käyttäjän sisäinen puhelinnumero verkkotunnuksessa, ei ole täytetty',
    'module_ldap_ValidateUserEmailAttributeIsEmpty' => 'Attribuuttia, jossa on käyttäjän sähköpostiosoite verkkotunnuksessa, ei ole täytetty',
    'module_ldap_ValidateUserAccountControlIsEmpty' => 'Attribuuttia, joka sisältää käyttäjän aktiviteettiattribuutin verkkotunnuksessa, ei ole täytetty',
    'module_ldap_LdapManualSyncHeader' => 'Manuaalinen synkronointi',
    'module_ldap_LdapManualSyncManual' => 'Kun napsautat painiketta, osa 20 käyttäjästä synkronoidaan määritetyn toimialueen ohjaimen ja MikoPBX:n välillä.',
    'module_ldap_LdapManualSyncButton' => 'Synkronoi tiedot',
    'module_ldap_usersSyncResult' => 'Status',
    'module_ldap_userHadChangesOnTheSide' => 'Päivitetty',
    'module_ldap_OnPBXSide' => 'MikoPBX:n sisällä',
    'module_ldap_OnDomainSide' => 'verkkotunnuksessa',
    'module_ldap_SKIPPED' => 'jäi väliin',
    'module_ldap_UPDATED' => 'käsitelty',
    'module_ldap_TestsTabHeader' => 'Testaus',
    'module_ldap_ConflictsTabHeader' => 'Synkronointiristiriidat',
    'module_ldap_NoAnyConflicts' => 'Ei ongelmia löytynyt',
    'module_ldap_ConflictErrorMessages' => 'Syy kieltäytymiseen',
    'module_ldap_PBX_UPDATE_CONFLICT' => 'PBX',
    'module_ldap_deleteCurrentConflict' => 'Poista nykyinen merkintä, ei muuta tietoja PBX:ssä tai LDAP/AD-palvelimen puolella',
    'module_ldap_ConflictTime' => 'Päivämäärä',
    'module_ldap_ConflictUserData' => 'Tallennetut tiedot',
    'module_ldap_ConflictSide' => 'Kuka kieltäytyi',
    'module_ldap_LDAP_UPDATE_CONFLICT' => 'LDAP/AD',
];
