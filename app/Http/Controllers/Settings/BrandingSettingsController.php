<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingSettingsRequest;
use App\Http\Requests\Settings\UpdateBrandingDarkModeRequest;
use App\Support\BrandingSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingSettingsController extends Controller
{
    public function edit(): Response
    {
        abort_unless(request()->user()?->hasRole('super-admin'), 403);

        return Inertia::render('Settings/Branding', [
            'branding' => BrandingSettings::get(),
        ]);
    }

    public function update(UpdateBrandingSettingsRequest $request): RedirectResponse
    {
        $current = BrandingSettings::get();

        $payload = [
            'app_name' => $request->string('app_name')->toString(),
            'primary_color' => $request->string('primary_color')->toString(),
            'secondary_color' => $request->string('secondary_color')->toString(),
            'accent_color' => $request->string('accent_color')->toString(),
            'border_color' => $request->string('border_color')->toString(),
            'dark_mode_enabled' => $request->boolean('dark_mode_enabled'),
            'logo_path' => $current['logo_path'],
        ];

        if ($request->boolean('remove_logo') && $current['logo_path']) {
            Storage::disk('public')->delete($current['logo_path']);
            $payload['logo_path'] = null;
        }

        if ($request->hasFile('logo')) {
            if ($current['logo_path']) {
                Storage::disk('public')->delete($current['logo_path']);
            }
            $payload['logo_path'] = $request->file('logo')->store('branding', 'public');
        }

        BrandingSettings::update($payload);

        return back()->with('success', 'Branding settings updated.');
    }

    public function updateDarkMode(UpdateBrandingDarkModeRequest $request): RedirectResponse
    {
        $current = BrandingSettings::get();

        BrandingSettings::update([
            'app_name' => $current['app_name'],
            'primary_color' => $current['primary_color'],
            'secondary_color' => $current['secondary_color'],
            'accent_color' => $current['accent_color'],
            'border_color' => $current['border_color'],
            'logo_path' => $current['logo_path'],
            'dark_mode_enabled' => $request->boolean('dark_mode_enabled'),
        ]);

        return back();
    }
}
