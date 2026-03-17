<?php

namespace App\Http\Requests\Administration;

use App\Models\ClientUserProfile;
use App\Support\FormOptionCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientManagedUserRequest extends FormRequest
{
    use EnsureSuperAdmin;

    public function rules(): array
    {
        /** @var ClientUserProfile $profile */
        $profile = $this->route('clientUser');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($profile->user_id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'client_company_id' => ['required', 'integer', 'exists:client_companies,id'],
            'contact_id' => [
                'nullable',
                'integer',
                Rule::exists('client_contacts', 'id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
            'role_label' => ['required', Rule::in(FormOptionCatalog::CLIENT_USER_ROLE_LABELS)],
            'can_view_all_company_tickets' => ['required', 'boolean'],
            'can_create_tickets' => ['required', 'boolean'],
            'can_view_assets' => ['required', 'boolean'],
            'can_manage_contacts' => ['required', 'boolean'],
        ];
    }
}
