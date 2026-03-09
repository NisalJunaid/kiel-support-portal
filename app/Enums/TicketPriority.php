<?php

namespace App\Enums;

enum TicketPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Urgent = 'urgent';

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->value();
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::Low => 'secondary',
            self::Medium => 'info',
            self::High => 'warning',
            self::Urgent => 'destructive',
        };
    }
}
