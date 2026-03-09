<?php

namespace App\Http\Requests;

use App\Enums\ClientStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\ClientCompany::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['required', 'string', 'max:255'],
            'client_code' => ['required', 'string', 'max:100', 'alpha_dash', 'unique:client_companies,client_code'],
            'industry' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::enum(ClientStatus::class)],
            'website' => ['nullable', 'url', 'max:255'],
            'primary_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'billing_address' => ['nullable', 'string'],
            'technical_address' => ['nullable', 'string'],
            'timezone' => ['required', 'timezone:all'],
            'notes' => ['nullable', 'string'],
            'onboarded_at' => ['nullable', 'date'],
            'account_manager_id' => ['nullable', 'exists:users,id'],
            'sla_plan_id' => ['nullable', 'exists:sla_plans,id'],
        ];
    }
}
