<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateThemeModeRequest;
use Illuminate\Http\RedirectResponse;

class ThemeModePreferenceController extends Controller
{
    public function __invoke(UpdateThemeModeRequest $request): RedirectResponse
    {
        $request->user()->forceFill([
            'theme_mode' => $request->string('theme_mode')->value(),
        ])->save();

        return back();
    }
}
