<?php

namespace Tests\Feature;

use App\Models\ClientCompany;
use App\Models\ClientUserProfile;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SuperAdminUserRoleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_super_admin_cannot_access_user_management_pages(): void
    {
        Role::create(['name' => Roles::ADMIN]);
        Role::create(['name' => Roles::SUPER_ADMIN]);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $this->actingAs($admin)->get('/administration/users')->assertForbidden();
        $this->actingAs($admin)->get('/administration/roles')->assertForbidden();
    }

    public function test_super_admin_can_create_staff_and_client_users_from_management_module(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);
        Role::create(['name' => Roles::STAFF]);
        Role::create(['name' => Roles::CLIENT_USER]);

        $super = User::factory()->create();
        $super->assignRole(Roles::SUPER_ADMIN);

        $company = ClientCompany::factory()->create();

        $this->actingAs($super)->post('/administration/users/staff', [
            'name' => 'Ops Staff',
            'email' => 'ops-staff@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => [Roles::STAFF],
        ])->assertRedirect();

        $staff = User::query()->where('email', 'ops-staff@example.com')->first();
        $this->assertNotNull($staff);
        $this->assertTrue($staff->hasRole(Roles::STAFF));

        $this->actingAs($super)->post('/administration/users/client', [
            'name' => 'Client Portal User',
            'email' => 'client-portal@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'client_company_id' => $company->id,
            'role_label' => 'Client User',
            'can_view_all_company_tickets' => false,
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => false,
        ])->assertRedirect();

        $clientUser = User::query()->where('email', 'client-portal@example.com')->first();
        $this->assertNotNull($clientUser);
        $this->assertTrue($clientUser->hasRole(Roles::CLIENT_USER));

        $profile = ClientUserProfile::query()->where('user_id', $clientUser->id)->first();
        $this->assertNotNull($profile);
        $this->assertSame($company->id, $profile->client_company_id);
    }

    public function test_super_admin_can_create_and_update_custom_roles_with_permissions(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);
        Permission::create(['name' => 'tickets.view', 'guard_name' => 'web']);
        Permission::create(['name' => 'tickets.update', 'guard_name' => 'web']);

        $super = User::factory()->create();
        $super->assignRole(Roles::SUPER_ADMIN);

        $this->actingAs($super)->post('/administration/roles', [
            'name' => 'custom_ops',
            'permissions' => ['tickets.view'],
        ])->assertRedirect();

        $role = Role::query()->where('name', 'custom_ops')->first();
        $this->assertNotNull($role);
        $this->assertTrue($role->hasPermissionTo('tickets.view'));

        $this->actingAs($super)->patch('/administration/roles/'.$role->id, [
            'name' => 'custom_ops',
            'permissions' => ['tickets.view', 'tickets.update'],
        ])->assertRedirect();

        $role->refresh();
        $this->assertTrue($role->hasPermissionTo('tickets.update'));
    }
}
