<?php

namespace App\Http\Controllers\ClientPortal;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $profile = $request->user()->clientUserProfile;
        abort_unless($profile, 403);

        $companyId = $profile->client_company_id;
        $openStatuses = [TicketStatus::New->value, TicketStatus::Open->value, TicketStatus::InProgress->value, TicketStatus::PendingClient->value];

        $summary = [
            [
                'label' => 'Open Tickets',
                'value' => Ticket::query()->where('client_company_id', $companyId)->whereIn('status', $openStatuses)->count(),
                'hint' => 'Tickets currently in progress for your company.',
            ],
            [
                'label' => 'Awaiting Your Reply',
                'value' => Ticket::query()->where('client_company_id', $companyId)->where('status', TicketStatus::PendingClient->value)->count(),
                'hint' => 'Tickets waiting for follow-up from your team.',
            ],
            [
                'label' => 'Active Assets',
                'value' => $profile->can_view_assets
                    ? Asset::query()->where('client_company_id', $companyId)->count()
                    : null,
                'hint' => 'Total assets linked to your company.',
            ],
        ];

        $recentTickets = Ticket::query()
            ->where('client_company_id', $companyId)
            ->latest('updated_at')
            ->limit(8)
            ->get(['id', 'ticket_number', 'title', 'status', 'priority', 'updated_at'])
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
                'updated_at' => optional($ticket->updated_at)->diffForHumans(),
            ]);

        return Inertia::render('ClientPortal/Dashboard', [
            'summary' => $summary,
            'recentTickets' => $recentTickets,
            'can' => [
                'viewAssets' => (bool) $profile->can_view_assets,
                'viewContacts' => (bool) $profile->can_manage_contacts,
                'createTickets' => (bool) $profile->can_create_tickets,
            ],
        ]);
    }
}
