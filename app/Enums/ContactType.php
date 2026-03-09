<?php

namespace App\Enums;

enum ContactType: string
{
    case Primary = 'primary';
    case Billing = 'billing';
    case Technical = 'technical';
    case Management = 'management';
    case Abuse = 'abuse';
    case Support = 'support';
    case Escalation = 'escalation';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Primary => 'default',
            self::Technical, self::Support => 'info',
            self::Billing => 'warning',
            self::Management => 'success',
            self::Abuse, self::Escalation => 'destructive',
        };
    }
}
