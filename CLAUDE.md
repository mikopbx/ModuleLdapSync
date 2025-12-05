# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ModuleLdapSync is a MikoPBX extension module that synchronizes employees from LDAP/Active Directory servers into MikoPBX. It creates user accounts automatically and supports bidirectional sync - extension details can be synchronized back to the domain.

## Build & Development Commands

### PHP Syntax Check
```bash
php -l <file.php>
```

### JavaScript Compilation
```bash
/Users/nb/PhpstormProjects/mikopbx/MikoPBXUtils/node_modules/.bin/babel "public/assets/js/src/<file>.js" --out-dir "public/assets/js/" --source-maps inline --presets airbnb
```

### Code Quality
```bash
phpstan analyse <file.php>
```

## Architecture

### Directory Structure
- `App/` - Phalcon MVC components (Controllers, Forms)
- `Lib/` - Core business logic (LDAP sync, connectors, workers)
- `Models/` - Database models (Phalcon ORM)
- `Messages/` - i18n translation files
- `public/assets/` - Frontend assets (JS source in `js/src/`, compiled in `js/`)
- `Setup/` - Module installation/uninstallation logic

### Key Components

**LdapSyncMain** (`Lib/LdapSyncMain.php`)
- Main orchestrator for LDAP synchronization
- `syncAllUsers()` - syncs all enabled LDAP servers
- `syncUsersPerServer()` - syncs single server, returns AnswerStructure
- `updateUserData()` - bidirectional sync logic using hash comparison
- Uses MikoPBX REST API for user CRUD operations

**LdapSyncConnector** (`Lib/LdapSyncConnector.php`)
- LDAP connection management using `ldaprecord/ldaprecord` library
- Supports ActiveDirectory, OpenLDAP, DirectoryServer, FreeIPA
- Handles user queries with pagination via Redis cache
- `getUsersList()` - fetches users from LDAP with attribute mapping
- `updateDomainUser()` - writes changes back to LDAP

**WorkerLdapSync** (`Lib/Workers/WorkerLdapSync.php`)
- Background worker for periodic sync (hourly by default)
- Uses Redis cache for sync frequency management
- Increases frequency to 5 minutes when changes detected

**Constants** (`Lib/Constants.php`)
- User attribute mappings (name, mobile, extension, email, avatar, password)
- Sync result states (UPDATED, SKIPPED, CONFLICT)
- Conflict tracking constants

### Data Flow
1. Worker triggers `LdapSyncMain::syncAllUsers()`
2. For each enabled server, `LdapSyncConnector` fetches LDAP users
3. Hash comparison determines which side changed (domain vs PBX)
4. Updates applied via MikoPBX REST API or `LdapSyncConnector::updateDomainUser()`
5. Conflicts recorded in `Conflicts` model

### Models
- `LdapServers` - LDAP server configurations (host, port, credentials, attribute mappings)
- `ADUsers` - Tracks synced users with domain/local hashes for change detection
- `Conflicts` - Records sync conflicts for manual resolution

### REST API Endpoints (via ModuleLdapSyncController + ApiController)
- `get-available-ldap-users` - Test LDAP connection and fetch users
- `sync-ldap-users` - Trigger manual sync
- `get-server-conflicts` / `delete-server-conflict(s)` - Conflict management
- `get-disabled-ldap-users` - List disabled domain users in PBX

### Frontend
- `module-ldap-sync-modify.js` - Main config form (server settings, attribute mapping, manual sync)
- `module-ldap-sync-index.js` - Server list management
- Uses Semantic UI components and MikoPBX Form/PbxApi utilities

## CI/CD

GitHub Actions workflow (`.github/workflows/build.yml`) uses shared MikoPBX workflow for building and publishing to MikoPBX marketplace.
