<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingSettingsRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $cardBorderColor = $this->input('card_border_color')
            ?? $this->input('border_color')
            ?? $this->input('surface_border_color');

        $this->merge([
            'card_border_color' => $cardBorderColor,
            'remove_light_logo' => filter_var($this->input('remove_light_logo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'remove_dark_logo' => filter_var($this->input('remove_dark_logo'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }

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
            'card_border_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'light_logo' => ['nullable', 'image', 'max:2048'],
            'dark_logo' => ['nullable', 'image', 'max:2048'],
            'remove_light_logo' => ['nullable', 'boolean'],
            'remove_dark_logo' => ['nullable', 'boolean'],
        ];
    }
}
