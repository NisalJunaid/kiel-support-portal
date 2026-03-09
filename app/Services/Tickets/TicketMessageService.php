<?php

namespace App\Services\Tickets;

use App\Enums\TicketMessageType;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;

class TicketMessageService
{
    public function createUserMessage(Ticket $ticket, User $author, TicketMessageType $type, string $body): TicketMessage
    {
        return $ticket->messages()->create([
            'user_id' => $author->id,
            'message_type' => $type,
            'body' => trim($body),
        ]);
    }

    public function createSystemEvent(Ticket $ticket, string $body): TicketMessage
    {
        return $ticket->messages()->create([
            'message_type' => TicketMessageType::SystemEvent,
            'body' => trim($body),
        ]);
    }
}
