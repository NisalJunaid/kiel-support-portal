<?php

namespace App\Http\Controllers;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Notifications\TicketNotificationService;
use App\Services\Tickets\TicketMessageService;
use App\Services\Tickets\TicketWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TicketWorkflowController extends Controller
{
    public function assign(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'assigned_user_id' => ['nullable', Rule::exists('users', 'id')],
        ]);

        $assignee = isset($validated['assigned_user_id']) && $validated['assigned_user_id']
            ? User::find($validated['assigned_user_id'])
            : null;

        $change = $workflowService->assign($ticket, $assignee);

        if ($change !== []) {
            activity('tickets')
                ->performedOn($ticket)
                ->causedBy($request->user())
                ->event('assigned')
                ->withProperties([
                    'ticket_number' => $ticket->ticket_number,
                    'assigned_user_id' => $ticket->assigned_user_id,
                ])
                ->log('Ticket assignment updated');

            $ticketMessageService->createSystemEvent($ticket, $change['description']);
            $ticketNotificationService->notifyTicketAssigned($ticket, $assignee, $request->user());
        }

        return back()->with('success', 'Ticket assignment updated.');
    }

    public function status(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'status' => ['required', Rule::enum(TicketStatus::class)],
        ]);

        $change = $workflowService->transitionStatus($ticket, TicketStatus::from($validated['status']));

        if ($change !== []) {
            activity('tickets')
                ->performedOn($ticket)
                ->causedBy($request->user())
                ->event('status_changed')
                ->withProperties([
                    'ticket_number' => $ticket->ticket_number,
                    'from_status' => $change['from'],
                    'to_status' => $change['to'],
                ])
                ->log('Ticket status changed');

            $ticketMessageService->createSystemEvent($ticket, $change['description']);
            $ticketNotificationService->notifyStatusChanged($ticket, $change['from'] ?? 'unknown', $change['to'] ?? 'unknown', $request->user());
        }

        return back()->with('success', 'Ticket status updated.');
    }

    public function priority(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $validated = $request->validate([
            'priority' => ['required', Rule::enum(TicketPriority::class)],
        ]);

        $change = $workflowService->updatePriority($ticket, $validated['priority']);

        if ($change !== []) {
            activity('tickets')
                ->performedOn($ticket)
                ->causedBy($request->user())
                ->event('priority_changed')
                ->withProperties([
                    'ticket_number' => $ticket->ticket_number,
                    'from_priority' => $change['from'],
                    'to_priority' => $change['to'],
                ])
                ->log('Ticket priority changed');

            $ticketMessageService->createSystemEvent($ticket, $change['description']);
        }

        return back()->with('success', 'Ticket priority updated.');
    }

    public function resolve(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        return $this->transitionViaAction($request, $ticket, $workflowService, $ticketMessageService, $ticketNotificationService, TicketStatus::Resolved, 'resolved');
    }

    public function close(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        return $this->transitionViaAction($request, $ticket, $workflowService, $ticketMessageService, $ticketNotificationService, TicketStatus::Closed, 'closed');
    }

    public function reopen(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        return $this->transitionViaAction($request, $ticket, $workflowService, $ticketMessageService, $ticketNotificationService, TicketStatus::Open, 'reopened');
    }

    private function transitionViaAction(Request $request, Ticket $ticket, TicketWorkflowService $workflowService, TicketMessageService $ticketMessageService, TicketNotificationService $ticketNotificationService, TicketStatus $toStatus, string $event): RedirectResponse
    {
        $this->authorize('update', $ticket);

        $change = $workflowService->transitionStatus($ticket, $toStatus);

        if ($change !== []) {
            activity('tickets')
                ->performedOn($ticket)
                ->causedBy($request->user())
                ->event($event)
                ->withProperties([
                    'ticket_number' => $ticket->ticket_number,
                    'from_status' => $change['from'],
                    'to_status' => $change['to'],
                ])
                ->log(sprintf('Ticket %s', $event));

            $ticketMessageService->createSystemEvent($ticket, $change['description']);
            $ticketNotificationService->notifyStatusChanged($ticket, $change['from'] ?? 'unknown', $change['to'] ?? 'unknown', $request->user());
        }

        return back()->with('success', sprintf('Ticket %s.', $event));
    }
}
