<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClientUserRequest;
use App\Http\Requests\UpdateClientUserRequest;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use App\Support\ActivityPresenter;

class ClientUserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ClientUserProfile::class);

        $search = trim((string) $request->string('search'));
        $clientId = $request->integer('client_company_id') ?: null;

        $clientUsers = ClientUserProfile::query()
            ->with(['user:id,name,email', 'clientCompany:id,name', 'contact:id,full_name'])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('user', fn ($userQ) => $userQ
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($clientId, fn ($query) => $query->where('client_company_id', $clientId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ClientUserProfile $profile) => [
                'id' => $profile->id,
                'name' => $profile->user?->name,
                'email' => $profile->user?->email,
                'client_company' => $profile->clientCompany,
                'contact' => $profile->contact,
                'role_label' => $profile->role_label,
                'can_view_all_company_tickets' => $profile->can_view_all_company_tickets,
                'can_create_tickets' => $profile->can_create_tickets,
                'can_view_assets' => $profile->can_view_assets,
                'can_manage_contacts' => $profile->can_manage_contacts,
            ]);

        return Inertia::render('ClientUsers/Index', [
            'clientUsers' => $clientUsers,
            'filters' => [
                'search' => $search,
                'client_company_id' => $clientId,
            ],
            'clients' => $this->clientOptions(),
            'can' => [
                'create' => $request->user()->can('create', ClientUserProfile::class),
                'update' => $request->user()->can('client-users.update'),
                'delete' => $request->user()->can('client-users.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ClientUserProfile::class);

        return Inertia::render('ClientUsers/Create', [
            'clients' => $this->clientOptions(),
            'contacts' => $this->contactOptions(),
            'defaults' => [
                'client_company_id' => $request->integer('client') ?: null,
                'can_view_all_company_tickets' => false,
                'can_create_tickets' => true,
                'can_view_assets' => true,
                'can_manage_contacts' => false,
            ],
        ]);
    }

    public function store(StoreClientUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $profile = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $user->syncRoles([Roles::CLIENT_USER]);

            return ClientUserProfile::create([
                'user_id' => $user->id,
                'client_company_id' => $data['client_company_id'],
                'contact_id' => $data['contact_id'] ?? null,
                'role_label' => $data['role_label'],
                'can_view_all_company_tickets' => $data['can_view_all_company_tickets'],
                'can_create_tickets' => $data['can_create_tickets'],
                'can_view_assets' => $data['can_view_assets'],
                'can_manage_contacts' => $data['can_manage_contacts'],
            ]);
        });

        activity('client-users')
            ->performedOn($profile)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties(['email' => $profile->user?->email])
            ->log('Client user created');

        return redirect()->route('client-users.show', $profile)->with('success', 'Client user created successfully.');
    }

    public function show(Request $request, ClientUserProfile $clientUser): Response
    {
        $this->authorize('view', $clientUser);

        $clientUser->load(['user:id,name,email,created_at', 'clientCompany:id,name', 'contact:id,full_name,email']);

        $activity = Activity::query()
            ->where('subject_type', ClientUserProfile::class)
            ->where('subject_id', $clientUser->id)
            ->latest()
            ->limit(12)
            ->get();

        return Inertia::render('ClientUsers/Show', [
            'clientUser' => [
                'id' => $clientUser->id,
                'name' => $clientUser->user?->name,
                'email' => $clientUser->user?->email,
                'client_company' => $clientUser->clientCompany,
                'contact' => $clientUser->contact,
                'role_label' => $clientUser->role_label,
                'can_view_all_company_tickets' => $clientUser->can_view_all_company_tickets,
                'can_create_tickets' => $clientUser->can_create_tickets,
                'can_view_assets' => $clientUser->can_view_assets,
                'can_manage_contacts' => $clientUser->can_manage_contacts,
                'created_at' => optional($clientUser->created_at)?->toDateTimeString(),
                'updated_at' => optional($clientUser->updated_at)?->toDateTimeString(),
            ],
            'activity' => $activity->map(fn (Activity $item) => ActivityPresenter::forTimeline($item))->values(),
            'can' => [
                'update' => $request->user()->can('update', $clientUser),
                'delete' => $request->user()->can('delete', $clientUser),
            ],
        ]);
    }

    public function edit(ClientUserProfile $clientUser): Response
    {
        $this->authorize('update', $clientUser);

        return Inertia::render('ClientUsers/Edit', [
            'clientUser' => [
                'id' => $clientUser->id,
                'name' => $clientUser->user->name,
                'email' => $clientUser->user->email,
                'client_company_id' => $clientUser->client_company_id,
                'contact_id' => $clientUser->contact_id,
                'role_label' => $clientUser->role_label,
                'can_view_all_company_tickets' => $clientUser->can_view_all_company_tickets,
                'can_create_tickets' => $clientUser->can_create_tickets,
                'can_view_assets' => $clientUser->can_view_assets,
                'can_manage_contacts' => $clientUser->can_manage_contacts,
            ],
            'clients' => $this->clientOptions(),
            'contacts' => $this->contactOptions(),
        ]);
    }

    public function update(UpdateClientUserRequest $request, ClientUserProfile $clientUser): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($clientUser, $data) {
            $clientUser->user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
            ]);

            $clientUser->update([
                'client_company_id' => $data['client_company_id'],
                'contact_id' => $data['contact_id'] ?? null,
                'role_label' => $data['role_label'],
                'can_view_all_company_tickets' => $data['can_view_all_company_tickets'],
                'can_create_tickets' => $data['can_create_tickets'],
                'can_view_assets' => $data['can_view_assets'],
                'can_manage_contacts' => $data['can_manage_contacts'],
            ]);

            $clientUser->user->syncRoles([Roles::CLIENT_USER]);
        });

        activity('client-users')
            ->performedOn($clientUser)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties(['email' => $clientUser->user?->email])
            ->log('Client user updated');

        return redirect()->route('client-users.show', $clientUser)->with('success', 'Client user updated successfully.');
    }

    public function destroy(Request $request, ClientUserProfile $clientUser): RedirectResponse
    {
        $this->authorize('delete', $clientUser);

        DB::transaction(function () use ($clientUser, $request) {
            $user = $clientUser->user;
            $clientUser->delete();
            $user?->delete();

            activity('client-users')
                ->performedOn($clientUser)
                ->causedBy($request->user())
                ->event('archived')
                ->withProperties(['email' => $user?->email])
                ->log('Client user archived');
        });

        return redirect()->route('client-users.index')->with('success', 'Client user removed successfully.');
    }

    private function clientOptions(): array
    {
        return ClientCompany::query()->orderBy('name')->get(['id', 'name'])->toArray();
    }

    private function contactOptions(): array
    {
        return ClientContact::query()
            ->orderBy('full_name')
            ->get(['id', 'client_company_id', 'full_name', 'email'])
            ->toArray();
    }
}
