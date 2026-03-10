<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingSettingsRequest;
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
        $validated = $request->validated();

        $payload = [
            'app_name' => $validated['app_name'] ?? $current['app_name'],
            'primary_color' => $validated['primary_color'] ?? $current['primary_color'],
            'secondary_color' => $validated['secondary_color'] ?? $current['secondary_color'],
            'accent_color' => $validated['accent_color'] ?? $current['accent_color'],
            'card_border_color' => $validated['card_border_color'] ?? $current['card_border_color'],
            'logo_path' => $current['logo_path'],
            'light_logo_path' => $current['light_logo_path'] ?? $current['logo_path'],
            'dark_logo_path' => $current['dark_logo_path'],
        ];

        if ($request->boolean('remove_light_logo') && $payload['light_logo_path']) {
            Storage::disk('public')->delete($payload['light_logo_path']);
            $payload['light_logo_path'] = null;
        }

        if ($request->boolean('remove_dark_logo') && $payload['dark_logo_path']) {
            Storage::disk('public')->delete($payload['dark_logo_path']);
            $payload['dark_logo_path'] = null;
        }

        if ($request->hasFile('light_logo')) {
            if ($payload['light_logo_path']) {
                Storage::disk('public')->delete($payload['light_logo_path']);
            }
            $payload['light_logo_path'] = $request->file('light_logo')->store('branding', 'public');
        }

        if ($request->hasFile('dark_logo')) {
            if ($payload['dark_logo_path']) {
                Storage::disk('public')->delete($payload['dark_logo_path']);
            }
            $payload['dark_logo_path'] = $request->file('dark_logo')->store('branding', 'public');
        }

        // Backward compatibility for consumers still reading a single logo_path.
        $payload['logo_path'] = $payload['light_logo_path'];

        BrandingSettings::update($payload);

        return back()->with('success', 'Branding settings updated.');
    }
}
