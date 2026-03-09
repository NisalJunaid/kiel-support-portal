<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'clients.view',
            'clients.create',
            'clients.update',
            'clients.delete',
            'contacts.view',
            'contacts.create',
            'contacts.update',
            'contacts.delete',
            'client-users.view',
            'client-users.create',
            'client-users.update',
            'client-users.delete',
            'assets.view',
            'assets.create',
            'assets.update',
            'assets.delete',
            'services.view',
            'services.create',
            'services.update',
            'services.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        foreach (Roles::all() as $role) {
            $roleModel = Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);

            if (in_array($role, [Roles::SUPER_ADMIN, Roles::ADMIN, Roles::STAFF], true)) {
                $roleModel->givePermissionTo($permissions);
            }

            if ($role === Roles::SUPPORT_AGENT) {
                $roleModel->givePermissionTo(['clients.view']);
            }
        }

        $adminEmail = config('auth.bootstrap_admin.email', env('BOOTSTRAP_ADMIN_EMAIL', 'admin@kiel.local'));
        $adminName = config('auth.bootstrap_admin.name', env('BOOTSTRAP_ADMIN_NAME', 'Kiel Super Admin'));
        $adminPassword = config('auth.bootstrap_admin.password', env('BOOTSTRAP_ADMIN_PASSWORD', 'password'));

        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            ['name' => $adminName, 'password' => Hash::make($adminPassword)],
        );

        $admin->assignRole(Roles::SUPER_ADMIN);
    }
}
