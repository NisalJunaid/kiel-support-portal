<?php

namespace App\Http\Controllers;

use App\Enums\AssetStatus;
use App\Enums\ServiceStatus;
use App\Enums\TicketStatus;
use App\Models\Asset;
use App\Models\Service;
use App\Models\Ticket;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->startOfDay();
        $windowEnd = now()->addDays(30)->endOfDay();
        $resolvedStatuses = [
            TicketStatus::Resolved->value,
            TicketStatus::Closed->value,
        ];

        $ticketsByStatus = Ticket::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'total' => (int) $row->total,
            ])
            ->values();

        $ticketsByPriority = Ticket::query()
            ->selectRaw('priority, COUNT(*) as total')
            ->groupBy('priority')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'priority' => $row->priority,
                'total' => (int) $row->total,
            ])
            ->values();

        $ticketsByClient = Ticket::query()
            ->selectRaw('client_company_id, COUNT(*) as total')
            ->with('clientCompany:id,name')
            ->groupBy('client_company_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'client_id' => $row->client_company_id,
                'client_name' => $row->clientCompany?->name ?? 'Unknown Client',
                'total' => (int) $row->total,
            ])
            ->values();

        $resolvedTicketsWithSla = Ticket::query()
            ->whereNotNull('resolution_due_at')
            ->whereNotNull('resolved_at')
            ->whereIn('status', $resolvedStatuses);

        $resolvedWithinSla = (clone $resolvedTicketsWithSla)
            ->whereColumn('resolved_at', '<=', 'resolution_due_at')
            ->count();

        $resolvedBreachedSla = (clone $resolvedTicketsWithSla)
            ->whereColumn('resolved_at', '>', 'resolution_due_at')
            ->count();

        $openSlaAtRisk = Ticket::query()
            ->whereNotIn('status', $resolvedStatuses)
            ->whereNotNull('resolution_due_at')
            ->whereBetween('resolution_due_at', [$today, now()->addDays(2)->endOfDay()])
            ->count();

        $openSlaBreached = Ticket::query()
            ->whereNotIn('status', $resolvedStatuses)
            ->whereNotNull('resolution_due_at')
            ->where('resolution_due_at', '<', now())
            ->count();

        $assetsExpiringSoon = Asset::query()
            ->select(['id', 'name', 'asset_code', 'client_company_id', 'status', 'renewal_date'])
            ->with('clientCompany:id,name')
            ->where('status', '!=', AssetStatus::Retired->value)
            ->whereBetween('renewal_date', [$today, $windowEnd])
            ->orderBy('renewal_date')
            ->limit(10)
            ->get()
            ->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_code' => $asset->asset_code,
                'client_name' => $asset->clientCompany?->name,
                'status' => $asset->status?->value,
                'renewal_date' => optional($asset->renewal_date)?->toDateString(),
                'days_until_renewal' => $asset->renewal_date ? Carbon::parse($asset->renewal_date)->diffInDays($today, false) * -1 : null,
            ])
            ->values();

        $servicesRenewingSoon = Service::query()
            ->select(['id', 'name', 'client_company_id', 'status', 'renewal_cycle', 'renewal_date'])
            ->with('clientCompany:id,name')
            ->where('status', '!=', ServiceStatus::Retired->value)
            ->whereBetween('renewal_date', [$today, $windowEnd])
            ->orderBy('renewal_date')
            ->limit(10)
            ->get()
            ->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'client_name' => $service->clientCompany?->name,
                'status' => $service->status?->value,
                'renewal_cycle' => $service->renewal_cycle,
                'renewal_date' => optional($service->renewal_date)?->toDateString(),
                'days_until_renewal' => $service->renewal_date ? Carbon::parse($service->renewal_date)->diffInDays($today, false) * -1 : null,
            ])
            ->values();

        return Inertia::render('Reports/Index', [
            'summary' => [
                'tickets_total' => Ticket::query()->count(),
                'assets_expiring_count' => $assetsExpiringSoon->count(),
                'services_renewing_count' => $servicesRenewingSoon->count(),
                'top_client_ticket_count' => $ticketsByClient->first()['total'] ?? 0,
            ],
            'ticketsByStatus' => $ticketsByStatus,
            'ticketsByPriority' => $ticketsByPriority,
            'ticketsByClient' => $ticketsByClient,
            'slaCompliance' => [
                'is_available' => $resolvedWithinSla + $resolvedBreachedSla > 0 || $openSlaAtRisk > 0 || $openSlaBreached > 0,
                'resolved_within_sla' => $resolvedWithinSla,
                'resolved_breached_sla' => $resolvedBreachedSla,
                'open_at_risk' => $openSlaAtRisk,
                'open_breached' => $openSlaBreached,
            ],
            'assetsExpiringSoon' => $assetsExpiringSoon,
            'servicesRenewingSoon' => $servicesRenewingSoon,
        ]);
    }
}
