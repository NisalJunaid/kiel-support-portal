<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketAttachmentController extends Controller
{
    public function show(Request $request, Ticket $ticket, TicketAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $ticket);

        abort_unless($attachment->ticket_id === $ticket->id, 404);

        return Storage::disk($attachment->disk)->download(
            $attachment->storage_path,
            $attachment->original_name,
            [
                'Content-Type' => $attachment->mime_type,
            ],
        );
    }
}
