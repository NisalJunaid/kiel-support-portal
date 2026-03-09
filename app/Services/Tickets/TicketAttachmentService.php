<?php

namespace App\Services\Tickets;

use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class TicketAttachmentService
{
    public function storeForTicket(Ticket $ticket, ?User $user, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store("tickets/{$ticket->id}/attachments", 'local');

            $ticket->attachments()->create([
                'uploaded_by' => $user?->id,
                'disk' => 'local',
                'storage_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? $file->getClientMimeType() ?? 'application/octet-stream',
                'size_bytes' => $file->getSize() ?: 0,
            ]);
        }
    }

    public function storeForMessage(Ticket $ticket, TicketMessage $message, ?User $user, array $files): void
    {
        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $path = $file->store("tickets/{$ticket->id}/messages/{$message->id}", 'local');

            TicketAttachment::create([
                'ticket_id' => $ticket->id,
                'ticket_message_id' => $message->id,
                'uploaded_by' => $user?->id,
                'disk' => 'local',
                'storage_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? $file->getClientMimeType() ?? 'application/octet-stream',
                'size_bytes' => $file->getSize() ?: 0,
            ]);
        }
    }
}
