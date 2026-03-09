<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSlaPlanRequest;
use App\Http\Requests\UpdateSlaPlanRequest;
use App\Models\SlaPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SlaPlanController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SlaPlan::class);

        $search = trim((string) $request->string('search'));

        $plans = SlaPlan::query()
            ->withCount(['clients', 'services', 'tickets'])
            ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SlaPlans/Index', [
            'slaPlans' => $plans,
            'filters' => ['search' => $search],
            'can' => [
                'create' => $request->user()->can('create', SlaPlan::class),
                'update' => $request->user()->can('sla-plans.update'),
                'delete' => $request->user()->can('sla-plans.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SlaPlan::class);

        return Inertia::render('SlaPlans/Create');
    }

    public function store(StoreSlaPlanRequest $request): RedirectResponse
    {
        $plan = SlaPlan::create($request->validated());

        return redirect()->route('sla-plans.show', $plan)->with('success', "SLA plan {$plan->name} created.");
    }

    public function show(SlaPlan $slaPlan): Response
    {
        $this->authorize('view', $slaPlan);

        $slaPlan->loadCount(['clients', 'services', 'tickets']);

        $recentClients = $slaPlan->clients()
            ->orderBy('name')
            ->limit(5)
            ->get(['id', 'name', 'status']);

        $recentServices = $slaPlan->services()
            ->orderBy('name')
            ->limit(5)
            ->get(['id', 'name', 'status']);

        $recentTickets = $slaPlan->tickets()
            ->with(['clientCompany:id,name'])
            ->latest('updated_at')
            ->limit(5)
            ->get(['id', 'ticket_number', 'subject', 'status', 'priority', 'client_company_id', 'updated_at']);

        return Inertia::render('SlaPlans/Show', [
            'slaPlan' => [
                'id' => $slaPlan->id,
                'name' => $slaPlan->name,
                'response_minutes' => $slaPlan->response_minutes,
                'resolution_minutes' => $slaPlan->resolution_minutes,
                'business_hours' => $slaPlan->business_hours,
                'escalation_rules' => $slaPlan->escalation_rules,
                'clients_count' => $slaPlan->clients_count,
                'services_count' => $slaPlan->services_count,
                'tickets_count' => $slaPlan->tickets_count,
                'created_at' => optional($slaPlan->created_at)->toDateTimeString(),
                'updated_at' => optional($slaPlan->updated_at)->toDateTimeString(),
            ],
            'usage' => [
                'clients' => $recentClients,
                'services' => $recentServices,
                'tickets' => $recentTickets,
            ],
            'can' => [
                'update' => request()->user()->can('update', $slaPlan),
                'delete' => request()->user()->can('delete', $slaPlan),
            ],
        ]);
    }

    public function edit(SlaPlan $slaPlan): Response
    {
        $this->authorize('update', $slaPlan);

        return Inertia::render('SlaPlans/Edit', [
            'slaPlan' => $slaPlan,
        ]);
    }

    public function update(UpdateSlaPlanRequest $request, SlaPlan $slaPlan): RedirectResponse
    {
        $slaPlan->update($request->validated());

        return redirect()->route('sla-plans.show', $slaPlan)->with('success', 'SLA plan updated.');
    }

    public function destroy(Request $request, SlaPlan $slaPlan): RedirectResponse
    {
        $this->authorize('delete', $slaPlan);

        $slaPlan->delete();

        return redirect()->route('sla-plans.index')->with('success', 'SLA plan archived.');
    }
}
