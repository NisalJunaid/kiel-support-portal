<?php

namespace App\Http\Requests;

use App\Enums\ContactType;
use App\Models\ClientContact;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Support\FormOptionCatalog;

class StoreClientContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ClientContact::class);
    }

    public function rules(): array
    {
        return [
            'client_company_id' => ['required', 'exists:client_companies,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', Rule::in(FormOptionCatalog::CONTACT_DEPARTMENTS)],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'mobile' => ['nullable', 'string', 'max:50'],
            'contact_type' => ['required', Rule::enum(ContactType::class)],
            'escalation_level' => ['nullable', 'integer', 'between:1,5'],
            'preferred_contact_method' => ['nullable', Rule::in(['email', 'phone', 'mobile'])],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
