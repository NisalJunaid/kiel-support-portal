<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\AssetType;
use App\Models\ClientCompany;
use App\Models\User;
use App\Support\AssetMetaFields;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Asset::class);

        $search = trim((string) $request->string('search'));

        $assets = Asset::query()
            ->with(['clientCompany:id,name', 'type:id,name'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('asset_code', 'like', "%{$search}%")
                        ->orWhere('vendor', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Asset $asset) => [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_code' => $asset->asset_code,
                'status' => $asset->status?->value,
                'criticality' => $asset->criticality?->value,
                'renewal_date' => optional($asset->renewal_date)?->toDateString(),
                'client' => $asset->clientCompany,
                'type' => $asset->type,
                'type_slug' => $asset->type?->slug,
            ]);

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'filters' => ['search' => $search],
            'can' => [
                'create' => $request->user()->can('create', Asset::class),
                'update' => $request->user()->can('assets.update'),
                'delete' => $request->user()->can('assets.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Asset::class);

        return Inertia::render('Assets/Create', [
            'formData' => $this->formData((int) $request->integer('client')),
            'metaFieldsByType' => AssetMetaFields::definitions(),
        ]);
    }

    public function store(StoreAssetRequest $request): RedirectResponse
    {
        $asset = Asset::create($request->validated());

        activity('assets')
            ->performedOn($asset)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['asset_code' => $asset->asset_code])
            ->log('Asset created');

        return redirect()->route('assets.show', $asset)->with('success', 'Asset created successfully.');
    }

    public function show(Request $request, Asset $asset): Response
    {
        $this->authorize('view', $asset);

        $asset->load([
            'clientCompany:id,name,client_code',
            'type:id,name,slug',
            'parent:id,name,asset_code',
            'children:id,parent_asset_id,name,asset_code,status,criticality',
            'assignedStaff:id,name,email',
        ]);

        $activity = Activity::query()
            ->where('subject_type', Asset::class)
            ->where('subject_id', $asset->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Assets/Show', [
            'asset' => [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_code' => $asset->asset_code,
                'status' => $asset->status?->value,
                'criticality' => $asset->criticality?->value,
                'service_category' => $asset->service_category,
                'environment' => $asset->environment,
                'start_date' => optional($asset->start_date)?->toDateString(),
                'renewal_date' => optional($asset->renewal_date)?->toDateString(),
                'end_date' => optional($asset->end_date)?->toDateString(),
                'vendor' => $asset->vendor,
                'notes' => $asset->notes,
                'meta' => $asset->meta ?? [],
                'client' => $asset->clientCompany,
                'type' => $asset->type,
                'type_slug' => $asset->type?->slug,
                'parent' => $asset->parent,
                'children' => $asset->children->map(fn (Asset $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'asset_code' => $child->asset_code,
                    'status' => $child->status?->value,
                    'criticality' => $child->criticality?->value,
                ])->values(),
                'assigned_staff' => $asset->assignedStaff,
                'created_at' => optional($asset->created_at)?->toDateTimeString(),
                'updated_at' => optional($asset->updated_at)?->toDateTimeString(),
            ],
            'activity' => $activity->map(fn (Activity $item) => [
                'id' => $item->id,
                'event' => $item->event,
                'description' => $item->description,
                'causer_name' => $item->causer?->name,
                'created_at' => optional($item->created_at)?->toDateTimeString(),
            ])->values(),
            'linkedTickets' => [],
            'metaFieldsByType' => AssetMetaFields::definitions(),
            'can' => [
                'update' => $request->user()->can('update', $asset),
                'delete' => $request->user()->can('delete', $asset),
            ],
        ]);
    }

    public function edit(Asset $asset): Response
    {
        $this->authorize('update', $asset);

        return Inertia::render('Assets/Edit', [
            'asset' => $asset,
            'formData' => $this->formData(null, $asset),
            'metaFieldsByType' => AssetMetaFields::definitions(),
        ]);
    }

    public function update(UpdateAssetRequest $request, Asset $asset): RedirectResponse
    {
        $asset->update($request->validated());

        activity('assets')
            ->performedOn($asset)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['asset_code' => $asset->asset_code])
            ->log('Asset updated');

        return redirect()->route('assets.show', $asset)->with('success', 'Asset updated successfully.');
    }

    public function destroy(Request $request, Asset $asset): RedirectResponse
    {
        $this->authorize('delete', $asset);

        $asset->delete();

        activity('assets')
            ->performedOn($asset)
            ->causedBy($request->user())
            ->event('archived')
            ->withProperties(['asset_code' => $asset->asset_code])
            ->log('Asset archived');

        return redirect()->route('assets.index')->with('success', 'Asset archived successfully.');
    }

    private function formData(?int $defaultClientId = null, ?Asset $asset = null): array
    {
        $clients = ClientCompany::query()->orderBy('name')->get(['id', 'name']);
        $assetTypes = AssetType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']);
        $parents = Asset::query()
            ->when($asset, fn ($query) => $query->where('id', '!=', $asset->id))
            ->orderBy('name')
            ->get(['id', 'name', 'asset_code', 'client_company_id']);
        $staff = User::query()->role(['super-admin', 'admin', 'staff', 'support-agent', 'asset-manager'])->orderBy('name')->get(['id', 'name']);

        return [
            'clients' => $clients,
            'assetTypes' => $assetTypes,
            'parentAssets' => $parents,
            'staff' => $staff,
            'defaultClientId' => $defaultClientId,
        ];
    }
}
