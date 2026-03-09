<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientCompanyRequest;
use App\Http\Requests\UpdateClientCompanyRequest;
use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\Service;
use App\Models\SlaPlan;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Support\ActivityPresenter;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Inertia\Response;

class ClientCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ClientCompany::class);

        $search = trim((string) $request->string('search'));

        $clients = ClientCompany::query()
            ->with('accountManager:id,name')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('legal_name', 'like', "%{$search}%")
                        ->orWhere('client_code', 'like', "%{$search}%")
                        ->orWhere('primary_email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (ClientCompany $client) => [
                'id' => $client->id,
                'name' => $client->name,
                'client_code' => $client->client_code,
                'status' => $client->status,
                'primary_email' => $client->primary_email,
                'account_manager' => $client->accountManager?->name,
                'can' => [
                    'update' => $request->user()->can('update', $client),
                    'delete' => $request->user()->can('delete', $client),
                ],
            ]);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => [
                'search' => $search,
            ],
            'can' => [
                'create' => $request->user()->can('create', ClientCompany::class),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClientCompany::class);

        return Inertia::render('Clients/Create', [
            'managers' => $this->accountManagers(),
            'slaPlans' => SlaPlan::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreClientCompanyRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $client = ClientCompany::create($data);

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company created');

        return redirect()->route('clients.show', $client)->with('success', 'Client company created successfully.');
    }

    public function show(Request $request, ClientCompany $client): Response
    {
        $this->authorize('view', $client);

        $client->load([
            'accountManager:id,name,email',
            'slaPlan:id,name,response_minutes,resolution_minutes',
            'contacts' => fn ($query) => $query->orderByDesc('is_active')->orderBy('full_name'),
            'clientUsers.user:id,name,email',
            'clientUsers.contact:id,full_name',
            'assets:id,client_company_id,name,asset_code,status,criticality,asset_type_id,renewal_date',
            'assets.type:id,name',
            'services' => fn ($query) => $query->with('assets:id,name,asset_code')->orderBy('name'),
            'tickets' => fn ($query) => $query->with(['asset:id,name,asset_code','assignedUser:id,name'])->latest()->limit(10),
        ]);

        $activity = Activity::query()
            ->where('subject_type', ClientCompany::class)
            ->where('subject_id', $client->id)
            ->latest()
            ->limit(10)
            ->get();

        $canManageWorkspace = $request->user()->hasAnyRole(['super-admin', 'admin', 'staff', 'support-agent']);

        return Inertia::render('Clients/Show', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'legal_name' => $client->legal_name,
                'client_code' => $client->client_code,
                'industry' => $client->industry,
                'status' => $client->status,
                'website' => $client->website,
                'primary_email' => $client->primary_email,
                'phone' => $client->phone,
                'billing_address' => $client->billing_address,
                'technical_address' => $client->technical_address,
                'timezone' => $client->timezone,
                'notes' => $client->notes,
                'onboarded_at' => optional($client->onboarded_at)?->toDateString(),
                'account_manager' => $client->accountManager,
                'sla_plan_id' => $client->sla_plan_id,
                'sla_plan' => $client->slaPlan ? ['id' => $client->slaPlan->id, 'name' => $client->slaPlan->name] : null,
                'created_at' => $client->created_at?->toDateString(),
                'updated_at' => $client->updated_at?->toDateString(),
            ],
            'contacts' => $client->contacts->map(fn (ClientContact $contact) => [
                'id' => $contact->id,
                'full_name' => $contact->full_name,
                'email' => $contact->email,
                'contact_type' => $contact->contact_type?->value,
                'is_active' => $contact->is_active,
            ])->values(),
            'client_users' => $client->clientUsers->map(fn (ClientUserProfile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'role_label' => $profile->role_label,
                'contact' => $profile->contact,
                'can_create_tickets' => $profile->can_create_tickets,
                'can_view_assets' => $profile->can_view_assets,
            ])->values(),
            'assets' => $client->assets->map(fn (Asset $asset) => [
                'id' => $asset->id,
                'name' => $asset->name,
                'asset_code' => $asset->asset_code,
                'status' => $asset->status?->value,
                'criticality' => $asset->criticality?->value,
                'renewal_date' => optional($asset->renewal_date)?->toDateString(),
                'type' => $asset->type,
            ])->values(),

            'tickets' => $client->tickets->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
                'asset' => $ticket->asset,
                'assignee' => $ticket->assignedUser,
                'updated_at' => optional($ticket->updated_at)?->diffForHumans(),
            ])->values(),
            'services' => $client->services->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'service_type' => $service->service_type?->value,
                'status' => $service->status?->value,
                'renewal_cycle' => $service->renewal_cycle,
                'renewal_date' => optional($service->renewal_date)?->toDateString(),
                'assets' => $service->assets->map(fn (Asset $asset) => [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'asset_code' => $asset->asset_code,
                ])->values(),
            ])->values(),
            'activity' => $activity->map(fn (Activity $item) => ActivityPresenter::forTimeline($item))->values(),
            'stats' => [
                'contacts_count' => $client->contacts->count(),
                'active_contacts_count' => $client->contacts->where('is_active', true)->count(),
                'users_count' => $client->clientUsers->count(),
                'users_can_create_tickets_count' => $client->clientUsers->where('can_create_tickets', true)->count(),
                'users_can_view_assets_count' => $client->clientUsers->where('can_view_assets', true)->count(),
                'assets_count' => $client->assets->count(),
                'services_count' => $client->services->count(),
                'tickets_count' => $client->tickets->count(),
            ],
            'can' => [
                'update' => $request->user()->can('update', $client),
                'delete' => $request->user()->can('delete', $client),
                'create_contact' => $request->user()->can('create', ClientContact::class),
                'update_contact' => $request->user()->can('contacts.update'),
                'create_client_user' => $request->user()->can('create', ClientUserProfile::class),
                'manage_assets' => $canManageWorkspace,
                'create_asset' => $request->user()->can('create', Asset::class),
                'create_ticket' => $request->user()->can('create', Ticket::class),
                'create_service' => $request->user()->can('create', Service::class),
            ],
        ]);
    }

    public function edit(Request $request, ClientCompany $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'managers' => $this->accountManagers(),
            'slaPlans' => SlaPlan::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateClientCompanyRequest $request, ClientCompany $client): RedirectResponse
    {
        $client->update($request->validated());

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company updated');

        return redirect()->route('clients.show', $client)->with('success', 'Client company updated successfully.');
    }

    public function destroy(Request $request, ClientCompany $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $client->delete();

        activity('clients')
            ->performedOn($client)
            ->causedBy($request->user())
            ->event('archived')
            ->withProperties(['client_code' => $client->client_code])
            ->log('Client company archived');

        return redirect()->route('clients.index')->with('success', 'Client company archived successfully.');
    }

    private function accountManagers(): array
    {
        return User::query()
            ->role(['super-admin', 'admin', 'staff', 'support-agent'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name])
            ->all();
    }
}
