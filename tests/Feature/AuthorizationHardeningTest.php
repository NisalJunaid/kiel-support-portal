<?php

namespace Tests\Feature;

use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_user_cannot_access_staff_workspace_routes(): void
    {
        Role::create(['name' => Roles::CLIENT_USER]);

        $user = User::factory()->create();
        $user->assignRole(Roles::CLIENT_USER);

        ClientUserProfile::query()->create([
            'user_id' => $user->id,
            'client_company_id' => ClientCompany::factory()->create()->id,
            'role_label' => 'Client User',
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => true,
        ]);

        $this->actingAs($user)->get('/dashboard')->assertForbidden();
        $this->actingAs($user)->get('/clients')->assertForbidden();
        $this->actingAs($user)->get('/notifications')->assertForbidden();
    }

    public function test_client_contact_portal_requires_manage_contacts_flag(): void
    {
        Role::create(['name' => Roles::CLIENT_USER]);

        $company = ClientCompany::factory()->create();
        ClientContact::factory()->create(['client_company_id' => $company->id]);

        $user = User::factory()->create();
        $user->assignRole(Roles::CLIENT_USER);

        ClientUserProfile::query()->create([
            'user_id' => $user->id,
            'client_company_id' => $company->id,
            'role_label' => 'Client User',
            'can_manage_contacts' => false,
        ]);

        $this->actingAs($user)->get('/portal/contacts')->assertForbidden();

        $user->clientUserProfile()->update(['can_manage_contacts' => true]);

        $this->actingAs($user)->get('/portal/contacts')->assertOk();
    }
}
