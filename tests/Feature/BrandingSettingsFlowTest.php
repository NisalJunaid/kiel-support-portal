<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\User;
use App\Support\BrandingSettings;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
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
            'remove_light_logo' => 'false',
            'remove_dark_logo' => 'false',
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

    public function test_branding_update_invalidates_cache_and_hydrates_fresh_inertia_props(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);

        $user = User::factory()->create();
        $user->assignRole(Roles::SUPER_ADMIN);

        BrandingSettings::update([
            'app_name' => 'Before',
            'primary_color' => '#111111',
            'secondary_color' => '#222222',
            'accent_color' => '#333333',
            'card_border_color' => '#444444',
            'dark_mode_enabled' => false,
            'logo_path' => null,
        ]);

        $cachedBefore = BrandingSettings::cached();
        $this->assertSame('Before', $cachedBefore['app_name']);

        $this->actingAs($user)->patch('/settings/branding', [
            'app_name' => 'After',
            'primary_color' => '#abcdef',
            'secondary_color' => '#123456',
            'accent_color' => '#654321',
            'card_border_color' => '#fedcba',
            'dark_mode_enabled' => 'true',
            'remove_light_logo' => 'false',
            'remove_dark_logo' => 'false',
        ])->assertRedirect();

        $this->assertFalse(Cache::has(BrandingSettings::CACHE_KEY));

        $this->actingAs($user)
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->get('/settings/branding')
            ->assertOk()
            ->assertSee('"app_name":"After"')
            ->assertSee('"primary_color":"#abcdef"')
            ->assertSee('"card_border_color":"#fedcba"')
            ->assertSee('"dark_mode_enabled":true');
    }

    public function test_super_admin_can_update_branding_via_post_method_spoof_and_upload_logo(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole(Roles::SUPER_ADMIN);

        $logo = UploadedFile::fake()->image('branding-logo.png');

        $this->actingAs($user)->post('/settings/branding', [
            '_method' => 'patch',
            'app_name' => 'Method Spoofed Brand',
            'primary_color' => '#0a0b0c',
            'secondary_color' => '#1a1b1c',
            'accent_color' => '#2a2b2c',
            'card_border_color' => '#3a3b3c',
            'dark_mode_enabled' => '1',
            'remove_light_logo' => '0',
            'remove_dark_logo' => '0',
            'light_logo' => $logo,
        ])->assertRedirect();

        $record = AppSetting::query()->where('key', BrandingSettings::KEY)->first();

        $this->assertNotNull($record);
        $this->assertSame('Method Spoofed Brand', $record->value['app_name']);
        $this->assertTrue($record->value['dark_mode_enabled']);
        $this->assertNotNull($record->value['logo_path']);
        $this->assertNotNull($record->value['light_logo_path']);
        Storage::disk('public')->assertExists($record->value['light_logo_path']);

        $hydrated = BrandingSettings::get();

        $this->assertSame('Method Spoofed Brand', $hydrated['app_name']);
        $this->assertSame('#0a0b0c', $hydrated['primary_color']);
        $this->assertSame('#1a1b1c', $hydrated['secondary_color']);
        $this->assertSame('#2a2b2c', $hydrated['accent_color']);
        $this->assertSame('#3a3b3c', $hydrated['card_border_color']);
        $this->assertTrue($hydrated['dark_mode_enabled']);
        $this->assertNotNull($hydrated['light_logo_url']);
        $this->assertNotNull($hydrated['logo_url']);
    }

    public function test_super_admin_can_save_distinct_light_and_dark_logos(): void
    {
        Role::create(['name' => Roles::SUPER_ADMIN]);
        Storage::fake('public');

        $user = User::factory()->create();
        $user->assignRole(Roles::SUPER_ADMIN);

        $lightLogo = UploadedFile::fake()->image('light-logo.png');
        $darkLogo = UploadedFile::fake()->image('dark-logo.png');

        $this->actingAs($user)->patch('/settings/branding', [
            'app_name' => 'Split Brand',
            'primary_color' => '#121212',
            'secondary_color' => '#343434',
            'accent_color' => '#565656',
            'card_border_color' => '#787878',
            'dark_mode_enabled' => '1',
            'light_logo' => $lightLogo,
            'dark_logo' => $darkLogo,
        ])->assertRedirect();

        $record = AppSetting::query()->where('key', BrandingSettings::KEY)->first();

        $this->assertNotNull($record);
        $this->assertNotNull($record->value['light_logo_path']);
        $this->assertNotNull($record->value['dark_logo_path']);
        Storage::disk('public')->assertExists($record->value['light_logo_path']);
        Storage::disk('public')->assertExists($record->value['dark_logo_path']);

        $hydrated = BrandingSettings::get();

        $this->assertNotNull($hydrated['light_logo_url']);
        $this->assertNotNull($hydrated['dark_logo_url']);
    }

}
