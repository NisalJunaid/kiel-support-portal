<?php

namespace Database\Seeders;

use App\Models\AssetType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AssetTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Hosting Account',
            'VPS/Server',
            'Dedicated Server',
            'Domain',
            'Website',
            'Web Application',
            'Email Hosting',
            'SSL Certificate',
            'DNS Zone',
        ];

        foreach ($types as $type) {
            AssetType::query()->updateOrCreate(
                ['slug' => Str::slug($type)],
                ['name' => $type, 'description' => "{$type} asset type", 'is_active' => true],
            );
        }
    }
}
