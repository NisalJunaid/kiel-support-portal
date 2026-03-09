<?php

namespace App\Http\Controllers;

use App\Enums\TicketMessageType;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Models\Ticket;
use App\Services\Tickets\TicketMessageService;
use Illuminate\Http\RedirectResponse;

class TicketMessageController extends Controller
{
    public function store(StoreTicketMessageRequest $request, Ticket $ticket, TicketMessageService $ticketMessageService): RedirectResponse
    {
        $type = TicketMessageType::from($request->string('message_type')->toString());

        $ticketMessageService->createUserMessage(
            $ticket,
            $request->user(),
            $type,
            $request->string('body')->toString(),
        );

        activity('tickets')
            ->performedOn($ticket)
            ->causedBy($request->user())
            ->event('message_created')
            ->withProperties([
                'ticket_number' => $ticket->ticket_number,
                'message_type' => $type->value,
            ])
            ->log('Ticket message added');

        return redirect()->route('tickets.show', $ticket)->with('success', $type === TicketMessageType::InternalNote ? 'Internal note added.' : 'Reply sent.');
    }
}
