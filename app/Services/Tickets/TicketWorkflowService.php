<?php

namespace App\Services\Tickets;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class TicketWorkflowService
{
    public function assign(Ticket $ticket, ?User $assignee): array
    {
        $from = $ticket->assignedUser?->name;
        $to = $assignee?->name;

        if ($ticket->assigned_user_id === $assignee?->id) {
            return [];
        }

        $ticket->assigned_user_id = $assignee?->id;
        $ticket->save();

        return [
            'field' => 'assignee',
            'from' => $from,
            'to' => $to,
            'description' => sprintf('Assignee changed from %s to %s.', $from ?: 'unassigned', $to ?: 'unassigned'),
        ];
    }

    public function updatePriority(Ticket $ticket, string $priority): array
    {
        $from = $ticket->priority?->value;

        if ($from === $priority) {
            return [];
        }

        $ticket->priority = $priority;
        $ticket->save();

        return [
            'field' => 'priority',
            'from' => $from,
            'to' => $priority,
            'description' => sprintf('Priority changed from %s to %s.', $from ?: 'unset', $priority),
        ];
    }

    public function transitionStatus(Ticket $ticket, TicketStatus $toStatus, ?Carbon $at = null): array
    {
        $fromStatus = $ticket->status;

        if ($fromStatus === $toStatus) {
            return [];
        }

        if (! $this->isValidTransition($fromStatus, $toStatus)) {
            throw ValidationException::withMessages([
                'status' => sprintf('Cannot transition ticket from %s to %s.', $fromStatus?->label() ?? 'Unknown', $toStatus->label()),
            ]);
        }

        $ticket->status = $toStatus;

        if ($toStatus === TicketStatus::Resolved) {
            $ticket->resolved_at = $at ?: now();
        }

        if ($toStatus === TicketStatus::Closed) {
            $ticket->closed_at = $at ?: now();
            $ticket->resolved_at = $ticket->resolved_at ?: $ticket->closed_at;
        }

        if (in_array($toStatus, [TicketStatus::Open, TicketStatus::InProgress, TicketStatus::PendingClient], true)) {
            $ticket->closed_at = null;
            if ($fromStatus === TicketStatus::Closed) {
                $ticket->resolved_at = null;
            }
        }

        $ticket->save();

        return [
            'field' => 'status',
            'from' => $fromStatus?->value,
            'to' => $toStatus->value,
            'description' => sprintf('Status changed from %s to %s.', $fromStatus?->label() ?? 'Unknown', $toStatus->label()),
        ];
    }

    private function isValidTransition(?TicketStatus $from, TicketStatus $to): bool
    {
        if (! $from) {
            return true;
        }

        $allowed = match ($from) {
            TicketStatus::New => [TicketStatus::Open, TicketStatus::InProgress, TicketStatus::PendingClient, TicketStatus::Resolved, TicketStatus::Closed],
            TicketStatus::Open => [TicketStatus::InProgress, TicketStatus::PendingClient, TicketStatus::Resolved, TicketStatus::Closed],
            TicketStatus::InProgress => [TicketStatus::PendingClient, TicketStatus::Resolved, TicketStatus::Open, TicketStatus::Closed],
            TicketStatus::PendingClient => [TicketStatus::Open, TicketStatus::InProgress, TicketStatus::Resolved, TicketStatus::Closed],
            TicketStatus::Resolved => [TicketStatus::Closed, TicketStatus::Open, TicketStatus::InProgress],
            TicketStatus::Closed => [TicketStatus::Open, TicketStatus::InProgress],
        };

        return in_array($to, $allowed, true);
    }
}
