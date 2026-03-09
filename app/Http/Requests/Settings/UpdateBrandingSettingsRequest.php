<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super-admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:120'],
            'primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'surface_border_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'dark_mode_enabled' => ['nullable', 'boolean'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'remove_logo' => ['nullable', 'boolean'],
        ];
    }
}
