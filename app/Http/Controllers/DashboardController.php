<?php

namespace App\Http\Controllers;

use App\Enums\AssetStatus;
use App\Enums\ClientStatus;
use App\Enums\ServiceStatus;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\Service;
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
            'assets' => $user->can('viewAny', Asset::class),
            'services' => $user->can('viewAny', Service::class),
            'clients' => $user->can('viewAny', ClientCompany::class),
            'activity' => $user->hasAnyRole(['super-admin', 'admin', 'staff']),
        ];

        $openTicketStatuses = [TicketStatus::New->value, TicketStatus::Open->value, TicketStatus::InProgress->value, TicketStatus::PendingClient->value];
        $resolvedTicketStatuses = [TicketStatus::Resolved->value, TicketStatus::Closed->value];
        $today = now()->startOfDay();
        $renewalWindowEnd = now()->addDays(30)->endOfDay();

        $summaryCards = array_values(array_filter([
            $can['tickets'] ? [
                'key' => 'open_tickets',
                'label' => 'Open Tickets',
                'value' => Ticket::query()->whereIn('status', $openTicketStatuses)->count(),
                'hint' => 'Tickets currently being worked.',
                'badge' => 'warning',
                'href' => '/tickets?status=open',
            ] : null,
            $can['tickets'] ? [
                'key' => 'overdue_tickets',
                'label' => 'Overdue Tickets',
                'value' => Ticket::query()->whereNotIn('status', $resolvedTicketStatuses)->whereNotNull('resolution_due_at')->where('resolution_due_at', '<', now())->count(),
                'hint' => 'Resolution deadline has already passed.',
                'badge' => 'destructive',
                'href' => '/tickets',
            ] : null,
            $can['tickets'] ? [
                'key' => 'awaiting_client_tickets',
                'label' => 'Awaiting Client',
                'value' => Ticket::query()->where('status', TicketStatus::PendingClient->value)->count(),
                'hint' => 'Blocked waiting for client response.',
                'badge' => 'info',
                'href' => '/tickets?status=pending_client',
            ] : null,
            $can['assets'] ? [
                'key' => 'assets_expiring_soon',
                'label' => 'Assets Expiring Soon',
                'value' => Asset::query()->where('status', '!=', AssetStatus::Retired->value)->whereBetween('renewal_date', [$today, $renewalWindowEnd])->count(),
                'hint' => 'Renewals in the next 30 days.',
                'badge' => 'warning',
                'href' => '/assets',
            ] : null,
            $can['services'] ? [
                'key' => 'services_renewing_soon',
                'label' => 'Services Renewing Soon',
                'value' => Service::query()->where('status', '!=', ServiceStatus::Retired->value)->whereBetween('renewal_date', [$today, $renewalWindowEnd])->count(),
                'hint' => 'Contract renewals due in 30 days.',
                'badge' => 'info',
                'href' => '/services',
            ] : null,
            $can['clients'] ? [
                'key' => 'active_clients',
                'label' => 'Active Clients',
                'value' => ClientCompany::query()->where('status', ClientStatus::Active->value)->count(),
                'hint' => 'Clients marked with active status.',
                'badge' => 'success',
                'href' => '/clients',
            ] : null,
            $can['tickets'] ? [
                'key' => 'high_priority_tickets',
                'label' => 'High Priority Tickets',
                'value' => Ticket::query()->whereNotIn('status', $resolvedTicketStatuses)->whereIn('priority', [TicketPriority::High->value, TicketPriority::Urgent->value])->count(),
                'hint' => 'Urgent + high tickets still active.',
                'badge' => 'destructive',
                'href' => '/tickets?priority=high',
            ] : null,
        ]));

        $priorityQueue = $can['tickets']
            ? Ticket::query()->select(['id', 'ticket_number', 'title', 'client_company_id', 'priority', 'status', 'updated_at'])
                ->with('clientCompany:id,name')
                ->whereIn('status', $openTicketStatuses)
                ->whereIn('priority', [TicketPriority::Urgent->value, TicketPriority::High->value])
                ->orderByRaw("CASE WHEN priority = ? THEN 0 ELSE 1 END", [TicketPriority::Urgent->value])
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

        $renewalWatch = [
            'assets' => $can['assets']
                ? Asset::query()->select(['id', 'name', 'asset_code', 'client_company_id', 'status', 'renewal_date'])
                    ->with('clientCompany:id,name')
                    ->where('status', '!=', AssetStatus::Retired->value)
                    ->whereBetween('renewal_date', [$today, $renewalWindowEnd])
                    ->orderBy('renewal_date')
                    ->limit(8)
                    ->get()
                    ->map(fn (Asset $asset) => [
                        'id' => $asset->id,
                        'name' => $asset->name,
                        'asset_code' => $asset->asset_code,
                        'client_name' => $asset->clientCompany?->name,
                        'status' => $asset->status?->value,
                        'renewal_date' => optional($asset->renewal_date)?->toDateString(),
                    ])
                : collect(),
            'services' => $can['services']
                ? Service::query()->select(['id', 'name', 'client_company_id', 'status', 'renewal_cycle', 'renewal_date'])
                    ->with('clientCompany:id,name')
                    ->where('status', '!=', ServiceStatus::Retired->value)
                    ->whereBetween('renewal_date', [$today, $renewalWindowEnd])
                    ->orderBy('renewal_date')
                    ->limit(8)
                    ->get()
                    ->map(fn (Service $service) => [
                        'id' => $service->id,
                        'name' => $service->name,
                        'client_name' => $service->clientCompany?->name,
                        'status' => $service->status?->value,
                        'renewal_cycle' => $service->renewal_cycle,
                        'renewal_date' => optional($service->renewal_date)?->toDateString(),
                    ])
                : collect(),
        ];

        $quickLinks = array_values(array_filter([
            $can['tickets'] ? ['label' => 'Tickets Queue', 'description' => 'Review and update active tickets.', 'href' => '/tickets'] : null,
            $can['clients'] ? ['label' => 'Clients', 'description' => 'Manage account records and contacts.', 'href' => '/clients'] : null,
            $can['assets'] ? ['label' => 'Assets', 'description' => 'Monitor inventory and upcoming renewals.', 'href' => '/assets'] : null,
            $can['services'] ? ['label' => 'Services', 'description' => 'Track service lifecycle and contracts.', 'href' => '/services'] : null,
            $can['activity'] ? ['label' => 'Activity Log', 'description' => 'Audit important operational events.', 'href' => '/activity'] : null,
        ]));

        return Inertia::render('Dashboard/Index', compact('summaryCards', 'priorityQueue', 'awaitingClientTickets', 'renewalWatch', 'quickLinks'));
    }
}
