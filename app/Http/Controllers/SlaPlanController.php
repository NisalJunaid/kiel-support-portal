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

        return redirect()->route('sla-plans.index')->with('success', "SLA plan {$plan->name} created.");
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

        return redirect()->route('sla-plans.index')->with('success', 'SLA plan updated.');
    }

    public function destroy(Request $request, SlaPlan $slaPlan): RedirectResponse
    {
        $this->authorize('delete', $slaPlan);

        $slaPlan->delete();

        return redirect()->route('sla-plans.index')->with('success', 'SLA plan archived.');
    }
}
