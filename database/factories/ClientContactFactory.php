<?php

namespace Database\Factories;

use App\Enums\ContactType;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClientContact>
 */
class ClientContactFactory extends Factory
{
    protected $model = ClientContact::class;

    public function definition(): array
    {
        return [
            'client_company_id' => ClientCompany::factory(),
            'full_name' => fake()->name(),
            'title' => fake()->jobTitle(),
            'department' => fake()->word(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'mobile' => fake()->phoneNumber(),
            'contact_type' => fake()->randomElement(ContactType::cases())->value,
            'is_active' => true,
            'notes' => fake()->sentence(),
        ];
    }
}
