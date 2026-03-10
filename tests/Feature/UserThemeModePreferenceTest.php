<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserThemeModePreferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_only_their_own_theme_mode(): void
    {
        Role::create(['name' => Roles::ADMIN]);

        $userA = User::factory()->create(['theme_mode' => 'light']);
        $userB = User::factory()->create(['theme_mode' => 'light']);
        $userA->assignRole(Roles::ADMIN);
        $userB->assignRole(Roles::ADMIN);

        $this->actingAs($userA)
            ->from('/dashboard')
            ->patch('/settings/theme-mode', ['theme_mode' => 'dark'])
            ->assertRedirect('/dashboard');

        $this->assertSame('dark', $userA->fresh()->theme_mode);
        $this->assertSame('light', $userB->fresh()->theme_mode);
    }

    public function test_theme_mode_is_exposed_in_shared_inertia_auth_props(): void
    {
        Role::create(['name' => Roles::ADMIN]);

        $user = User::factory()->create(['theme_mode' => 'dark']);
        $user->assignRole(Roles::ADMIN);

        $this->actingAs($user)
            ->withHeaders([
                'X-Inertia' => 'true',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->get('/dashboard')
            ->assertOk()
            ->assertSee('"theme_mode":"dark"');
    }
}
