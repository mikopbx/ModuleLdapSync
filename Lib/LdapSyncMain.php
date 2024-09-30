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

use MikoPBX\Common\Models\Extensions;
use MikoPBX\Common\Models\Sip;
use MikoPBX\Common\Models\Users;
use MikoPBX\Common\Providers\PBXCoreRESTClientProvider;
use MikoPBX\Modules\Logger;
use MikoPBX\PBXCoreREST\Lib\Extensions\DataStructure;
use Modules\ModuleLdapSync\Lib\Workers\WorkerLdapSync;
use Modules\ModuleLdapSync\Models\ADUsers;
use Modules\ModuleLdapSync\Models\LdapServers;
use Phalcon\Di\Injectable;

/**
 * Class for synchronizing user data from LDAP servers.
 */
class LdapSyncMain extends Injectable
{
    /**
     * Synchronizes all LDAP users across enabled servers.
     *
     * @return void
     */
    public static function syncAllUsers(): void
    {
        $serversList = LdapServers::find('disabled=0')->toArray();
        foreach ($serversList as $ldapCredentials) {
            self::syncUsersPerServer($ldapCredentials);
        }
    }

    /**
     * Synchronizes LDAP users based on the provided server parameters.
     *
     * @param array $ldapCredentials - Parameters for the LDAP server.
     * @return AnswerStructure - The structure containing synchronization status.
     */
    public static function syncUsersPerServer(array $ldapCredentials): AnswerStructure
    {
        // Create an answer structure for the result
        $res = new AnswerStructure();
        $res->success = true;

        // Create a Logger instance
        $className = basename(str_replace('\\', '/', static::class));
        $logger = new Logger($className, 'ModuleLdapSync');

        // Create an LDAP connector for the server
        $connector = new LdapSyncConnector($ldapCredentials);

        // Get the list of users from LDAP
        $responseFromLdap = $connector->getUsersList();
        $processedUsers = [];

        // Check if LDAP retrieval was successful
        if ($responseFromLdap->success = false) {
            return $responseFromLdap;
        }

        foreach ($responseFromLdap->data as $userFromLdap) {
            // Update user data on PBX or on Domain based on LDAP information
            $result = self::updateUserData($ldapCredentials, $userFromLdap);
            $res->messages = array_merge($res->messages, $result->messages);
            $processedUser = $userFromLdap;

            // Remove avatar data from arrays to prevent memory leaks and overloading the beanstalk
            $avatarKey = $connector->userAttributes[Constants::USER_AVATAR_ATTR];
            if (!empty($processedUser[$avatarKey])) {
                $processedUser[$avatarKey] = 'base64picture...';
            }

            if (!empty($result->data[Constants::USER_SYNC_RESULT])) {
                $processedUser[Constants::USER_SYNC_RESULT] = $result->data[Constants::USER_SYNC_RESULT];

                if ($result->data[Constants::USER_SYNC_RESULT] === Constants::SYNC_RESULT_CONFLICT) {
                    LdapSyncConflicts::recordSyncConflict($ldapCredentials['id'], $result->data[Constants::CONFLICT_DATA], $result->messages, $result->data[Constants::SYNC_RESULT_CONFLICT_SIDE]);
                }
            }
            if (!empty($result->data[Constants::EXTENSION_ID_IN_MIKOPBX])) {
                $processedUser[Constants::EXTENSION_ID_IN_MIKOPBX] = $result->data[Constants::EXTENSION_ID_IN_MIKOPBX];
            }

            if ($result->success) {
                // Check for changes in user data
                if (!empty($result->data[Constants::USER_HAD_CHANGES_ON])) {
                    $processedUser[Constants::USER_HAD_CHANGES_ON] = $result->data[Constants::USER_HAD_CHANGES_ON];
                    $userName = $processedUser[$connector->userAttributes[Constants::USER_NAME_ATTR]];
                    $logger->writeInfo("Updated " . $userName . " data on " . $result->data[Constants::USER_HAD_CHANGES_ON]);
                    WorkerLdapSync::increaseSyncFrequency();
                }
            }

            if (!empty($processedUser[$avatarKey])) {
                $processedUser[$avatarKey] = '<i class="camera retro icon"></i>';
            }
            $processedUsers[] = $processedUser;
        }

        $res->success = true;
        $res->data = $processedUsers;
        return $res;
    }

    /**
     * Updates user on LDAP or PBX side
     *
     * @param array $ldapCredentials - Parameters for the LDAP server.
     * @param array $userFromLdap - User data retrieved from LDAP.
     * @return AnswerStructure
     */
    public static function updateUserData(array $ldapCredentials, array $userFromLdap): AnswerStructure
    {
        // 1. Find data stored in MikoPBX about the user from LDAP
        $userGuid = $userFromLdap[Constants::USER_GUID_ATTR];
        $parameters = [
            'conditions' => 'server_id=:server_id: and guid=:guid:',
            'bind' => [
                'guid' => $userGuid,
                'server_id' => $ldapCredentials['id'],
            ]
        ];

        $previousSyncUser = ADUsers::findFirst($parameters);
        if ($previousSyncUser === null) {
            $previousSyncUser = new ADUsers();
            $previousSyncUser->server_id = $ldapCredentials['id'];
            $previousSyncUser->guid = $userGuid;
        }

        // 2. Prepare data structure from LDAP directory
        $userDataFromLdap = self::getUserDataFromLdap($ldapCredentials['attributes'], $userFromLdap);
        $domainParamsHash = md5(implode('', $userDataFromLdap));

        // 3. Prepare data structure from MikoPBX database
        if ($previousSyncUser->user_id) {
            $userDataFromMikoPBX = self::getUserOnMikoPBX($previousSyncUser->user_id);
        } else {
            $userDataFromMikoPBX = [];
        }
        // Sort the array by keys to ensure consistent ordering
        ksort($userDataFromMikoPBX);

        $localParamsHash = md5(implode('', $userDataFromMikoPBX));

        // 4. Compare data hash with stored value
        if ($previousSyncUser->domainParamsHash !== $domainParamsHash
            || $userDataFromMikoPBX === []
        ) {
            // Save user disabled status
            $previousSyncUser->disabled = ($userDataFromLdap[Constants::USER_DISABLED] ?? false) ? '1' : '0';

            // Do not create disabled users
            if ($userDataFromLdap[Constants::USER_DISABLED] === true && $userDataFromMikoPBX === []) {
                $response = new AnswerStructure();
                $response->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_SKIPPED;
                $response->success = true;
                return $response;
            }

            // 5. Changes on domain side, need update PBX info first
            $response = self::createUpdateUser($userDataFromLdap, $previousSyncUser->user_id);
            if ($response->success) {
                $response->data[Constants::USER_HAD_CHANGES_ON] = Constants::HAD_CHANGES_ON_PBX;
                $response->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_UPDATED;
                $previousSyncUser->domainParamsHash = $domainParamsHash;
                $previousSyncUser->user_id = $response->data['user_id'];
            } else {
                $response->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_CONFLICT;
                $response->data[Constants::SYNC_RESULT_CONFLICT_SIDE] = Constants::PBX_UPDATE_CONFLICT;
                $response->data[Constants::CONFLICT_DATA]=$userDataFromLdap;
                unset($response->data[Constants::CONFLICT_DATA][Constants::USER_AVATAR_ATTR]);
            }
        } elseif (
            $previousSyncUser->localParamsHash !== $localParamsHash
            && $ldapCredentials['updateAttributes'] === '1'
            && !empty($userDataFromMikoPBX)
        ) {
            // 6. Changes on PBX side, need update domain info
            $response = self::updateADUser($ldapCredentials, $previousSyncUser->guid, $userDataFromMikoPBX);
            if ($response->success) {
                $response->data[Constants::USER_HAD_CHANGES_ON] = Constants::HAD_CHANGES_ON_AD;
                $previousSyncUser->localParamsHash = $localParamsHash;
            } else {
                $response->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_CONFLICT;
                $response->data[Constants::SYNC_RESULT_CONFLICT_SIDE] = Constants::LDAP_UPDATE_CONFLICT;
                $response->data[Constants::CONFLICT_DATA]=$userDataFromMikoPBX;
                unset($response->data[Constants::CONFLICT_DATA][Constants::USER_AVATAR_ATTR]);
            }
        } else {
            // No changes on both sides
            $response = new AnswerStructure();
            $response->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_SKIPPED;
            if (isset($userDataFromMikoPBX[Constants::EXTENSION_ID_IN_MIKOPBX])){
                $response->data[Constants::EXTENSION_ID_IN_MIKOPBX] = $userDataFromMikoPBX[Constants::EXTENSION_ID_IN_MIKOPBX];
            }
            $response->success = true;
            return $response;
        }

        if (isset($userDataFromMikoPBX[Constants::EXTENSION_ID_IN_MIKOPBX])){
            $response->data[Constants::EXTENSION_ID_IN_MIKOPBX] = $userDataFromMikoPBX[Constants::EXTENSION_ID_IN_MIKOPBX];
        }

        // Save hashes into database
        if ($response->success && !$previousSyncUser->save()) {
            $response->success = false;
            $response->messages['error'][] = $previousSyncUser->getMessages();
        }

        return $response;
    }

    /**
     * Get user data from LDAP.
     *
     * @param string $attributes JSON-encoded user attributes mapping.
     * @param array $userFromLdap The user data fetched from LDAP.
     * @return array The user data mapped based on provided attributes.
     */
    public static function getUserDataFromLdap(string $attributes, array $userFromLdap): array
    {
        // Decode the JSON-encoded attributes mapping.
        $userAttributes = json_decode($attributes, true);

        $userDataFromLdap = [];
        foreach ($userAttributes as $attributeId => $attributeName) {
            // Get the value for the attribute from the LDAP data.
            $value = $userFromLdap[$attributeName] ?? '';
            // Skip empty attributes.
            if (empty($value) && $value !== false) {
                continue;
            }

            // Sanitizing
            switch ($attributeId) {
                case Constants::USER_MOBILE_ATTR:
                case Constants::USER_EXTENSION_ATTR:
                    // Process mobile and extension attribute to remove non-numeric characters.
                    $userDataFromLdap[$attributeId] = preg_replace('/\D/', '', $value);
                    break;
                case Constants::USER_EMAIL_ATTR:
                    if (self::isValidEmail($value)) {
                        $userDataFromLdap[$attributeId] = $value;
                    }
                    break;
                case Constants::USER_AVATAR_ATTR:
                    $maxLengthInBytes = 512 * 1024; // 512 kilobytes
                    if (strlen($value) < $maxLengthInBytes) {
                        $userDataFromLdap[$attributeId] = $value;
                    }
                    break;
                case Constants::USER_NAME_ATTR:
                    // Allow all Unicode letters, numbers, spaces, and common symbols.
                    $userDataFromLdap[$attributeId] = preg_replace('/[^\p{L}\p{N}\s\(\)]/u', '', $value);
                    break;
                default:
                    // For other attributes, simply use the value as-is.
                    $userDataFromLdap[$attributeId] = $value;
            }

        }
        return $userDataFromLdap;
    }

    /**
     * Check if presented email is valid
     * @param string $email
     * @return bool
     */
    private static function isValidEmail(string $email): bool
    {
        // Define a regular expression pattern for a valid email address
        $pattern = '/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/';

        // Use the preg_match function to perform the validation
        return preg_match($pattern, $email) === 1;
    }

    /**
     * Get user information from MikoPBX.
     *
     * @param string $userId The ID of the user.
     * @return mixed|null The user information from MikoPBX.
     */
    public static function getUserOnMikoPBX(string $userId): array
    {
        // Query parameters for retrieving user information.
        $parameters = [
            'models' => [
                'Users' => Users::class,
            ],
            'conditions' => 'Users.id = :user_id:',
            'bind' => [
                'user_id' => $userId
            ],
            'columns' => [
                Constants::USER_NAME_ATTR => 'Users.username',
                Constants::USER_EXTENSION_ATTR => 'Extensions.number',
                Constants::USER_MOBILE_ATTR => 'ExtensionsExternal.number',
                Constants::USER_EMAIL_ATTR => 'Users.email',
                Constants::USER_AVATAR_ATTR => 'Users.avatar',
                Constants::USER_PASSWORD_ATTR => 'Sip.secret',
                Constants::EXTENSION_ID_IN_MIKOPBX=>'Extensions.id',
            ],
            'joins' => [
                'Extensions' => [
                    0 => Extensions::class,
                    1 => 'Extensions.userid=Users.id AND Extensions.type="' . Extensions::TYPE_SIP . '"',
                    2 => 'Extensions',
                    3 => 'INNER',
                ],
                'Sip' => [
                    0 => Sip::class,
                    1 => 'Sip.extension=Extensions.number',
                    2 => 'Sip',
                    3 => 'INNER',
                ],
                'ExtensionsExternal' => [
                    0 => Extensions::class,
                    1 => 'ExtensionsExternal.userid = Users.id AND ExtensionsExternal.type="' . Extensions::TYPE_EXTERNAL . '"',
                    2 => 'ExtensionsExternal',
                    3 => 'LEFT',
                ],
            ],
        ];
        // Build and execute the query to fetch user information.
        $di=MikoPBXVersion::getDefaultDi();
        $result = $di->get('modelsManager')->createBuilder($parameters)
            ->getQuery()
            ->getSingleResult();

        if ($result === null) {
            return [];
        }
        return $result->toArray();
    }

    /**
     * Creates or updates a user using provided data.
     *
     * @param array $userDataFromLdap - User data to be created or updated.
     * @param ?string $currentUserId The current user id.
     * @return AnswerStructure
     */
    public static function createUpdateUser(array $userDataFromLdap, string $currentUserId = null): AnswerStructure
    {
        $pbxUserData = self::findUserInMikoPBX($userDataFromLdap, $currentUserId);

        if ($userDataFromLdap[Constants::USER_DISABLED] ?? false) {
            $result = new AnswerStructure();
            $result->success = true;
            $result->data = $pbxUserData;
            $result->data[Constants::USER_SYNC_RESULT] = Constants::SYNC_RESULT_SKIPPED;
            $result->messages = ['info' => 'The user is disabled on domain side. Skipped.'];
            return $result;
        }

        // Get user data from the API
        $di=MikoPBXVersion::getDefaultDi();
        $restAnswer = $di->get(PBXCoreRESTClientProvider::SERVICE_NAME, [
            '/pbxcore/api/extensions/getRecord',
            PBXCoreRESTClientProvider::HTTP_METHOD_GET,
            ['id' => $pbxUserData['extension_id'] ?? '']
        ]);
        if (!$restAnswer->success) {
            return new AnswerStructure($restAnswer);
        }

        // Create a new data structure for user data
        $dataStructure = new DataStructure($restAnswer->data);

        // Check if provided phone number is available
        $number = $userDataFromLdap[Constants::USER_EXTENSION_ATTR];
        if (!empty($number) && $number !== $dataStructure->number) {
            $restAnswer = $di->get(PBXCoreRESTClientProvider::SERVICE_NAME, [
                '/pbxcore/api/extensions/available',
                PBXCoreRESTClientProvider::HTTP_METHOD_GET,
                ['number' => $number]
            ]);
            if ($restAnswer->success || $restAnswer->data['userId'] == $pbxUserData['user_id']) {
                $dataStructure->number = $number;
            }
        }

        // Check if provided mobile number is available
        $mobileFromDomain = $userDataFromLdap[Constants::USER_MOBILE_ATTR];
        if (!empty($mobileFromDomain) && $mobileFromDomain !== $dataStructure->mobile_number) {
            $restAnswer = $di->get(PBXCoreRESTClientProvider::SERVICE_NAME, [
                '/pbxcore/api/extensions/available',
                PBXCoreRESTClientProvider::HTTP_METHOD_GET,
                ['number' => $mobileFromDomain]
            ]);
            if ($restAnswer->success || $restAnswer->data['userId'] == $pbxUserData['user_id']) {
                // Update mobile number and forwarding settings
                $oldMobileNumber = $dataStructure->mobile_number;
                $dataStructure->mobile_number = $mobileFromDomain;
                $dataStructure->mobile_dialstring = $mobileFromDomain;

                if ($oldMobileNumber === $dataStructure->fwd_forwardingonunavailable) {
                    $dataStructure->fwd_forwardingonunavailable = $mobileFromDomain;
                }
                if ($oldMobileNumber === $dataStructure->fwd_forwarding) {
                    $dataStructure->fwd_forwarding = $mobileFromDomain;
                }
                if ($oldMobileNumber === $dataStructure->fwd_forwardingonbusy) {
                    $dataStructure->fwd_forwardingonbusy = $mobileFromDomain;
                }
            }
        }

        // Check if provided email is available
        $email = $userDataFromLdap[Constants::USER_EMAIL_ATTR];
        if (!empty($email) && $email !== $dataStructure->user_email) {
            $restAnswer = $di->get(PBXCoreRESTClientProvider::SERVICE_NAME, [
                '/pbxcore/api/users/available',
                PBXCoreRESTClientProvider::HTTP_METHOD_GET,
                ['email' => $email]
            ]);
            if ($restAnswer->success || $restAnswer->data['userId'] == $pbxUserData['user_id']) {
                $dataStructure->user_email = $email;
            }
        }

        // Check provided sip password
        $sipPassword = $userDataFromLdap[Constants::USER_PASSWORD_ATTR] ?? $dataStructure->sip_secret;
        if (!empty($sipPassword) && $sipPassword != $dataStructure->sip_secret) {
            $dataStructure->sip_secret = $sipPassword;
        }

        $dataStructure->user_username = $userDataFromLdap[Constants::USER_NAME_ATTR] ?? $dataStructure->user_username;

        $dataStructure->user_avatar = $userDataFromLdap[Constants::USER_AVATAR_ATTR] ?? $dataStructure->user_avatar;

        $dataStructure->sip_transport = trim($dataStructure->sip_transport);


        // Save user data through the CORE API
        $restAnswer = $di->get(PBXCoreRESTClientProvider::SERVICE_NAME, [
            '/pbxcore/api/extensions/saveRecord',
            PBXCoreRESTClientProvider::HTTP_METHOD_POST,
            $dataStructure->toArray()
        ]);

        return new AnswerStructure($restAnswer);
    }

    /**
     * Find a user extension id in the MikoPBX DB based on LDAP data.
     *
     * @param array $userDataFromLdap The LDAP user data.
     * @param ?string $currentUserId The current user id.
     * @return array The user data if found, otherwise an empty array.
     */
    public static function findUserInMikoPBX(array $userDataFromLdap, string $currentUserId = null): array
    {
        $parameters = [
            'models' => [
                'Extensions' => Extensions::class,
            ],
            'conditions' => '',
            'columns' => [
                'extension_id' => 'Extensions.id',
                'username' => 'Users.username',
                'number' => 'Extensions.number',
                'user_id' => 'Extensions.userid',
                'email' => 'Users.email',
            ],
            'joins' => [
                'Users' => [
                    0 => Users::class,
                    1 => 'Users.id = Extensions.userid',
                    2 => 'Users',
                    3 => 'INNER',
                ],
            ],
        ];

        if (!empty($currentUserId)) {
            $parameters['conditions'] = ' OR Users.id=:user_id:';
            $parameters['bind']['user_id'] = $currentUserId;
        } else {
            foreach ($userDataFromLdap as $index => $value) {
                if (!empty($value)) {
                    switch ($index) {
                        case Constants::USER_EMAIL_ATTR:
                            $parameters['conditions'] = $parameters['conditions'] . ' OR Users.email=:email:';
                            $parameters['bind']['email'] = $value;
                            break;
                        case Constants::USER_MOBILE_ATTR:
                            $parameters['conditions'] = $parameters['conditions'] . ' OR Extensions.number = :mobile:';
                            $parameters['bind']['mobile'] = $value;
                            break;
                        case Constants::USER_EXTENSION_ATTR:
                            $parameters['conditions'] = $parameters['conditions'] . ' OR Extensions.number = :number:';
                            $parameters['bind']['number'] = $value;
                            break;
                        case Constants::USER_NAME_ATTR:
                            $parameters['conditions'] = $parameters['conditions'] . ' OR Users.username=:username:';
                            $parameters['bind']['username'] = $value;
                            break;
                    }
                }
            }
        }

        $parameters['conditions'] = '(' . substr($parameters['conditions'], 3) . ') AND Extensions.type="' . Extensions::TYPE_SIP . '"';
        $userDataFromMikoPBX = null;
        if (!empty($parameters['bind'])) {
            $di=MikoPBXVersion::getDefaultDi();
            $userDataFromMikoPBX = $di->get('modelsManager')->createBuilder($parameters)
                ->getQuery()
                ->getSingleResult();
        }
        if ($userDataFromMikoPBX === null) {
            $result = [];
        } else {
            $result = $userDataFromMikoPBX->toArray();
        }

        return $result;
    }


    /**
     * Updates an AD user's data based on the previous synchronization.
     *
     * @param array $ldapCredentials - Parameters for the LDAP server.
     * @param string $userGuid The GUID of domain user to update.
     * @param array $newUserData The new user data to update.
     * @return AnswerStructure - The structure containing update status and user ID.
     */
    private static function updateADUser(array $ldapCredentials, string $userGuid, array $newUserData): AnswerStructure
    {
        // Create an LDAP connector
        $connector = new LdapSyncConnector($ldapCredentials);

        // Update AD user's data using the LDAP connector
        return $connector->updateDomainUser($userGuid, $newUserData);
    }

    /**
     * Retrieves available LDAP users based on provided data.
     *
     * @param array $ldapCredentials - Data containing LDAP configuration.
     * @return AnswerStructure - The structure containing available LDAP users.
     */
    public static function getAvailableLdapUsers(array $ldapCredentials): AnswerStructure
    {
        // Create an LDAP connector
        $ldapConnector = new LdapSyncConnector($ldapCredentials);

        // Retrieve the list of available LDAP users
        $result = $ldapConnector->getUsersList();

        // Remove big data strings from response
        $avatarKey = $ldapConnector->userAttributes[Constants::USER_AVATAR_ATTR];
        if ($result->success) {
            foreach ($result->data as &$processedUser) {
                if (!empty($processedUser[$avatarKey])) {
                    $processedUser[$avatarKey] = '<i class="camera retro icon"></i>';
                }
            }
        }
        return $result;
    }

    /**
     * Convert post data into LDAP credentials.
     *
     * @param array $postData The input post data.
     * @return array The LDAP credentials.
     */
    public static function postDataToLdapCredentials(array $postData): array
    {
        // Admin password can be stored in DB on the time, on this way it has only xxxxxx value.
        // It can be empty as well, if some password manager tried to fill it.
        if (empty($postData['administrativePasswordHidden'])
            || $postData['administrativePasswordHidden'] === Constants::HIDDEN_PASSWORD) {
            $ldapConfig = LdapServers::findFirstById($postData['id']) ?? new LdapServers();
            $postData['administrativePassword'] = $ldapConfig->administrativePassword ?? '';
        } else {
            $postData['administrativePassword'] = $postData['administrativePasswordHidden'];
        }

        // Define attributes for LDAP search
        $attributes = [
            Constants::USER_EMAIL_ATTR => $postData[Constants::USER_EMAIL_ATTR],
            Constants::USER_NAME_ATTR => $postData[Constants::USER_NAME_ATTR],
            Constants::USER_MOBILE_ATTR => $postData[Constants::USER_MOBILE_ATTR],
            Constants::USER_EXTENSION_ATTR => $postData[Constants::USER_EXTENSION_ATTR],
            Constants::USER_AVATAR_ATTR => $postData[Constants::USER_AVATAR_ATTR],
            Constants::USER_ACCOUNT_CONTROL_ATTR => $postData[Constants::USER_ACCOUNT_CONTROL_ATTR],
            Constants::USER_PASSWORD_ATTR => $postData[Constants::USER_PASSWORD_ATTR],
            Constants::USER_DISABLED => Constants::USER_DISABLED
        ];

        // Construct and return LDAP credentials
        return [
            'id' => $postData['id'],
            'ldapType' => $postData['ldapType'],
            'serverName' => $postData['serverName'],
            'serverPort' => $postData['serverPort'],
            'baseDN' => $postData['baseDN'],
            'administrativeLogin' => $postData['administrativeLogin'],
            'administrativePassword' => $postData['administrativePassword'],
            'attributes' => json_encode($attributes),
            'organizationalUnit' => $postData['organizationalUnit'],
            'userFilter' => $postData['userFilter'],
            'updateAttributes' => $postData['updateAttributes'],
            'useTLS' => $postData['useTLS'],
        ];
    }


}