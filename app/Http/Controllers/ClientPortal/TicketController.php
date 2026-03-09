<?php

namespace App\Http\Controllers\ClientPortal;

use App\Enums\TicketMessageType;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $profile = $request->user()->clientUserProfile;
        abort_unless($profile, 403);

        $tickets = Ticket::query()
            ->where('client_company_id', $profile->client_company_id)
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
                'updated_at' => optional($ticket->updated_at)->diffForHumans(),
            ]);

        return Inertia::render('ClientPortal/Tickets/Index', [
            'tickets' => $tickets,
            'canCreate' => (bool) $profile->can_create_tickets,
        ]);
    }

    public function show(Request $request, Ticket $ticket): Response
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'messages.author:id,name',
            'messages.attachments.uploader:id,name',
            'attachments.uploader:id,name',
            'asset:id,name,asset_code',
            'service:id,name',
        ]);

        $messages = $ticket->messages
            ->filter(fn ($message) => $message->message_type === TicketMessageType::PublicReply)
            ->values();

        return Inertia::render('ClientPortal/Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
                'updated_at' => optional($ticket->updated_at)->toDateTimeString(),
                'asset' => $ticket->asset,
                'service' => $ticket->service,
            ],
            'messages' => $messages->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'created_at' => optional($message->created_at)->toDateTimeString(),
                'author' => $message->author,
            ])->values(),
            'attachments' => $ticket->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'uploaded_by' => $attachment->uploader?->name,
                'created_at' => optional($attachment->created_at)->toDateTimeString(),
            ])->values(),
        ]);
    }
}
