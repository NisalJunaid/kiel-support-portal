<?php

namespace App\Http\Controllers\ClientPortal;

use App\Actions\Tickets\GenerateTicketNumber;
use App\Enums\TicketMessageType;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientPortalTicketRequest;
use App\Models\Asset;
use App\Models\Ticket;
use App\Services\Notifications\TicketNotificationService;
use App\Services\Tickets\SlaDeadlineService;
use App\Services\Tickets\TicketAttachmentService;
use App\Services\Tickets\TicketMessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function create(Request $request): Response
    {
        $this->authorize('create', Ticket::class);

        $profile = $request->user()->clientUserProfile;
        abort_unless($profile, 403);

        return Inertia::render('ClientPortal/Tickets/Create', [
            'assets' => Asset::query()
                ->where('client_company_id', $profile->client_company_id)
                ->orderBy('name')
                ->get(['id', 'name', 'asset_code'])
                ->values(),
            'canSetPriority' => true,
            'defaults' => [
                'priority' => 'medium',
            ],
        ]);
    }

    public function store(
        StoreClientPortalTicketRequest $request,
        GenerateTicketNumber $generateTicketNumber,
        TicketMessageService $ticketMessageService,
        TicketAttachmentService $ticketAttachmentService,
        SlaDeadlineService $slaDeadlineService,
        TicketNotificationService $ticketNotificationService,
    ): RedirectResponse {
        $profile = $request->user()->clientUserProfile;
        abort_unless($profile, 403);

        $payload = $request->validated();
        $payload['ticket_number'] = $generateTicketNumber->execute();
        $payload['client_company_id'] = $profile->client_company_id;
        $payload['requester_user_id'] = $request->user()->id;
        $payload['status'] = TicketStatus::New->value;
        $payload['source'] = 'client_portal';

        $planId = $slaDeadlineService->resolvePlanId($payload);
        $deadlines = $slaDeadlineService->calculateDeadlines($planId, now());
        $payload['sla_plan_id'] = $deadlines['sla_plan_id'];
        $payload['first_response_due_at'] = $deadlines['first_response_due_at'];
        $payload['resolution_due_at'] = $deadlines['resolution_due_at'];

        $ticket = Ticket::create($payload);

        if ($ticket->asset_id) {
            DB::table('asset_ticket_links')->updateOrInsert(
                ['asset_id' => $ticket->asset_id, 'ticket_id' => $ticket->id],
                ['updated_at' => now(), 'created_at' => now()],
            );
        }

        $ticketMessageService->createSystemEvent(
            $ticket,
            sprintf('Ticket submitted by client user %s.', $request->user()->name),
        );

        $attachments = $request->file('attachments', []);
        if (! empty($attachments)) {
            $ticketAttachmentService->storeForTicket($ticket, $request->user(), $attachments);
        }

        $ticketNotificationService->notifyTicketCreated($ticket, $request->user());

        return redirect()
            ->route('portal.tickets.show', $ticket)
            ->with('success', 'Ticket created successfully.');
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
            'can' => [
                'addPublicReply' => $request->user()->can('addPublicReply', $ticket),
            ],
        ]);
    }
}
