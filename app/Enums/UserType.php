<?php

namespace App\Enums;

enum UserType: string
{
    case Internal = 'internal';
    case Client = 'client';

    public function label(): string
    {
        return match ($this) {
            self::Internal => 'Internal Staff',
            self::Client => 'Client User',
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Internal => 'info',
            self::Client => 'secondary',
        };
    }
}
