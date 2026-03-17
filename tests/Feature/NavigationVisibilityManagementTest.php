<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use App\Support\RoleNavigationVisibility;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class NavigationVisibilityManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_super_admin_can_access_navigation_visibility_management(): void
    {
        foreach (Roles::all() as $roleName) {
            Role::create(['name' => $roleName]);
        }

        $staff = User::factory()->create();
        $staff->assignRole(Roles::STAFF);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole(Roles::SUPER_ADMIN);

        $this->actingAs($staff)->get('/administration/navigation-visibility')->assertForbidden();
        $this->actingAs($superAdmin)->get('/administration/navigation-visibility')->assertOk();
    }

    public function test_super_admin_can_update_role_navigation_visibility_rules(): void
    {
        foreach (Roles::all() as $roleName) {
            Role::create(['name' => $roleName]);
        }

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole(Roles::SUPER_ADMIN);

        $payload = RoleNavigationVisibility::defaults();
        $payload[Roles::ADMIN]['reports'] = false;
        $payload[Roles::ADMIN]['clients'] = false;

        $this->actingAs($superAdmin)
            ->patch('/administration/navigation-visibility', ['visibility' => $payload])
            ->assertRedirect();

        $record = AppSetting::query()->where('key', RoleNavigationVisibility::KEY)->first();

        $this->assertNotNull($record);
        $this->assertFalse($record->value[Roles::ADMIN]['reports']);
        $this->assertFalse($record->value[Roles::ADMIN]['clients']);

        $admin = User::factory()->create();
        $admin->assignRole(Roles::ADMIN);

        $this->actingAs($admin)
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->get('/dashboard')
            ->assertOk()
            ->assertDontSee('"key":"reports"')
            ->assertDontSee('"key":"clients"');
    }
}
