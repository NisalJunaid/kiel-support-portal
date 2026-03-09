<?php

namespace App\Http\Requests;

use App\Enums\ClientStatus;
use App\Models\ClientCompany;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ClientCompany $clientCompany */
        $clientCompany = $this->route('client');

        return $this->user()?->can('update', $clientCompany) ?? false;
    }

    public function rules(): array
    {
        /** @var ClientCompany $clientCompany */
        $clientCompany = $this->route('client');

        return [
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['required', 'string', 'max:255'],
            'client_code' => ['required', 'string', 'max:100', 'alpha_dash', Rule::unique('client_companies', 'client_code')->ignore($clientCompany->id)],
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
        ];
    }
}
