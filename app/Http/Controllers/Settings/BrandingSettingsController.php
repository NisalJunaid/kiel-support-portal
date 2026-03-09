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

        $payload = [
            'app_name' => $request->string('app_name')->toString(),
            'primary_color' => $request->string('primary_color')->toString(),
            'secondary_color' => $request->string('secondary_color')->toString(),
            'accent_color' => $request->string('accent_color')->toString(),
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
}
