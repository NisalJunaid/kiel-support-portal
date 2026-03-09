<?php

namespace App\Support;

class Roles
{
    public const SUPER_ADMIN = 'super-admin';
    public const ADMIN = 'admin';
    public const STAFF = 'staff';
    public const SUPPORT_AGENT = 'support-agent';
    public const ASSET_MANAGER = 'asset-manager';
    public const CLIENT_USER = 'client-user';

    public static function all(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ADMIN,
            self::STAFF,
            self::SUPPORT_AGENT,
            self::ASSET_MANAGER,
            self::CLIENT_USER,
        ];
    }
}
