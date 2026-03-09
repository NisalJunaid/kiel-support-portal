<?php

namespace App\Enums;

enum TicketStatus: string
{
    case New = 'new';
    case Open = 'open';
    case PendingClient = 'pending_client';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::PendingClient => 'Pending Client',
            self::InProgress => 'In Progress',
            default => str($this->value)->replace('_', ' ')->title()->value(),
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::New => 'info',
            self::Open, self::InProgress => 'warning',
            self::PendingClient => 'secondary',
            self::Resolved => 'success',
            self::Closed => 'secondary',
        };
    }
}
