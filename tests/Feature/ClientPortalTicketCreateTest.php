<?php

namespace Tests\Feature;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Enums\TicketPriority;
use App\Models\Asset;
use App\Models\AssetType;
use App\Models\ClientCompany;
use App\Models\ClientUserProfile;
use App\Models\Ticket;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ClientPortalTicketCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_client_user_can_create_ticket_for_their_company(): void
    {
        Role::create(['name' => Roles::CLIENT_USER]);

        $company = ClientCompany::factory()->create();
        $user = User::factory()->create();
        $user->assignRole(Roles::CLIENT_USER);

        ClientUserProfile::query()->create([
            'user_id' => $user->id,
            'client_company_id' => $company->id,
            'role_label' => 'Client Admin',
            'can_create_tickets' => true,
        ]);

        $assetType = AssetType::query()->create(['name' => 'Server', 'slug' => 'server']);
        $asset = Asset::query()->create([
            'client_company_id' => $company->id,
            'asset_type_id' => $assetType->id,
            'name' => 'Primary DB',
            'asset_code' => 'AST-1001',
            'status' => AssetStatus::Active->value,
            'criticality' => AssetCriticality::High->value,
        ]);

        $this->actingAs($user)->post('/portal/tickets', [
            'title' => 'Cannot access reporting',
            'description' => 'Users receive an authorization error.',
            'category' => 'Access',
            'priority' => TicketPriority::High->value,
            'asset_id' => $asset->id,
        ])->assertRedirect();

        $ticket = Ticket::query()->first();

        $this->assertNotNull($ticket);
        $this->assertSame($company->id, $ticket->client_company_id);
        $this->assertSame($user->id, $ticket->requester_user_id);
        $this->assertSame($asset->id, $ticket->asset_id);
    }

    public function test_client_ticket_create_rejects_asset_from_different_company(): void
    {
        Role::create(['name' => Roles::CLIENT_USER]);

        $company = ClientCompany::factory()->create();
        $otherCompany = ClientCompany::factory()->create();
        $user = User::factory()->create();
        $user->assignRole(Roles::CLIENT_USER);

        ClientUserProfile::query()->create([
            'user_id' => $user->id,
            'client_company_id' => $company->id,
            'role_label' => 'Client Admin',
            'can_create_tickets' => true,
        ]);

        $assetType = AssetType::query()->create(['name' => 'Domain', 'slug' => 'domain']);
        $otherCompanyAsset = Asset::query()->create([
            'client_company_id' => $otherCompany->id,
            'asset_type_id' => $assetType->id,
            'name' => 'Other asset',
            'asset_code' => 'AST-2001',
            'status' => AssetStatus::Active->value,
            'criticality' => AssetCriticality::Medium->value,
        ]);

        $this->actingAs($user)->post('/portal/tickets', [
            'title' => 'Cannot access reporting',
            'description' => 'Users receive an authorization error.',
            'category' => 'Access',
            'priority' => TicketPriority::High->value,
            'asset_id' => $otherCompanyAsset->id,
        ])->assertSessionHasErrors('asset_id');

        $this->assertDatabaseCount('tickets', 0);
    }
}
