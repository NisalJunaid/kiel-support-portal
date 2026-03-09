<?php

namespace App\Enums;

enum AssetCriticality: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case MissionCritical = 'mission_critical';

    public function label(): string
    {
        return match ($this) {
            self::MissionCritical => 'Mission Critical',
            default => str($this->value)->replace('_', ' ')->title()->value(),
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Low => 'secondary',
            self::Medium => 'info',
            self::High => 'warning',
            self::MissionCritical => 'destructive',
        };
    }
}
