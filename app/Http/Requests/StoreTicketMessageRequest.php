<?php

namespace App\Http\Requests;

use App\Enums\TicketMessageType;
use App\Models\Ticket;
use App\Support\TicketAttachmentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Ticket $ticket */
        $ticket = $this->route('ticket');

        if (! $ticket || ! $this->user() || ! $this->user()->can('view', $ticket)) {
            return false;
        }

        $messageType = TicketMessageType::tryFrom((string) $this->input('message_type'));

        if (! $messageType) {
            return false;
        }

        return match ($messageType) {
            TicketMessageType::PublicReply => $this->user()->can('addPublicReply', $ticket),
            TicketMessageType::InternalNote => $this->user()->can('addInternalNote', $ticket),
            TicketMessageType::SystemEvent => false,
        };
    }

    public function rules(): array
    {
        return [
            'message_type' => ['required', Rule::in([
                TicketMessageType::PublicReply->value,
                TicketMessageType::InternalNote->value,
            ])],
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', ...TicketAttachmentRules::validationRules()],
            'attachments.*' => TicketAttachmentRules::fileRules(),
        ];
    }
}
