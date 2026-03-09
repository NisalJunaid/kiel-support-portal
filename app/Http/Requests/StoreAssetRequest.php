<?php

namespace App\Http\Requests;

use App\Enums\AssetCriticality;
use App\Enums\AssetStatus;
use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Asset::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'client_company_id' => ['required', 'exists:client_companies,id'],
            'parent_asset_id' => ['nullable', 'exists:assets,id'],
            'asset_type_id' => ['required', 'exists:asset_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'asset_code' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:assets,asset_code'],
            'service_category' => ['nullable', 'string', 'max:120'],
            'status' => ['required', Rule::enum(AssetStatus::class)],
            'environment' => ['nullable', 'string', 'max:100'],
            'criticality' => ['required', Rule::enum(AssetCriticality::class)],
            'assigned_staff_id' => ['nullable', 'exists:users,id'],
            'start_date' => ['nullable', 'date'],
            'renewal_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'meta.ip_address' => ['nullable', 'string', 'max:255'],
            'meta.hostname' => ['nullable', 'string', 'max:255'],
            'meta.plan' => ['nullable', 'string', 'max:255'],
            'meta.region' => ['nullable', 'string', 'max:255'],
        ];
    }
}
