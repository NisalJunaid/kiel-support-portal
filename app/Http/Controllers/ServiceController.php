<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\Service;
use App\Models\SlaPlan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Support\ActivityPresenter;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Service::class);

        $search = trim((string) $request->string('search'));
        $clientId = $request->integer('client_company_id') ?: null;
        $serviceType = $request->string('service_type')->toString();
        $status = $request->string('status')->toString();

        $services = Service::query()
            ->with(['clientCompany:id,name', 'assets:id,name,asset_code,status', 'slaPlan:id,name'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('service_type', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->when($clientId, fn ($query) => $query->where('client_company_id', $clientId))
            ->when($serviceType, fn ($query) => $query->where('service_type', $serviceType))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'service_type' => $service->service_type?->value,
                'status' => $service->status?->value,
                'renewal_cycle' => $service->renewal_cycle,
                'renewal_date' => optional($service->renewal_date)?->toDateString(),
                'client' => $service->clientCompany,
                'assets' => $service->assets->map(fn (Asset $asset) => [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'asset_code' => $asset->asset_code,
                ])->values(),
            ]);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'filters' => [
                'search' => $search,
                'client_company_id' => $clientId,
                'service_type' => $serviceType,
                'status' => $status,
            ],
            'clients' => ClientCompany::query()->orderBy('name')->get(['id', 'name']),
            'can' => [
                'create' => $request->user()->can('create', Service::class),
                'update' => $request->user()->can('services.update'),
                'delete' => $request->user()->can('services.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Service::class);

        return Inertia::render('Services/Create', [
            'formData' => $this->formData((int) $request->integer('client')),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $assetIds = $data['asset_ids'] ?? [];
        unset($data['asset_ids']);

        $service = Service::create($data);
        $service->assets()->sync($assetIds);

        activity('services')
            ->performedOn($service)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties([
                'asset_ids' => $assetIds,
                'client_company_id' => $service->client_company_id,
            ])
            ->log('Service created');

        return redirect()->route('services.show', $service)->with('success', 'Service created successfully.');
    }

    public function show(Request $request, Service $service): Response
    {
        $this->authorize('view', $service);

        $service->load([
            'clientCompany:id,name,client_code',
            'assets:id,name,asset_code,status,criticality,client_company_id',
            'slaPlan:id,name,response_minutes,resolution_minutes',
        ]);

        $activity = Activity::query()
            ->where('subject_type', Service::class)
            ->where('subject_id', $service->id)
            ->when($clientId, fn ($query) => $query->where('client_company_id', $clientId))
            ->when($serviceType, fn ($query) => $query->where('service_type', $serviceType))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Services/Show', [
            'service' => [
                'id' => $service->id,
                'client_company_id' => $service->client_company_id,
                'name' => $service->name,
                'service_type' => $service->service_type?->value,
                'status' => $service->status?->value,
                'sla_plan_id' => $service->sla_plan_id,
                'sla_plan' => $service->slaPlan ? ['id' => $service->slaPlan->id, 'name' => $service->slaPlan->name] : null,
                'renewal_cycle' => $service->renewal_cycle,
                'start_date' => optional($service->start_date)?->toDateString(),
                'renewal_date' => optional($service->renewal_date)?->toDateString(),
                'end_date' => optional($service->end_date)?->toDateString(),
                'notes' => $service->notes,
                'client' => $service->clientCompany,
                'assets' => $service->assets->map(fn (Asset $asset) => [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'asset_code' => $asset->asset_code,
                    'status' => $asset->status?->value,
                    'criticality' => $asset->criticality?->value,
                ])->values(),
                'created_at' => optional($service->created_at)?->toDateTimeString(),
                'updated_at' => optional($service->updated_at)?->toDateTimeString(),
            ],
            'activity' => $activity->map(fn (Activity $item) => ActivityPresenter::forTimeline($item))->values(),
            'can' => [
                'update' => $request->user()->can('update', $service),
                'delete' => $request->user()->can('delete', $service),
            ],
        ]);
    }

    public function edit(Service $service): Response
    {
        $this->authorize('update', $service);

        $service->load('assets:id');

        return Inertia::render('Services/Edit', [
            'service' => [
                ...$service->toArray(),
                'service_type' => $service->service_type?->value,
                'status' => $service->status?->value,
                'start_date' => optional($service->start_date)?->toDateString(),
                'renewal_date' => optional($service->renewal_date)?->toDateString(),
                'end_date' => optional($service->end_date)?->toDateString(),
                'asset_ids' => $service->assets->pluck('id')->values(),
            ],
            'formData' => $this->formData(),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $data = $request->validated();
        $assetIds = $data['asset_ids'] ?? [];
        unset($data['asset_ids']);

        $service->update($data);
        $service->assets()->sync($assetIds);

        activity('services')
            ->performedOn($service)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties([
                'asset_ids' => $assetIds,
                'client_company_id' => $service->client_company_id,
            ])
            ->log('Service updated');

        return redirect()->route('services.show', $service)->with('success', 'Service updated successfully.');
    }

    public function destroy(Request $request, Service $service): RedirectResponse
    {
        $this->authorize('delete', $service);

        $service->delete();

        activity('services')
            ->performedOn($service)
            ->causedBy($request->user())
            ->event('archived')
            ->log('Service archived');

        return redirect()->route('services.index')->with('success', 'Service archived successfully.');
    }

    private function formData(?int $defaultClientId = null): array
    {
        $clients = ClientCompany::query()->orderBy('name')->get(['id', 'name']);

        $assets = Asset::query()
            ->orderBy('name')
            ->get(['id', 'name', 'asset_code', 'client_company_id']);

        return [
            'clients' => $clients,
            'assets' => $assets,
            'slaPlans' => SlaPlan::query()->orderBy('name')->get(['id', 'name']),
            'defaultClientId' => $defaultClientId,
        ];
    }
}
