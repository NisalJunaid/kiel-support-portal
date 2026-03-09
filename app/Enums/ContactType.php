<?php

namespace App\Enums;

enum ContactType: string
{
    case Primary = 'primary';
    case Billing = 'billing';
    case Technical = 'technical';
    case Escalation = 'escalation';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Primary, self::Technical => 'info',
            self::Billing => 'warning',
            self::Escalation => 'destructive',
        };
    }
}
