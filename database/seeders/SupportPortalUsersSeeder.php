<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

class SupportPortalUsersSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUser(
            name: 'Admin User',
            email: 'admin@mail.com',
            password: 'password',
            role: Roles::ADMIN,
        );

        $this->seedUser(
            name: 'Client User',
            email: 'client@mail.com',
            password: 'password',
            role: Roles::CLIENT_USER,
        );
    }

    private function seedUser(string $name, string $email, string $password, string $role): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
            ],
        );

        if (! class_exists(Role::class) || ! Schema::hasTable('roles')) {
            return;
        }

        Role::query()->firstOrCreate([
            'name' => $role,
            'guard_name' => 'web',
        ]);

        $user->syncRoles([$role]);
    }
}
