<?php

namespace App\Http\Requests;

use App\Enums\TicketPriority;
use App\Models\Ticket;
use App\Support\TicketAttachmentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientPortalTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Ticket::class) ?? false;
    }

    public function rules(): array
    {
        $companyId = $this->user()?->clientUserProfile?->client_company_id;

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string', 'max:120'],
            'priority' => ['required', Rule::enum(TicketPriority::class)],
            'asset_id' => [
                'nullable',
                Rule::exists('assets', 'id')->where(fn ($query) => $query->where('client_company_id', $companyId)),
            ],
            'attachments' => ['nullable', ...TicketAttachmentRules::validationRules()],
            'attachments.*' => TicketAttachmentRules::fileRules(),
        ];
    }
}
