<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_page_is_accessible(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_authenticated_user_can_login_and_view_dashboard(): void
    {
        $user = User::factory()->create();

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect('/dashboard');

        $this->actingAs($user)->get('/dashboard')->assertOk();
    }

    public function test_only_authorized_roles_can_access_administration_readiness(): void
    {
        Role::create(['name' => Roles::STAFF]);
        Role::create(['name' => Roles::CLIENT_USER]);

        $staff = User::factory()->create();
        $staff->assignRole(Roles::STAFF);

        $clientUser = User::factory()->create();
        $clientUser->assignRole(Roles::CLIENT_USER);

        $this->actingAs($staff)->get('/administration')->assertOk();
        $this->actingAs($clientUser)->get('/administration')->assertForbidden();
    }
}
