<?php

namespace App\Support;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;

class RoleNavigationVisibility
{
    public const KEY = 'role_navigation_visibility';
    public const CACHE_KEY = 'role-navigation-visibility:shared';

    public static function defaults(): array
    {
        $items = NavigationRegistry::allItems();

        return collect(Roles::all())
            ->mapWithKeys(fn (string $role) => [
                $role => collect($items)
                    ->mapWithKeys(fn (array $item) => [$item['key'] => NavigationRegistry::defaultVisibilityForRole($role, $item)])
                    ->all(),
            ])
            ->all();
    }

    public static function all(): array
    {
        return Cache::remember(self::CACHE_KEY, now()->addMinutes(5), function () {
            $stored = AppSetting::query()->where('key', self::KEY)->first()?->value;
            $stored = is_array($stored) ? $stored : [];

            $defaults = self::defaults();

            return collect($defaults)->mapWithKeys(function (array $roleDefaults, string $role) use ($stored) {
                $incoming = is_array($stored[$role] ?? null) ? $stored[$role] : [];

                return [
                    $role => collect($roleDefaults)
                        ->mapWithKeys(fn (bool $default, string $key) => [$key => filter_var($incoming[$key] ?? $default, FILTER_VALIDATE_BOOL)])
                        ->all(),
                ];
            })->all();
        });
    }

    public static function forRoles(array $roles): array
    {
        $all = self::all();
        $defaults = self::defaults();

        $effective = collect(NavigationRegistry::itemKeys())->mapWithKeys(fn (string $key) => [$key => false])->all();

        foreach ($roles as $role) {
            $roleVisibility = $all[$role] ?? $defaults[$role] ?? [];

            foreach ($roleVisibility as $key => $isVisible) {
                if ($isVisible) {
                    $effective[$key] = true;
                }
            }
        }

        return $effective;
    }

    public static function update(array $visibility): void
    {
        $defaults = self::defaults();

        $payload = collect($defaults)->mapWithKeys(function (array $roleDefaults, string $role) use ($visibility) {
            $incomingRole = is_array($visibility[$role] ?? null) ? $visibility[$role] : [];

            return [
                $role => collect($roleDefaults)
                    ->mapWithKeys(fn (bool $default, string $key) => [$key => filter_var($incomingRole[$key] ?? $default, FILTER_VALIDATE_BOOL)])
                    ->all(),
            ];
        })->all();

        AppSetting::query()->updateOrCreate(['key' => self::KEY], ['value' => $payload]);
        Cache::forget(self::CACHE_KEY);
    }
}
