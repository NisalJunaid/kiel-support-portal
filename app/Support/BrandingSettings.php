<?php

namespace App\Support;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;

class BrandingSettings
{
    public const KEY = 'branding';
    public const CACHE_KEY = 'branding-settings:shared';

    public static function defaults(): array
    {
        return [
            'app_name' => 'Kiel Support Portal',
            'logo_path' => null,
            'primary_color' => '#0f766e',
            'secondary_color' => '#f1f5f9',
            'accent_color' => '#dbeafe',
            'card_border_color' => '#94a3b8',
            'dark_mode_enabled' => false,
        ];
    }

    public static function get(): array
    {
        $stored = AppSetting::query()
            ->where('key', self::KEY)
            ->first()?->value;

        if (! is_array($stored)) {
            $stored = [];
        }

        if (isset($stored['surface_border_color']) && ! isset($stored['card_border_color'])) {
            $stored['card_border_color'] = $stored['surface_border_color'];
        }

        if (isset($stored['border_color']) && ! isset($stored['card_border_color'])) {
            $stored['card_border_color'] = $stored['border_color'];
        }

        $settings = array_merge(self::defaults(), $stored);
        $settings['dark_mode_enabled'] = (bool) ($settings['dark_mode_enabled'] ?? false);

        return [
            ...$settings,
            'border_color' => $settings['card_border_color'],
            'surface_border_color' => $settings['card_border_color'],
            'logo_url' => $settings['logo_path'] ? asset('storage/'.$settings['logo_path']) : null,
            'theme_hsl' => [
                'primary' => self::hexToHsl($settings['primary_color']),
                'secondary' => self::hexToHsl($settings['secondary_color']),
                'accent' => self::hexToHsl($settings['accent_color']),
                'border' => self::hexToHsl($settings['card_border_color']),
            ],
        ];
    }

    public static function cached(): array
    {
        return Cache::remember(self::CACHE_KEY, now()->addMinutes(5), fn () => self::get());
    }

    public static function update(array $payload): void
    {
        if (isset($payload['border_color']) && ! isset($payload['card_border_color'])) {
            $payload['card_border_color'] = $payload['border_color'];
        }

        unset($payload['border_color'], $payload['surface_border_color']);

        AppSetting::query()->updateOrCreate(['key' => self::KEY], ['value' => $payload]);
        Cache::forget(self::CACHE_KEY);
    }

    private static function hexToHsl(string $hex): string
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = preg_replace('/(.)/', '$1$1', $hex);
        }

        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $h = $s = 0;
        $l = ($max + $min) / 2;

        if ($max !== $min) {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);

            if ($max === $r) {
                $h = (($g - $b) / $d) + ($g < $b ? 6 : 0);
            } elseif ($max === $g) {
                $h = (($b - $r) / $d) + 2;
            } else {
                $h = (($r - $g) / $d) + 4;
            }

            $h /= 6;
        }

        return sprintf('%d %d%% %d%%', round($h * 360), round($s * 100), round($l * 100));
    }
}
