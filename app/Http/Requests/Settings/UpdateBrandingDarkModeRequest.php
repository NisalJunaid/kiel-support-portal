<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBrandingDarkModeRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'dark_mode_enabled' => filter_var($this->input('dark_mode_enabled'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        ]);
    }

    public function authorize(): bool
    {
        return $this->user()?->hasRole('super-admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'dark_mode_enabled' => ['required', 'boolean'],
        ];
    }
}
