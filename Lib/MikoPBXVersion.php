<?php

namespace Modules\ModuleLdapSync\Lib;
use MikoPBX\Common\Models\PbxSettings;

class MikoPBXVersion
{
    /**
     * Return Di interface for the current version of PBX
     * @return \Phalcon\Di\DiInterface|null
     */
    public static function getDefaultDi():\Phalcon\Di\DiInterface|null
    {
        $pbxVersion = PbxSettings::getValueByKey('PBXVersion');
        if (version_compare($pbxVersion, '2024.2.30', '>')) {
            return  \Phalcon\Di\Di::getDefault();
        } else {
            return  \Phalcon\Di::getDefault();
        }
    }
}