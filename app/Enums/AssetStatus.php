<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Provisioning = 'provisioning';
    case Online = 'online';
    case Degraded = 'degraded';
    case Offline = 'offline';
    case Retired = 'retired';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Online => 'success',
            self::Provisioning => 'info',
            self::Degraded => 'warning',
            self::Offline => 'destructive',
            self::Retired => 'secondary',
        };
    }
}
