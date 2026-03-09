<?php

namespace Tests\Feature;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Enums\ContactType;
use App\Enums\TicketMessageType;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Asset;
use App\Models\AssetType;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SupportPortalCriticalFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_access_is_protected_for_staff_modules(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');

        $staff = $this->createStaffWithPermissions([]);

        $this->actingAs($staff)->withHeaders($this->inertiaHeaders())->get('/dashboard')->assertOk();
    }

    public function test_client_company_crud_permissions_are_enforced(): void
    {
        $unauthorizedStaff = $this->createStaffWithPermissions([]);

        $this->actingAs($unauthorizedStaff)->post('/clients', [
            'name' => 'Unauthorized Co',
            'legal_name' => 'Unauthorized Co LLC',
            'client_code' => 'UNAUTH',
            'status' => 'active',
            'timezone' => 'UTC',
            'primary_email' => 'unauthorized@example.com',
        ])->assertForbidden();

        $authorizedStaff = $this->createStaffWithPermissions(['clients.create', 'clients.update', 'clients.delete']);

        $this->actingAs($authorizedStaff)->post('/clients', [
            'name' => 'Acme Client',
            'legal_name' => 'Acme Client LLC',
            'client_code' => 'ACME',
            'status' => 'active',
            'timezone' => 'UTC',
            'primary_email' => 'contact@acme.test',
        ])->assertRedirect();

        $client = ClientCompany::query()->where('client_code', 'ACME')->firstOrFail();

        $this->actingAs($authorizedStaff)->put("/clients/{$client->id}", [
            'name' => 'Acme Client Updated',
            'legal_name' => $client->legal_name,
            'client_code' => 'ACME',
            'status' => $client->status,
            'primary_email' => 'ops@acme.test',
            'phone' => $client->phone,
            'website' => $client->website,
            'industry' => $client->industry,
            'billing_address' => $client->billing_address,
            'technical_address' => $client->technical_address,
            'timezone' => $client->timezone,
            'onboarded_at' => optional($client->onboarded_at)?->format('Y-m-d'),
            'notes' => $client->notes,
            'account_manager_id' => $client->account_manager_id,
            'sla_plan_id' => $client->sla_plan_id,
        ])->assertRedirect();

        $this->actingAs($authorizedStaff)->delete("/clients/{$client->id}")->assertRedirect('/clients');
        $this->assertSoftDeleted('client_companies', ['id' => $client->id]);
    }

    public function test_contact_crud_permissions_are_enforced(): void
    {
        $client = ClientCompany::factory()->create();

        $unauthorizedStaff = $this->createStaffWithPermissions([]);
        $this->actingAs($unauthorizedStaff)->post('/contacts', [
            'client_company_id' => $client->id,
            'full_name' => 'Unauthorized Contact',
            'email' => 'unauth-contact@test.local',
            'contact_type' => ContactType::Support->value,
            'is_active' => true,
        ])->assertForbidden();

        $authorizedStaff = $this->createStaffWithPermissions(['contacts.create', 'contacts.update', 'contacts.delete']);

        $this->actingAs($authorizedStaff)->post('/contacts', [
            'client_company_id' => $client->id,
            'full_name' => 'Jane Contact',
            'email' => 'jane.contact@test.local',
            'contact_type' => ContactType::Support->value,
            'is_active' => true,
        ])->assertRedirect();

        $contact = ClientContact::query()->where('email', 'jane.contact@test.local')->firstOrFail();

        $this->actingAs($authorizedStaff)->put("/contacts/{$contact->id}", [
            'client_company_id' => $client->id,
            'full_name' => 'Jane Updated',
            'email' => 'jane.updated@test.local',
            'contact_type' => ContactType::Technical->value,
            'is_active' => true,
        ])->assertRedirect();

        $this->actingAs($authorizedStaff)->delete("/contacts/{$contact->id}")->assertRedirect('/contacts');
        $this->assertSoftDeleted('client_contacts', ['id' => $contact->id]);
    }

    public function test_client_user_creation_is_restricted_by_permission_and_company_contact_scope(): void
    {
        $client = ClientCompany::factory()->create();
        $otherClient = ClientCompany::factory()->create();
        $otherClientContact = ClientContact::factory()->create(['client_company_id' => $otherClient->id]);

        $unauthorizedStaff = $this->createStaffWithPermissions([]);
        $this->actingAs($unauthorizedStaff)->post('/client-users', [
            'name' => 'Blocked User',
            'email' => 'blocked-user@test.local',
            'password' => 'password',
            'password_confirmation' => 'password',
            'client_company_id' => $client->id,
            'role_label' => 'Portal User',
            'can_view_all_company_tickets' => false,
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => false,
        ])->assertForbidden();

        $authorizedStaff = $this->createStaffWithPermissions(['client-users.create']);

        $this->actingAs($authorizedStaff)->post('/client-users', [
            'name' => 'Scoped Validation User',
            'email' => 'scoped-user@test.local',
            'password' => 'password',
            'password_confirmation' => 'password',
            'client_company_id' => $client->id,
            'contact_id' => $otherClientContact->id,
            'role_label' => 'Portal User',
            'can_view_all_company_tickets' => false,
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => false,
        ])->assertSessionHasErrors('contact_id');

        $this->assertDatabaseMissing('users', ['email' => 'scoped-user@test.local']);
    }

    public function test_asset_crud_permissions_are_enforced(): void
    {
        $client = ClientCompany::factory()->create();
        $type = AssetType::factory()->create();

        $unauthorizedStaff = $this->createStaffWithPermissions([]);
        $this->actingAs($unauthorizedStaff)->post('/assets', [
            'client_company_id' => $client->id,
            'asset_type_id' => $type->id,
            'name' => 'Unauthorized Asset',
            'asset_code' => 'AST-4000',
            'status' => AssetStatus::Online->value,
            'criticality' => AssetCriticality::Medium->value,
        ])->assertForbidden();

        $authorizedStaff = $this->createStaffWithPermissions(['assets.create', 'assets.update', 'assets.delete']);

        $this->actingAs($authorizedStaff)->post('/assets', [
            'client_company_id' => $client->id,
            'asset_type_id' => $type->id,
            'name' => 'Primary API',
            'asset_code' => 'AST-5000',
            'status' => AssetStatus::Online->value,
            'criticality' => AssetCriticality::High->value,
        ])->assertRedirect();

        $asset = Asset::query()->where('asset_code', 'AST-5000')->firstOrFail();

        $this->actingAs($authorizedStaff)->put("/assets/{$asset->id}", [
            'client_company_id' => $client->id,
            'asset_type_id' => $type->id,
            'name' => 'Primary API Updated',
            'asset_code' => 'AST-5000',
            'status' => AssetStatus::Degraded->value,
            'criticality' => AssetCriticality::High->value,
            'service_category' => $asset->service_category,
            'environment' => $asset->environment,
            'vendor' => $asset->vendor,
            'notes' => $asset->notes,
            'parent_asset_id' => $asset->parent_asset_id,
            'assigned_staff_id' => $asset->assigned_staff_id,
            'start_date' => optional($asset->start_date)?->format('Y-m-d'),
            'renewal_date' => optional($asset->renewal_date)?->format('Y-m-d'),
            'end_date' => optional($asset->end_date)?->format('Y-m-d'),
            'meta' => $asset->meta,
        ])->assertRedirect();

        $this->actingAs($authorizedStaff)->delete("/assets/{$asset->id}")->assertRedirect('/assets');
        $this->assertSoftDeleted('assets', ['id' => $asset->id]);
    }

    public function test_ticket_creation_and_client_visibility_are_scoped(): void
    {
        $client = ClientCompany::factory()->create();
        $otherClient = ClientCompany::factory()->create();

        $staff = $this->createStaffWithPermissions(['tickets.create', 'tickets.view']);

        $this->actingAs($staff)->post('/tickets', [
            'client_company_id' => $client->id,
            'title' => 'Production incident',
            'description' => 'Primary website is down.',
            'category' => 'Incident',
            'priority' => TicketPriority::High->value,
            'status' => TicketStatus::New->value,
            'source' => 'email',
        ])->assertRedirect();

        $ownCompanyTicket = Ticket::query()->where('title', 'Production incident')->firstOrFail();

        $otherCompanyTicket = Ticket::factory()->create(['client_company_id' => $otherClient->id]);

        $clientUser = $this->createClientUser($client, [
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => true,
        ]);

        $this->actingAs($clientUser)->withHeaders($this->inertiaHeaders())->get("/portal/tickets/{$ownCompanyTicket->id}")->assertOk();
        $this->actingAs($clientUser)->withHeaders($this->inertiaHeaders())->get("/portal/tickets/{$otherCompanyTicket->id}")->assertForbidden();
    }

    public function test_internal_notes_are_hidden_and_client_portal_queries_are_company_scoped(): void
    {
        $client = ClientCompany::factory()->create();
        $otherClient = ClientCompany::factory()->create();

        $type = AssetType::factory()->create(['name' => 'Server', 'slug' => 'server']);
        Asset::factory()->create(['client_company_id' => $client->id, 'asset_type_id' => $type->id, 'name' => 'Client Asset']);
        Asset::factory()->create(['client_company_id' => $otherClient->id, 'asset_type_id' => $type->id, 'name' => 'Other Asset']);

        ClientContact::factory()->create(['client_company_id' => $client->id, 'full_name' => 'Client Contact']);
        ClientContact::factory()->create(['client_company_id' => $otherClient->id, 'full_name' => 'Other Contact']);

        $ticket = Ticket::factory()->create(['client_company_id' => $client->id, 'title' => 'Visibility Ticket']);
        TicketMessage::factory()->create([
            'ticket_id' => $ticket->id,
            'message_type' => TicketMessageType::PublicReply->value,
            'body' => 'Public update visible to client.',
        ]);
        TicketMessage::factory()->create([
            'ticket_id' => $ticket->id,
            'message_type' => TicketMessageType::InternalNote->value,
            'body' => 'Internal analysis should stay hidden.',
        ]);

        $clientUser = $this->createClientUser($client, [
            'can_view_assets' => true,
            'can_manage_contacts' => true,
        ]);

        $this->actingAs($clientUser)
            ->withHeaders($this->inertiaHeaders())
            ->get("/portal/tickets/{$ticket->id}")
            ->assertOk()
            ->assertSee('Public update visible to client.')
            ->assertDontSee('Internal analysis should stay hidden.');

        $this->actingAs($clientUser)
            ->withHeaders($this->inertiaHeaders())
            ->get('/portal/assets')
            ->assertOk()
            ->assertSee('Client Asset')
            ->assertDontSee('Other Asset');

        $this->actingAs($clientUser)
            ->withHeaders($this->inertiaHeaders())
            ->get('/portal/contacts')
            ->assertOk()
            ->assertSee('Client Contact')
            ->assertDontSee('Other Contact');
    }

    private function inertiaHeaders(): array
    {
        return [
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
        ];
    }

    private function createStaffWithPermissions(array $permissions): User
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ([Roles::SUPER_ADMIN, Roles::ADMIN, Roles::STAFF, Roles::SUPPORT_AGENT, Roles::ASSET_MANAGER, Roles::CLIENT_USER] as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $role = Role::findByName(Roles::STAFF, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $user->givePermissionTo($permissions);

        return $user;
    }

    private function createClientUser(ClientCompany $company, array $overrides = []): User
    {
        $role = Role::firstOrCreate(['name' => Roles::CLIENT_USER, 'guard_name' => 'web']);

        $user = User::factory()->create();
        $user->assignRole($role);

        ClientUserProfile::factory()->create([
            'user_id' => $user->id,
            'client_company_id' => $company->id,
            ...$overrides,
        ]);

        return $user;
    }
}
