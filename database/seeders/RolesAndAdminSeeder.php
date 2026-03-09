<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndAdminSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Roles::all() as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
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
