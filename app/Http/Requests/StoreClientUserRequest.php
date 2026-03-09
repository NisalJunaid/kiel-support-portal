<?php

namespace App\Http\Requests;

use App\Models\ClientUserProfile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ClientUserProfile::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'client_company_id' => ['required', 'integer', 'exists:client_companies,id'],
            'contact_id' => [
                'nullable',
                'integer',
                Rule::exists('client_contacts', 'id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
            'role_label' => ['required', 'string', 'max:120'],
            'can_view_all_company_tickets' => ['required', 'boolean'],
            'can_create_tickets' => ['required', 'boolean'],
            'can_view_assets' => ['required', 'boolean'],
            'can_manage_contacts' => ['required', 'boolean'],
        ];
    }
}
