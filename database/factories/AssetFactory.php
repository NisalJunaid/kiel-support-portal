<?php

namespace Database\Factories;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetType;
use App\Models\ClientCompany;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        return [
            'client_company_id' => ClientCompany::factory(),
            'asset_type_id' => AssetType::factory(),
            'name' => fake()->words(2, true),
            'asset_code' => fake()->unique()->bothify('AST-####'),
            'service_category' => fake()->word(),
            'status' => fake()->randomElement(AssetStatus::cases())->value,
            'environment' => fake()->randomElement(['production', 'staging']),
            'criticality' => fake()->randomElement(AssetCriticality::cases())->value,
            'vendor' => fake()->company(),
            'notes' => fake()->sentence(),
            'meta' => [],
        ];
    }
}
