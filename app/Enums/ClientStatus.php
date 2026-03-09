<?php

namespace App\Enums;

enum ClientStatus: string
{
    case Prospect = 'prospect';
    case Active = 'active';
    case Onboarding = 'onboarding';
    case Suspended = 'suspended';
    case Archived = 'archived';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Active => 'success',
            self::Onboarding, self::Prospect => 'info',
            self::Suspended => 'warning',
            self::Archived => 'secondary',
        };
    }
}
