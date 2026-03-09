<?php

namespace Database\Factories;

use App\Models\ClientCompany;
use App\Models\ClientUserProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientUserProfile>
 */
class ClientUserProfileFactory extends Factory
{
    protected $model = ClientUserProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'client_company_id' => ClientCompany::factory(),
            'contact_id' => null,
            'role_label' => 'Client User',
            'can_view_all_company_tickets' => false,
            'can_create_tickets' => true,
            'can_view_assets' => true,
            'can_manage_contacts' => false,
        ];
    }
}
