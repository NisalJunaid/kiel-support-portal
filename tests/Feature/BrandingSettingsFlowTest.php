<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use App\Support\BrandingSettings;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BrandingSettingsFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_persist_branding_settings_with_boolean_payload_values(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);

        $user = User::factory()->create();
        $user->assignRole(Roles::SUPER_ADMIN);

        $this->actingAs($user)->patch('/settings/branding', [
            'app_name' => 'Kiel Ops',
            'primary_color' => '#112233',
            'secondary_color' => '#aabbcc',
            'accent_color' => '#334455',
            'card_border_color' => '#445566',
            'dark_mode_enabled' => 'true',
            'remove_logo' => 'false',
        ])->assertRedirect();

        $record = AppSetting::query()->where('key', BrandingSettings::KEY)->first();

        $this->assertNotNull($record);
        $this->assertSame('Kiel Ops', $record->value['app_name']);
        $this->assertSame('#112233', $record->value['primary_color']);
        $this->assertTrue($record->value['dark_mode_enabled']);

        $hydrated = BrandingSettings::get();

        $this->assertSame('#445566', $hydrated['card_border_color']);
        $this->assertSame('#445566', $hydrated['border_color']);
    }

    public function test_super_admin_can_save_branding_when_border_color_alias_is_submitted(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);

        $user = User::factory()->create();
        $user->assignRole(Roles::SUPER_ADMIN);

        $this->actingAs($user)->patch('/settings/branding', [
            'app_name' => 'Kiel Portal',
            'primary_color' => '#102030',
            'secondary_color' => '#203040',
            'accent_color' => '#304050',
            'border_color' => '#405060',
            'dark_mode_enabled' => 'false',
        ])->assertRedirect();

        $record = AppSetting::query()->where('key', BrandingSettings::KEY)->first();

        $this->assertNotNull($record);
        $this->assertSame('#405060', $record->value['card_border_color']);

        $hydrated = BrandingSettings::get();

        $this->assertSame('#405060', $hydrated['card_border_color']);
        $this->assertSame('#405060', $hydrated['border_color']);
    }

}
