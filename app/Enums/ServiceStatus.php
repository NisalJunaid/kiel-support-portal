<?php

namespace App\Enums;

enum ServiceStatus: string
{
    case Operational = 'operational';
    case Maintenance = 'maintenance';
    case Degraded = 'degraded';
    case MajorOutage = 'major_outage';
    case Retired = 'retired';

    public function label(): string
    {
        return match ($this) {
            self::MajorOutage => 'Major Outage',
            default => str($this->value)->replace('_', ' ')->title()->value(),
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Operational => 'success',
            self::Maintenance => 'info',
            self::Degraded => 'warning',
            self::MajorOutage => 'destructive',
            self::Retired => 'secondary',
        };
    }
}
