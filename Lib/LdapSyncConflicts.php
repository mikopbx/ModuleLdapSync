<?php

/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2024 Alexey Portnov and Nikolay Beketov
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

use Modules\ModuleLdapSync\Models\Conflicts;
use Phalcon\Di\Injectable;

class LdapSyncConflicts extends Injectable
{
    /**
     * Gets conflict records from server by server id
     *
     * @param string $serverId The ID of the LDAP server.
     * @return AnswerStructure
     */
    static public function getServerConflicts(string $serverId): AnswerStructure
    {
        $res = new AnswerStructure();
        $res->success = true;
        $records = Conflicts::find('server_id=' . $serverId);
        if (!$records) {
            $res->success = false;
            $res->messages[] = "Records not found";
            return $res;
        }
        foreach ($records as $record) {
            $res->data[$record->id] = [
                'id' => $record->id,
                'lastTime' => $record->lastTime,
                'side' => $record->side,
                'params' => json_decode($record->params),
                'errors' => json_decode($record->errors),
            ];
        }
        return $res;
    }

    /**
     * Deletes Conflict record
     * @param string $recordId - record id
     * @return AnswerStructure
     */
    static public function deleteServerConflict(string $recordId): AnswerStructure
    {
        $record = Conflicts::findFirstById($recordId);
        $res = new AnswerStructure();
        $res->success = true;
        if (!$record) {
            $res->success = false;
            $res->messages[] = "Record not found";
            return $res;
        }
        $res->success = $record->delete();
        if (!$res->success) {
            $res->messages = $record->getMessages();
        }
        return $res;
    }

    /**
     * Records synchronization conflicts between user data from LDAP and the local database.
     *
     * This method checks if there is an existing conflict record for the given domain parameters hash.
     * If no record exists, it creates a new one. It then updates the record with the provided user data
     * from LDAP and any errors encountered during synchronization, and saves the record to the database.
     *
     * @param string $ldapServerID The ID of the LDAP server.
     * @param array $userData The user data retrieved from LDAP or the local database.
     * @param array $errors An array of errors encountered during synchronization.
     * @param string $side Indicates the source of the user data.
     * @return void
     */
    public static function recordSyncConflict(string $ldapServerID, array $userData, array $errors, string $side): void
    {
        $paramsHash = md5(implode('', $userData));
        // Attempt to find an existing conflict record by the domain parameters hash
        $storedRecord = Conflicts::findFirst("paramsHash='$paramsHash'");

        // If no existing record is found, create a new one
        if ($storedRecord === null) {
            $storedRecord = new Conflicts();
            $storedRecord->paramsHash = $paramsHash;
        }

        // Update the record with the user data from LDAP and the encountered errors
        $storedRecord->lastTime = date("Y-m-d H:i:s");
        $storedRecord->params = json_encode($userData);
        $storedRecord->errors = json_encode($errors['error'] ?? '');
        $storedRecord->server_id = $ldapServerID;
        $storedRecord->side = $side;

        // Save the updated or newly created record to the database
        $storedRecord->save();
    }


    /**
     * Deletes all Conflict record for the server
     * @param string $ldapServerID - The ID of the LDAP server.
     * @return AnswerStructure
     */
    static public function deleteServerConflicts(string $ldapServerID): AnswerStructure
    {
        $record = Conflicts::find("server_id='$ldapServerID'");
        $res = new AnswerStructure();
        $res->success = true;
        foreach ($record as $conflict) {
            $conflict->delete();
        }
        return $res;
    }

}