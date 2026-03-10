<?php

namespace App\Http\Controllers;

use App\Enums\ClientStatus;
use App\Enums\TicketStatus;
use App\Models\ClientCompany;
use App\Models\Ticket;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = request()->user();
        $can = [
            'tickets' => $user->can('viewAny', Ticket::class),
            'clients' => $user->can('viewAny', ClientCompany::class),
        ];

        $openTicketStatuses = [TicketStatus::New->value, TicketStatus::Open->value, TicketStatus::InProgress->value, TicketStatus::PendingClient->value];
        $resolvedTicketStatuses = [TicketStatus::Resolved->value, TicketStatus::Closed->value];

        $summaryCards = array_values(array_filter([
            $can['tickets'] ? [
                'key' => 'open_tickets',
                'label' => 'Open Tickets',
                'value' => Ticket::query()->whereIn('status', $openTicketStatuses)->count(),
                'hint' => 'Tickets currently in progress or waiting updates.',
                'href' => '/tickets?status=open',
            ] : null,
            $can['tickets'] ? [
                'key' => 'overdue_tickets',
                'label' => 'Overdue Tickets',
                'value' => Ticket::query()->whereNotIn('status', $resolvedTicketStatuses)->whereNotNull('resolution_due_at')->where('resolution_due_at', '<', now())->count(),
                'hint' => 'Resolution deadline has already passed.',
                'href' => '/tickets',
            ] : null,
            $can['tickets'] ? [
                'key' => 'awaiting_client_tickets',
                'label' => 'Awaiting Client',
                'value' => Ticket::query()->where('status', TicketStatus::PendingClient->value)->count(),
                'hint' => 'Blocked waiting for client response.',
                'href' => '/tickets?status=pending_client',
            ] : null,
            $can['clients'] ? [
                'key' => 'active_clients',
                'label' => 'Active Clients',
                'value' => ClientCompany::query()->where('status', ClientStatus::Active->value)->count(),
                'hint' => 'Clients marked with active status.',
                'href' => '/clients',
            ] : null,
        ]));

        $recentOpenTickets = $can['tickets']
            ? Ticket::query()->select(['id', 'ticket_number', 'title', 'client_company_id', 'priority', 'status', 'updated_at'])
                ->with('clientCompany:id,name')
                ->whereIn('status', $openTicketStatuses)
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->map(fn (Ticket $ticket) => [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'client_name' => $ticket->clientCompany?->name,
                    'priority' => $ticket->priority?->value,
                    'status' => $ticket->status?->value,
                    'updated_at' => optional($ticket->updated_at)?->diffForHumans(),
                ])
            : collect();

        $awaitingClientTickets = $can['tickets']
            ? Ticket::query()->select(['id', 'ticket_number', 'title', 'client_company_id', 'updated_at'])
                ->with('clientCompany:id,name')
                ->where('status', TicketStatus::PendingClient->value)
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->map(fn (Ticket $ticket) => [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'client_name' => $ticket->clientCompany?->name,
                    'updated_at' => optional($ticket->updated_at)?->diffForHumans(),
                ])
            : collect();

        return Inertia::render('Dashboard/Index', compact('summaryCards', 'recentOpenTickets', 'awaitingClientTickets'));
    }
}
