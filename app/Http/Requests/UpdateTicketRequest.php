<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ticket = $this->route('ticket');

        return $ticket ? ($this->user()?->can('update', $ticket) ?? false) : false;
    }

    public function rules(): array
    {
        return [
            'client_company_id' => ['required', 'exists:client_companies,id'],
            'requester_user_id' => [
                'nullable',
                Rule::exists('client_user_profiles', 'user_id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
            'requester_contact_id' => [
                'nullable',
                Rule::exists('client_contacts', 'id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
            'asset_id' => [
                'nullable',
                Rule::exists('assets', 'id')->where(fn ($query) => $query->where('client_company_id', $this->input('client_company_id'))),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string', 'max:120'],
            'priority' => ['required', Rule::enum(TicketPriority::class)],
            'impact' => ['nullable', 'integer', 'min:1', 'max:5'],
            'urgency' => ['nullable', 'integer', 'min:1', 'max:5'],
            'status' => ['required', Rule::enum(TicketStatus::class)],
            'source' => ['required', 'string', 'max:80'],
            'assigned_team' => ['nullable', 'string', 'max:120'],
            'assigned_user_id' => ['nullable', Rule::exists('users', 'id')],
            'first_response_due_at' => ['nullable', 'date'],
            'resolution_due_at' => ['nullable', 'date', 'after_or_equal:first_response_due_at'],
            'resolved_at' => ['nullable', 'date'],
            'closed_at' => ['nullable', 'date', 'after_or_equal:resolved_at'],
        ];
    }
}
