<?php

namespace App\Http\Requests;

use App\Enums\ServiceStatus;
use App\Enums\ServiceType;
use App\Models\Service;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $service = $this->route('service');

        return $service instanceof Service && ($this->user()?->can('update', $service) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $assets = $this->input('asset_ids', []);

        $this->merge([
            'asset_ids' => is_array($assets) ? array_values(array_unique(array_filter($assets))) : [],
        ]);
    }

    public function rules(): array
    {
        return [
            'client_company_id' => ['required', 'exists:client_companies,id'],
            'name' => ['required', 'string', 'max:255'],
            'service_type' => ['required', Rule::enum(ServiceType::class)],
            'status' => ['required', Rule::enum(ServiceStatus::class)],
            'sla_plan_id' => ['nullable', 'integer'],
            'renewal_cycle' => ['nullable', 'string', 'max:80'],
            'start_date' => ['nullable', 'date'],
            'renewal_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'asset_ids' => ['nullable', 'array'],
            'asset_ids.*' => [
                'integer',
                Rule::exists('assets', 'id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
        ];
    }
}
