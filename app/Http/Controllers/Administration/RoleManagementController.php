<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use App\Support\Roles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleManagementController extends Controller
{
    private const PROTECTED_ROLES = [
        Roles::SUPER_ADMIN,
        Roles::ADMIN,
        Roles::STAFF,
        Roles::SUPPORT_AGENT,
        Roles::ASSET_MANAGER,
        Roles::CLIENT_USER,
    ];

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasRole(Roles::SUPER_ADMIN), 403);

        return Inertia::render('Administration/Roles/Index', [
            'roles' => Role::query()->with('permissions:id,name')->withCount('users')->orderBy('name')->get()->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => $role->users_count,
                'is_protected' => in_array($role->name, self::PROTECTED_ROLES, true),
            ])->values(),
            'permissions' => Permission::query()->orderBy('name')->pluck('name')->values(),
            'protectedRoles' => self::PROTECTED_ROLES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(Roles::SUPER_ADMIN), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('roles', 'name')],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($data['permissions'] ?? []);

        return back()->with('success', 'Role created successfully.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(Roles::SUPER_ADMIN), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        if (in_array($role->name, self::PROTECTED_ROLES, true) && $data['name'] !== $role->name) {
            return back()->with('error', 'This system role name is protected and cannot be renamed.');
        }

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return back()->with('success', 'Role updated successfully.');
    }
}
