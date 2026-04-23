<?php
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

namespace Modules\ModuleLdapSync\Lib;

use LdapRecord\Container;
use MikoPBX\Common\Handlers\CriticalErrorsHandler;
use MikoPBX\Common\Providers\ManagedCacheProvider;
use Phalcon\Di\Injectable;


include_once __DIR__.'/../vendor/autoload.php';

/**
 * Class LdapSyncConnector
 * Handles synchronization and interaction with LDAP server.
 */
class LdapSyncConnector extends Injectable
{
    /**
     * The name or ip of the LDAP server.
     *
     * @var string
     */
    private string $serverName;


    /**
     * The port of the LDAP server.
     *
     * @var string
     */
    private string $serverPort;

    /**
     * TLS transport mode.
     *
     *  - 'none'     : plain LDAP (port 389)
     *  - 'starttls' : plain LDAP upgraded via STARTTLS
     *  - 'ldaps'    : implicit TLS from connect (port 636)
     *
     * @var string
     */
    private string $tlsMode;

    /**
     * Whether to enforce server certificate validation.
     *
     * @var bool
     */
    private bool $verifyCert;

    /**
     * Absolute path to a CA bundle file used when $verifyCert is true.
     * Empty string when no custom CA is provided.
     *
     * @var string
     */
    private string $caBundlePath = '';

    /**
     * The base DN (Distinguished Name) for LDAP operations.
     *
     * @var string
     */
    private string $baseDN;

    /**
     * The administrative login for LDAP connection.
     *
     * @var string
     */
    private string $administrativeLogin;

    /**
     * The administrative password for LDAP connection.
     *
     * @var string
     */
    private string $administrativePassword;


    /**
     * The organizational unit for LDAP operations.
     *
     * @var string
     */
    private string $organizationalUnit;

    /**
     * The user filter for LDAP operations.
     *
     * @var string
     */
    private string $userFilter;

    /**
     * The user attributes to synchronize.
     *
     * @var array
     */
    public array $userAttributes=[];

    /**
     * The class of the user model based on LDAP type.
     *
     * @var string
     */
    private string $userModelClass;

    // Ldap connection
    private \LdapRecord\Connection $connection;

    // Cache provider
    private $redis;

    private string $redisKeyPrefix;

    /**
     * LdapConnectionManager constructor.
     *
     * @param array $ldapCredentials The LDAP credentials.
     */
    public function __construct(array $ldapCredentials)
    {
        // Initialize properties from provided LDAP credentials
        $this->serverName = $ldapCredentials['serverName'];
        $this->serverPort = $ldapCredentials['serverPort'];
        $this->baseDN = $ldapCredentials['baseDN'];
        $this->administrativeLogin = $ldapCredentials['administrativeLogin'];
        $this->administrativePassword = $ldapCredentials['administrativePassword'];
        $this->organizationalUnit = $ldapCredentials['organizationalUnit'];
        $this->userFilter = $ldapCredentials['userFilter'];

        // Parse and filter user attributes
        $this->userAttributes = array_filter(json_decode($ldapCredentials['attributes'], true));

        // Set user model class based on LDAP type
        $this->userModelClass = $this->getUserModelClass($ldapCredentials['ldapType']);

        $tlsMode = $ldapCredentials['tlsMode'] ?? 'none';
        $this->tlsMode = in_array($tlsMode, ['none', 'starttls', 'ldaps'], true) ? $tlsMode : 'none';
        // HTML checkboxes submit "on" when checked; normalise that and any other
        // truthy form values so test-bind and save paths agree on meaning.
        $verifyRaw = strtolower((string)($ldapCredentials['verifyCert'] ?? '0'));
        $this->verifyCert = in_array($verifyRaw, ['1', 'on', 'true', 'yes'], true);

        // Build the connection options incl. optional CA bundle.
        $tlsOptions = $this->buildTlsOptions($ldapCredentials['caCertificate'] ?? null);

        // libldap freezes its TLS context the moment ldap_connect() is called
        // for ldaps://. If REQUIRE_CERT / CACERTFILE are set afterwards on the
        // connection resource (which is what LdapRecord does via setOptions),
        // they apply only after an explicit LDAP_OPT_X_TLS_NEWCTX rebuild —
        // and even then not on every libldap build. To guarantee the chosen
        // verification policy actually takes effect we set these options as
        // PROCESS-WIDE defaults BEFORE the LdapRecord connection is created.
        // They are the only state that libldap reads while building the TLS
        // context for ldaps://, so global is the only place that works
        // uniformly across OpenLDAP versions.
        foreach ($tlsOptions as $opt => $val) {
            @ldap_set_option(null, $opt, $val);
        }

        // On builds where PHP exposes LDAP_OPT_X_TLS_NEWCTX (libldap 2.4+),
        // also queue a per-connection TLS context rebuild after LdapRecord
        // re-applies the same options on the resource. Harmless when the
        // constant is absent — we still rely on the process-wide defaults
        // set above, which libldap honours uniformly across versions.
        if (defined('LDAP_OPT_X_TLS_NEWCTX')) {
            $tlsOptions[constant('LDAP_OPT_X_TLS_NEWCTX')] = 0;
        }

        $connectionConfig = [
            'hosts'    => [$this->serverName],
            'port'     => $this->serverPort,
            'base_dn'  => $this->baseDN,
            'username' => $this->administrativeLogin,
            'password' => $this->administrativePassword,
            'timeout'  => 15,
            'use_tls'  => $this->tlsMode === 'starttls',
            'use_ssl'  => $this->tlsMode === 'ldaps',
            'options'  => $tlsOptions,
        ];

        // Create a new LDAP connection
        $this->connection = new \LdapRecord\Connection($connectionConfig);

        $this->redis = $this->getDI()->getShared(ManagedCacheProvider::SERVICE_NAME);
        $this->redisKeyPrefix = 'modules:ldap-sync:'.md5($this->serverName.$ldapCredentials['attributes']);
    }

    /**
     * Cleans up the CA bundle file written into the temp dir for this session
     * and resets the process-wide CACERTFILE pointer so a later connector in
     * the same PHP-FPM / worker process can't inherit a dangling path to our
     * already-unlinked bundle.
     */
    public function __destruct()
    {
        if ($this->caBundlePath === '') {
            return;
        }
        if (is_file($this->caBundlePath)) {
            @unlink($this->caBundlePath);
        }
        // Repoint libldap at the system trust store (or empty to force its
        // compiled default) so nothing in this process keeps looking for the
        // temp file we just removed.
        @ldap_set_option(null, LDAP_OPT_X_TLS_CACERTFILE, self::systemDefaultCaFile());
    }

    /**
     * Build the `options` array passed to LdapRecord\Connection.
     * Sets `LDAP_OPT_X_TLS_REQUIRE_CERT` based on the verifyCert flag and
     * always writes `LDAP_OPT_X_TLS_CACERTFILE` — either to the freshly
     * materialised custom bundle or to the system trust store. Explicitly
     * writing the option every time prevents a stale per-process CACERTFILE
     * (set by a previous connector that has since been destroyed) from
     * leaking into a later connection's TLS context.
     *
     * @param string|null $caCertificate PEM content (possibly concatenated).
     * @return array<int,int|string>
     */
    private function buildTlsOptions(?string $caCertificate): array
    {
        // LDAP_OPT_X_TLS_HARD enforces strict validation; LDAP_OPT_X_TLS_ALLOW
        // accepts any cert (historical behaviour; documented as insecure in UI).
        $options = [
            LDAP_OPT_X_TLS_REQUIRE_CERT => $this->verifyCert
                ? LDAP_OPT_X_TLS_HARD
                : LDAP_OPT_X_TLS_ALLOW,
        ];

        $caFile = self::systemDefaultCaFile();
        if ($this->verifyCert && !empty($caCertificate)) {
            $path = $this->materializeCaBundle($caCertificate);
            if ($path !== '') {
                $this->caBundlePath = $path;
                $caFile = $path;
            }
        }
        // Always set CACERTFILE — either the custom bundle for this session or
        // a detected system bundle — so no previous connector's unlinked tmp
        // path stays pinned in the process-wide libldap defaults.
        $options[LDAP_OPT_X_TLS_CACERTFILE] = $caFile;

        return $options;
    }

    /**
     * Probes a short list of well-known CA bundle locations and returns the
     * first readable one. The result is cached for the lifetime of the
     * process. Returns an empty string when no bundle is found — libldap
     * will then fall back to its compiled-in default.
     *
     * @return string
     */
    private static function systemDefaultCaFile(): string
    {
        static $cached = null;
        if ($cached !== null) {
            return $cached;
        }
        $candidates = [
            '/etc/ssl/certs/ca-certificates.crt',   // Debian / Alpine / MikoPBX
            '/etc/pki/tls/certs/ca-bundle.crt',     // RHEL / CentOS
            '/etc/ssl/cert.pem',                    // macOS / BSD
        ];
        foreach ($candidates as $path) {
            if (@is_readable($path)) {
                return $cached = $path;
            }
        }
        return $cached = '';
    }

    /**
     * Writes the PEM bundle into a process-private temp file (mode 0600) so
     * that libldap can load it. The file is removed in __destruct().
     *
     * @param string $pem
     * @return string Absolute path, or '' on failure.
     */
    private function materializeCaBundle(string $pem): string
    {
        $tmpDir = sys_get_temp_dir();
        $path = tempnam($tmpDir, 'ldap-sync-ca-');
        if ($path === false) {
            return '';
        }
        if (file_put_contents($path, $pem) === false) {
            @unlink($path);
            return '';
        }
        @chmod($path, 0600);
        return $path;
    }

    /**
     * Get the class of the user model based on LDAP type.
     *
     * @param string $ldapType The LDAP type.
     * @return string The user model class.
     */
    private function getUserModelClass(string $ldapType): string
    {
        switch ($ldapType) {
            case 'OpenLDAP':
                return \LdapRecord\Models\OpenLDAP\User::class;
            case 'DirectoryServer':
                return \LdapRecord\Models\DirectoryServer\User::class;
            case 'FreeIPA':
                return \LdapRecord\Models\FreeIPA\User::class;
            default:
                return \LdapRecord\Models\ActiveDirectory\User::class;
        }
    }

    /**
     * Lightweight connectivity check. Opens the connection, performs the bind
     * using the configured administrative credentials and immediately returns.
     * Intended for a "Test connection" button — no queries, no pagination.
     *
     * @return AnswerStructure With success=true on successful bind, otherwise
     *                         success=false and a human-readable error message.
     */
    public function testBind(): AnswerStructure
    {
        $res = new AnswerStructure();
        try {
            $this->connection->connect();
            $res->success = true;
            $res->messages['info'][] = 'LDAP bind successful on ' . $this->serverName;
        } catch (\LdapRecord\Auth\BindException $e) {
            $detail = $e->getDetailedError();
            $message = $e->getMessage();
            if ($detail !== null) {
                $message .= ' — ' . $detail->getDiagnosticMessage();
            }
            $res->success = false;
            $res->messages['error'][] = $message;
        } catch (\Throwable $e) {
            CriticalErrorsHandler::handleExceptionWithSyslog($e);
            $res->success = false;
            $res->messages['error'][] = $e->getMessage();
        }
        return $res;
    }

    /**
     * Get available users list via LDAP.
     *
     * @return AnswerStructure List of users in the data attribute.
     */
    public function getUsersList(): AnswerStructure
    {
        $res = new AnswerStructure();
        $listOfAvailableUsers = [];
        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            // Query LDAP for the user
            $query = call_user_func([$this->userModelClass, 'query']);

            if ($this->userFilter!==''){
                $query->rawFilter($this->userFilter);
            }
            if ($this->organizationalUnit!==''){
                $query->in($this->organizationalUnit);
            }
            $requestAttributes = array_values($this->userAttributes);

            $page = (int) $this->redis->getAdapter()->incr($this->redisKeyPrefix . '-users-list:page');
            $itemsPerPage = 20;

            if (is_a($this->userModelClass,\LdapRecord\Models\ActiveDirectory\User::class)){
                $items = $query->select($requestAttributes)->slice($page, $itemsPerPage)->items();
            } else {
                $items = $query->select($requestAttributes)->get();
            }


            // If the server returned more records than requested (non-AD path
            // uses a single ->get() without pagination), slice the collection
            // client-side. We keep Model objects throughout — converting to
            // arrays here would strip the LdapRecord metadata methods we rely
            // on below (hasAttribute, getFirstAttribute, getConvertedGuid,
            // isDisabled).
            if ($items->count() > $itemsPerPage) {
                $offset = ($page - 1) * $itemsPerPage;
                $paginatedUsers = $items->slice($offset, $itemsPerPage);
            } else {
                $paginatedUsers = $items;
            }

            // Check if we've reached the last page
            if (count($paginatedUsers) < $itemsPerPage) {
                // Delete the Redis key if we're at the last page
                $this->redis->getAdapter()->del($this->redisKeyPrefix . '-users-list:page');
            }

            foreach ($paginatedUsers as $user) {
                $record = [];
                foreach ($requestAttributes as $attribute){
                    if ($user->hasAttribute($attribute)){
                        if ($attribute===$this->userAttributes[Constants::USER_AVATAR_ATTR]) {
                            $binData = $user->getFirstAttribute($attribute);
                            if (self::isValidImageBinary($binData)) {
                                $record[$attribute] = 'data:image/jpeg;base64,'.base64_encode($binData);
                            }
                        } elseIf (
                                !is_a($user, \LdapRecord\Models\ActiveDirectory\User::class)
                                &&
                                $attribute===$this->userAttributes[Constants::USER_ACCOUNT_CONTROL_ATTR]
                                ) {
                            $record[Constants::USER_DISABLED] = true;
                        } else {
                            $record[$attribute]= $user->getFirstAttribute($attribute);
                        }
                    }
                }
                $record[Constants::USER_GUID_ATTR] = $user->getConvertedGuid();
                if (is_a($user, \LdapRecord\Models\ActiveDirectory\User::class)){
                    $record[Constants::USER_DISABLED] = $user->isDisabled();
                }

                uksort($record, function($a, $b){
                    return strcmp($a, $this->userAttributes[Constants::USER_NAME_ATTR]);
                });
                if (!empty($record)){
                    $listOfAvailableUsers[] = $record;
                }
            }
            // Sort the array based on the name value
            usort($listOfAvailableUsers, function($a, $b){
                return strcmp($a[$this->userAttributes[Constants::USER_NAME_ATTR]] , $b[$this->userAttributes[Constants::USER_NAME_ATTR]]);
            });

            $res->data = $listOfAvailableUsers;
            $res->success = true;
        } catch (\LdapRecord\Auth\BindException $e) {
            $res->messages['error'][] = $e->getMessage().' ('.$e->getCode().')';
            $res->success = false;
        } catch (\Throwable $e) {
            CriticalErrorsHandler::handleExceptionWithSyslog($e);
            $res->messages['error'][] = $e->getMessage();
            $res->success = false;
        }

        return $res;
    }

    /**
     * Update user data in the LDAP domain.
     *
     * @param string $userGuid The GUID of the user to update.
     * @param array $newUserData The new user data to update.
     * @return AnswerStructure The response structure indicating success or failure.
     */
    public function updateDomainUser(string $userGuid, array $newUserData):AnswerStructure
    {
        $res = new AnswerStructure();
        $res->data[Constants::USER_SYNC_RESULT]=Constants::SYNC_RESULT_SKIPPED;

        try {
            $this->connection->connect();
            Container::addConnection($this->connection);

            $updatableAttributes = [
                Constants::USER_EXTENSION_ATTR,
                Constants::USER_MOBILE_ATTR,
                Constants::USER_EMAIL_ATTR,
                Constants::USER_AVATAR_ATTR,
                Constants::USER_PASSWORD_ATTR,
            ];

            // Query LDAP for the user
            $user = call_user_func([$this->userModelClass, 'findByGuid'], $userGuid);
            if ($user===null){
                $res->messages['error'][] ='User '.$newUserData[Constants::USER_NAME_ATTR].' with guid: '.$userGuid.' did not found on server '.$this->serverName;
                $res->success = false;
                return $res;
            }
            foreach ($newUserData as $attribute=>$value){
                if (!empty($value)
                    AND isset($this->userAttributes[$attribute])
                    AND in_array($attribute, $updatableAttributes)){
                    if ($attribute===Constants::USER_AVATAR_ATTR){
                        $base64Image = $value;
                        $base64Data = substr($base64Image, strpos($base64Image, ',') + 1);
                        $binaryData = base64_decode($base64Data);
                        $user->{$this->userAttributes[$attribute]} = $binaryData;
                    } elseif ($attribute===Constants::USER_MOBILE_ATTR){
                        if (preg_replace('/\D/', '', $user->getFirstAttribute($this->userAttributes[$attribute]))!==$value) {
                            $user->{$this->userAttributes[$attribute]} = $value;
                        }
                    } else {
                        $user->{$this->userAttributes[$attribute]}=$value;
                    }
                }
            }
            $user->save();
            $res->success = true;
            $res->messages['info'][]= 'User '.$newUserData[Constants::USER_NAME_ATTR].' was updated on server '.$this->serverName;
            $res->data[Constants::USER_SYNC_RESULT]=Constants::SYNC_RESULT_UPDATED;
        } catch (\LdapRecord\Exceptions\InsufficientAccessException $e) {
            $res->messages['info'][]= 'User '.$newUserData[Constants::USER_NAME_ATTR].' was not updated on server '.$this->serverName.' because of insufficient access rights';
            $res->success = true;
        } catch (\LdapRecord\LdapRecordException $e) {
            $res->messages['error'][]= $e->getDetailedError()->getDiagnosticMessage();
            $res->success = false;
        } catch (\Throwable $e) {
            $res->messages['error'][] = CriticalErrorsHandler::handleExceptionWithSyslog($e);
            $res->success = false;
        }

        return $res;
    }

    /**
     * Validate that binary data from LDAP is a real image
     *
     * Checks magic bytes and minimum size to prevent saving corrupt
     * or garbage data from LDAP jpegPhoto/thumbnailPhoto attributes.
     *
     * @param mixed $data Raw binary data from LDAP attribute
     * @return bool True if data looks like a valid image
     */
    private static function isValidImageBinary(mixed $data): bool
    {
        if (!is_string($data) || strlen($data) < 1024) {
            return false;
        }

        $signatures = [
            "\xFF\xD8\xFF",        // JPEG
            "\x89PNG\r\n\x1A\n",  // PNG
            "GIF87a",              // GIF
            "GIF89a",              // GIF
            "RIFF",                // WEBP
        ];

        foreach ($signatures as $signature) {
            if (str_starts_with($data, $signature)) {
                return true;
            }
        }

        return false;
    }

}