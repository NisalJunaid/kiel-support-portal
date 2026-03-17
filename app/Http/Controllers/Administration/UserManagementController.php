<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administration\StoreClientManagedUserRequest;
use App\Http\Requests\Administration\StoreStaffUserRequest;
use App\Http\Requests\Administration\UpdateClientManagedUserRequest;
use App\Http\Requests\Administration\UpdateStaffUserRequest;
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
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole(Roles::SUPER_ADMIN), 403);

        $search = trim((string) $request->string('search'));
        $type = (string) $request->string('type', 'all');
        $role = trim((string) $request->string('role'));

        $users = User::query()
            ->with(['roles:id,name', 'clientUserProfile.clientCompany:id,name'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, fn ($query) => $query->role($role))
            ->when($type === 'staff', function ($query) {
                $query->whereDoesntHave('clientUserProfile');
            })
            ->when($type === 'client', function ($query) {
                $query->whereHas('clientUserProfile');
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(function (User $user) {
                $profile = $user->clientUserProfile;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $profile ? 'client' : 'staff',
                    'roles' => $user->getRoleNames()->values()->all(),
                    'client_profile' => $profile ? [
                        'id' => $profile->id,
                        'client_company_id' => $profile->client_company_id,
                        'client_company_name' => $profile->clientCompany?->name,
                        'contact_id' => $profile->contact_id,
                        'role_label' => $profile->role_label,
                        'can_view_all_company_tickets' => $profile->can_view_all_company_tickets,
                        'can_create_tickets' => $profile->can_create_tickets,
                        'can_view_assets' => $profile->can_view_assets,
                        'can_manage_contacts' => $profile->can_manage_contacts,
                    ] : null,
                ];
            });

        return Inertia::render('Administration/UserManagement/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'type' => in_array($type, ['all', 'staff', 'client'], true) ? $type : 'all',
                'role' => $role ?: 'all',
            ],
            'roleOptions' => Role::query()->orderBy('name')->get(['id', 'name'])->map(fn (Role $roleItem) => [
                'id' => $roleItem->id,
                'name' => $roleItem->name,
            ])->values(),
            'staffRoleOptions' => Role::query()
                ->where('name', '!=', Roles::CLIENT_USER)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Role $roleItem) => ['id' => $roleItem->id, 'name' => $roleItem->name])
                ->values(),
            'clientCompanies' => ClientCompany::query()->orderBy('name')->get(['id', 'name'])->toArray(),
            'contacts' => ClientContact::query()->orderBy('full_name')->get(['id', 'client_company_id', 'full_name'])->toArray(),
            'defaults' => [
                'client_role_label' => 'Client User',
                'can_view_all_company_tickets' => false,
                'can_create_tickets' => true,
                'can_view_assets' => true,
                'can_manage_contacts' => false,
            ],
        ]);
    }

    public function storeStaff(StoreStaffUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->syncRoles($data['roles']);

        return back()->with('success', 'Staff user created successfully.');
    }

    public function updateStaff(UpdateStaffUserRequest $request, User $user): RedirectResponse
    {
        abort_if($user->clientUserProfile()->exists(), 422, 'Client users must be edited through the client user flow.');

        $data = $request->validated();

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            ...(! empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        $user->syncRoles($data['roles']);

        return back()->with('success', 'Staff user updated successfully.');
    }

    public function storeClient(StoreClientManagedUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $user->syncRoles([Roles::CLIENT_USER]);

            ClientUserProfile::create([
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

        return back()->with('success', 'Client user created successfully.');
    }

    public function updateClient(UpdateClientManagedUserRequest $request, ClientUserProfile $clientUser): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($clientUser, $data) {
            $clientUser->user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                ...(! empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
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

        return back()->with('success', 'Client user updated successfully.');
    }
}
