<?php

namespace App\Enums;

enum TicketMessageType: string
{
    case PublicReply = 'public_reply';
    case InternalNote = 'internal_note';
    case SystemEvent = 'system_event';

    public function label(): string
    {
        return match ($this) {
            self::PublicReply => 'Public Reply',
            self::InternalNote => 'Internal Note',
            self::SystemEvent => 'System Event',
        };
    }

    public function badgeVariant(): string
    {
        return match ($this) {
            self::PublicReply => 'info',
            self::InternalNote => 'warning',
            self::SystemEvent => 'secondary',
        };
    }
}
