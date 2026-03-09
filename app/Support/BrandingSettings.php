<?php

namespace App\Support;

use App\Models\AppSetting;

class BrandingSettings
{
    public const KEY = 'branding';

    public static function defaults(): array
    {
        return [
            'app_name' => 'Kiel Support Portal',
            'logo_path' => null,
            'primary_color' => '#0f766e',
            'secondary_color' => '#f1f5f9',
            'accent_color' => '#dbeafe',
            'surface_border_color' => '#94a3b8',
            'dark_mode_enabled' => false,
        ];
    }

    public static function get(): array
    {
        $stored = AppSetting::query()->where('key', self::KEY)->value('value') ?? [];
        $settings = array_merge(self::defaults(), $stored);

        return [
            ...$settings,
            'logo_url' => $settings['logo_path'] ? asset('storage/'.$settings['logo_path']) : null,
            'theme_hsl' => [
                'primary' => self::hexToHsl($settings['primary_color']),
                'secondary' => self::hexToHsl($settings['secondary_color']),
                'accent' => self::hexToHsl($settings['accent_color']),
                'surface_border' => self::hexToHsl($settings['surface_border_color']),
            ],
        ];
    }

    public static function update(array $payload): void
    {
        AppSetting::query()->updateOrCreate(['key' => self::KEY], ['value' => $payload]);
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
