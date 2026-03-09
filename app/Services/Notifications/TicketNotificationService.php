<?php

namespace App\Services\Notifications;

use App\Enums\TicketMessageType;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketEventNotification;
use Illuminate\Support\Collection;

class TicketNotificationService
{
    public function notifyTicketCreated(Ticket $ticket, User $actor): void
    {
        $this->notifyStakeholders(
            $ticket,
            $actor,
            'ticket_created',
            sprintf('Ticket %s created', $ticket->ticket_number),
            sprintf('%s created "%s".', $actor->name, $ticket->title),
        );
    }

    public function notifyTicketAssigned(Ticket $ticket, ?User $assignee, User $actor): void
    {
        $toName = $assignee?->name ?? 'Unassigned';

        $this->notifyStakeholders(
            $ticket,
            $actor,
            'ticket_assigned',
            sprintf('Ticket %s assignment updated', $ticket->ticket_number),
            sprintf('%s assigned this ticket to %s.', $actor->name, $toName),
        );
    }

    public function notifyPublicReply(Ticket $ticket, User $actor): void
    {
        $this->notifyStakeholders(
            $ticket,
            $actor,
            'ticket_public_reply',
            sprintf('New public reply on %s', $ticket->ticket_number),
            sprintf('%s posted a public reply on "%s".', $actor->name, $ticket->title),
        );
    }

    public function notifyStatusChanged(Ticket $ticket, string $from, string $to, User $actor): void
    {
        $this->notifyStakeholders(
            $ticket,
            $actor,
            'ticket_status_changed',
            sprintf('Ticket %s status changed', $ticket->ticket_number),
            sprintf('%s changed the status from %s to %s.', $actor->name, $from, $to),
        );
    }

    public function shouldNotifyForMessageType(TicketMessageType $type): bool
    {
        return $type === TicketMessageType::PublicReply;
    }

    private function notifyStakeholders(Ticket $ticket, User $actor, string $event, string $title, string $message): void
    {
        $recipients = $this->resolveRecipients($ticket, $actor);

        $recipients->each(function (User $recipient) use ($ticket, $event, $title, $message): void {
            $recipient->notify(new TicketEventNotification($ticket, $event, $title, $message));
        });
    }

    private function resolveRecipients(Ticket $ticket, User $actor): Collection
    {
        $ticket->loadMissing(['requesterUser:id,name,email', 'assignedUser:id,name,email']);

        $staff = User::query()
            ->role(['super-admin', 'admin', 'staff', 'support-agent'])
            ->get(['id', 'name', 'email']);

        return collect([$ticket->requesterUser, $ticket->assignedUser])
            ->filter()
            ->merge($staff)
            ->unique('id')
            ->reject(fn (User $user) => $user->id === $actor->id)
            ->values();
    }
}
