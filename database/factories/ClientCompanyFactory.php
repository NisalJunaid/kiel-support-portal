<?php

namespace Database\Factories;

use App\Enums\ClientStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ClientCompany>
 */
class ClientCompanyFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'legal_name' => $name.' LLC',
            'client_code' => strtoupper(fake()->bothify('CLI-####')),
            'industry' => fake()->randomElement(['Healthcare', 'Manufacturing', 'Technology', 'Logistics']),
            'status' => fake()->randomElement(array_map(fn ($status) => $status->value, ClientStatus::cases())),
            'website' => fake()->optional()->url(),
            'primary_email' => fake()->optional()->companyEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'billing_address' => fake()->optional()->address(),
            'technical_address' => fake()->optional()->address(),
            'timezone' => fake()->timezone(),
            'notes' => fake()->optional()->sentence(),
            'onboarded_at' => fake()->optional()->dateTimeBetween('-2 years', 'now'),
            'account_manager_id' => null,
        ];
    }
}
