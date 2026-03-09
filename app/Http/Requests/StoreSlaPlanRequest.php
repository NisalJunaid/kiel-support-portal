<?php

namespace App\Http\Requests;

use App\Models\SlaPlan;
use Illuminate\Foundation\Http\FormRequest;

class StoreSlaPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', SlaPlan::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'business_hours' => $this->normalizeJsonField($this->input('business_hours')),
            'escalation_rules' => $this->normalizeJsonField($this->input('escalation_rules')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:sla_plans,name'],
            'response_minutes' => ['required', 'integer', 'min:1'],
            'resolution_minutes' => ['required', 'integer', 'min:1'],
            'business_hours' => ['nullable', 'array'],
            'escalation_rules' => ['nullable', 'array'],
        ];
    }

    private function normalizeJsonField(mixed $value): ?array
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : null;
        }

        return null;
    }
}
