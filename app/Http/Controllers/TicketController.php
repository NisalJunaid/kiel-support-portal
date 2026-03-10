<?php

namespace App\Http\Controllers;

use App\Actions\Tickets\GenerateTicketNumber;
use App\Enums\TicketMessageType;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Asset;
use App\Models\ClientCompany;
use App\Models\ClientContact;
use App\Models\ClientUserProfile;
use App\Models\Service;
use App\Models\SlaPlan;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\Tickets\TicketAttachmentService;
use App\Services\Tickets\SlaDeadlineService;
use App\Services\Tickets\TicketMessageService;
use App\Services\Notifications\TicketNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Support\ActivityPresenter;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class TicketController extends Controller
{
    public function index(Request $request, SlaDeadlineService $slaDeadlineService): Response
    {
        $this->authorize('viewAny', Ticket::class);

        $search = trim((string) $request->string('search'));
        $status = $request->string('status')->toString();
        $priority = $request->string('priority')->toString();
        $assigneeId = $request->integer('assigned_user_id') ?: null;
        $clientId = $request->integer('client_company_id') ?: null;

        $tickets = Ticket::query()
            ->with(['clientCompany:id,name', 'asset:id,name,asset_code', 'service:id,name', 'slaPlan:id,name', 'assignedUser:id,name'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($priority, fn ($query) => $query->where('priority', $priority))
            ->when($assigneeId, fn ($query) => $query->where('assigned_user_id', $assigneeId))
            ->when($clientId, fn ($query) => $query->where('client_company_id', $clientId))
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'title' => $ticket->title,
                'priority' => $ticket->priority?->value,
                'status' => $ticket->status?->value,
                'client' => $ticket->clientCompany,
                'asset' => $ticket->asset,
                'service' => $ticket->service,
                'sla_plan' => $ticket->slaPlan ? ['id' => $ticket->slaPlan->id, 'name' => $ticket->slaPlan->name] : null,
                'assignee' => $ticket->assignedUser,
                'updated_at' => optional($ticket->updated_at)?->diffForHumans(),
                'first_response_due_at' => optional($ticket->first_response_due_at)?->toDateTimeString(),
                'resolution_due_at' => optional($ticket->resolution_due_at)?->toDateTimeString(),
                'sla_response_indicator' => $slaDeadlineService->computeIndicator($ticket, 'first_response_due_at'),
                'sla_resolution_indicator' => $slaDeadlineService->computeIndicator($ticket, 'resolution_due_at'),
            ]);

        $drawerTicketId = $request->integer('drawer_ticket') ?: null;
        $drawerTicket = null;

        if ($drawerTicketId) {
            $candidate = Ticket::query()->find($drawerTicketId);

            if ($candidate && $request->user()->can('view', $candidate)) {
                $drawerTicket = $this->ticketWorkspacePayload($request, $candidate, $slaDeadlineService);
            }
        }

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'priority' => $priority,
                'assigned_user_id' => $assigneeId,
                'client_company_id' => $clientId,
            ],
            'drawerTicket' => $drawerTicket,
            'staff' => User::query()->role(['super-admin', 'admin', 'staff', 'support-agent'])->orderBy('name')->get(['id', 'name']),
            'clients' => ClientCompany::query()->orderBy('name')->get(['id', 'name']),
            'formData' => $this->formData(),
            'defaults' => [
                'status' => 'new',
                'priority' => 'medium',
                'source' => 'portal',
            ],
            'can' => [
                'create' => $request->user()->can('create', Ticket::class),
                'update' => $request->user()->can('tickets.update'),
                'delete' => $request->user()->can('tickets.delete'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Ticket::class);

        return Inertia::render('Tickets/Create', [
            'formData' => $this->formData(
                $request->integer('client') ?: null,
                $request->integer('asset') ?: null,
                $request->integer('service') ?: null,
            ),
            'defaults' => [
                'status' => 'new',
                'priority' => 'medium',
                'source' => 'portal',
            ],
        ]);
    }

    public function store(StoreTicketRequest $request, GenerateTicketNumber $generateTicketNumber, TicketMessageService $ticketMessageService, TicketAttachmentService $ticketAttachmentService, SlaDeadlineService $slaDeadlineService, TicketNotificationService $ticketNotificationService): RedirectResponse
    {
        $data = $request->validated();
        $data['ticket_number'] = $generateTicketNumber->execute();

        $planId = $slaDeadlineService->resolvePlanId($data);
        $calculatedDeadlines = $slaDeadlineService->calculateDeadlines($planId, now());
        $data['sla_plan_id'] = $data['sla_plan_id'] ?? $calculatedDeadlines['sla_plan_id'];
        $data['first_response_due_at'] = $data['first_response_due_at'] ?? $calculatedDeadlines['first_response_due_at'];
        $data['resolution_due_at'] = $data['resolution_due_at'] ?? $calculatedDeadlines['resolution_due_at'];

        $ticket = Ticket::create($data);

        if ($ticket->asset_id) {
            DB::table('asset_ticket_links')->updateOrInsert(
                ['asset_id' => $ticket->asset_id, 'ticket_id' => $ticket->id],
                ['updated_at' => now(), 'created_at' => now()],
            );
        }

        activity('tickets')
            ->performedOn($ticket)
            ->causedBy($request->user())
            ->event('created')
            ->withProperties([
                'ticket_number' => $ticket->ticket_number,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
            ])
            ->log('Ticket created');

        $ticketMessageService->createSystemEvent($ticket, sprintf('Ticket %s was created with %s priority and %s status.', $ticket->ticket_number, $ticket->priority?->label() ?? 'unknown', $ticket->status?->label() ?? 'unknown'));

        $ticketAttachmentService->storeForTicket($ticket, $request->user(), $request->file('attachments', []));

        $ticketNotificationService->notifyTicketCreated($ticket, $request->user());

        if ($request->boolean('from_drawer')) {
            return back()->with('success', 'Ticket created successfully.');
        }

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket created successfully.');
    }

    public function show(Request $request, Ticket $ticket, SlaDeadlineService $slaDeadlineService): Response
    {
        $this->authorize('view', $ticket);


        return Inertia::render('Tickets/Show', [
            ...$this->ticketWorkspacePayload($request, $ticket, $slaDeadlineService),
            'formData' => $this->formData($ticket->client_company_id, $ticket->asset_id, $ticket->service_id),
        ]);
    }

    public function edit(Ticket $ticket): Response
    {
        $this->authorize('update', $ticket);

        return Inertia::render('Tickets/Edit', [
            'ticket' => [
                ...$ticket->toArray(),
                'priority' => $ticket->priority?->value,
                'status' => $ticket->status?->value,
                'first_response_due_at' => optional($ticket->first_response_due_at)?->format('Y-m-d\TH:i'),
                'resolution_due_at' => optional($ticket->resolution_due_at)?->format('Y-m-d\TH:i'),
                'resolved_at' => optional($ticket->resolved_at)?->format('Y-m-d\TH:i'),
                'closed_at' => optional($ticket->closed_at)?->format('Y-m-d\TH:i'),
            ],
            'formData' => $this->formData($ticket->client_company_id, $ticket->asset_id, $ticket->service_id),
        ]);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket, TicketMessageService $ticketMessageService, SlaDeadlineService $slaDeadlineService): RedirectResponse
    {
        $previousStatus = $ticket->status?->value;
        $previousPriority = $ticket->priority?->value;
        $previousAssignee = $ticket->assignedUser?->name;

        $payload = $request->validated();
        $planId = $slaDeadlineService->resolvePlanId($payload);
        $calculatedDeadlines = $slaDeadlineService->calculateDeadlines($planId, now());
        $payload['sla_plan_id'] = $payload['sla_plan_id'] ?? $calculatedDeadlines['sla_plan_id'];
        $payload['first_response_due_at'] = $payload['first_response_due_at'] ?? $calculatedDeadlines['first_response_due_at'];
        $payload['resolution_due_at'] = $payload['resolution_due_at'] ?? $calculatedDeadlines['resolution_due_at'];

        $ticket->update($payload);

        DB::table('asset_ticket_links')->where('ticket_id', $ticket->id)->delete();
        if ($ticket->asset_id) {
            DB::table('asset_ticket_links')->updateOrInsert(
                ['asset_id' => $ticket->asset_id, 'ticket_id' => $ticket->id],
                ['updated_at' => now(), 'created_at' => now()],
            );
        }

        activity('tickets')
            ->performedOn($ticket)
            ->causedBy($request->user())
            ->event('updated')
            ->withProperties([
                'ticket_number' => $ticket->ticket_number,
                'status' => $ticket->status?->value,
                'priority' => $ticket->priority?->value,
            ])
            ->log('Ticket updated');

        $changes = [];

        if ($previousStatus !== $ticket->status?->value) {
            $changes[] = sprintf('Status changed from %s to %s', $previousStatus ?: 'unset', $ticket->status?->value ?: 'unset');
        }

        if ($previousPriority !== $ticket->priority?->value) {
            $changes[] = sprintf('Priority changed from %s to %s', $previousPriority ?: 'unset', $ticket->priority?->value ?: 'unset');
        }

        $newAssignee = $ticket->assignedUser?->name;
        if ($previousAssignee !== $newAssignee) {
            $changes[] = sprintf('Assignee changed from %s to %s', $previousAssignee ?: 'unassigned', $newAssignee ?: 'unassigned');
        }

        if ($changes !== []) {
            $ticketMessageService->createSystemEvent($ticket, implode('. ', $changes).'.');
        }

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Request $request, Ticket $ticket, TicketMessageService $ticketMessageService): RedirectResponse
    {
        $this->authorize('delete', $ticket);

        DB::table('asset_ticket_links')->where('ticket_id', $ticket->id)->delete();
        $ticket->delete();

        activity('tickets')
            ->performedOn($ticket)
            ->causedBy($request->user())
            ->event('archived')
            ->withProperties(['ticket_number' => $ticket->ticket_number])
            ->log('Ticket archived');

        $ticketMessageService->createSystemEvent($ticket, sprintf('Ticket %s was archived.', $ticket->ticket_number));

        return redirect()->route('tickets.index')->with('success', 'Ticket archived successfully.');
    }


    private function ticketWorkspacePayload(Request $request, Ticket $ticket, SlaDeadlineService $slaDeadlineService): array
    {
        $ticket->load([
            'clientCompany:id,name,client_code',
            'asset:id,name,asset_code',
            'service:id,name',
            'slaPlan:id,name,response_minutes,resolution_minutes',
            'requesterUser:id,name,email',
            'requesterContact:id,full_name,email',
            'assignedUser:id,name,email',
            'messages.author:id,name,email',
            'attachments.uploader:id,name',
            'messages.attachments.uploader:id,name',
        ]);

        $isClientScopedUser = $request->user()?->hasRole('client-user') ?? false;

        $messages = $ticket->messages
            ->when($isClientScopedUser, fn ($collection) => $collection->filter(fn (TicketMessage $message) => $message->isVisibleToClient()))
            ->sortBy('created_at')
            ->values();

        $activity = Activity::query()
            ->where('subject_type', Ticket::class)
            ->where('subject_id', $ticket->id)
            ->latest()
            ->limit(10)
            ->get();

        return [
            'ticket' => [
                ...$ticket->toArray(),
                'priority' => $ticket->priority?->value,
                'status' => $ticket->status?->value,
                'client' => $ticket->clientCompany,
                'asset' => $ticket->asset,
                'service' => $ticket->service,
                'sla_plan' => $ticket->slaPlan ? ['id' => $ticket->slaPlan->id, 'name' => $ticket->slaPlan->name] : null,
                'requester_user' => $ticket->requesterUser,
                'requester_contact' => $ticket->requesterContact,
                'assigned_user' => $ticket->assignedUser,
                'first_response_due_at' => optional($ticket->first_response_due_at)?->toDateTimeString(),
                'resolution_due_at' => optional($ticket->resolution_due_at)?->toDateTimeString(),
                'resolved_at' => optional($ticket->resolved_at)?->toDateTimeString(),
                'closed_at' => optional($ticket->closed_at)?->toDateTimeString(),
                'updated_at' => optional($ticket->updated_at)?->toDateTimeString(),
            ],
            'attachments' => $ticket->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
                'uploaded_by' => $attachment->uploader?->name,
                'download_url' => route('tickets.attachments.show', ['ticket' => $ticket->id, 'attachment' => $attachment->id]),
                'created_at' => optional($attachment->created_at)?->toDateTimeString(),
            ])->values(),
            'activity' => $activity->map(fn (Activity $item) => ActivityPresenter::forTimeline($item))->values(),
            'messages' => $messages->map(fn (TicketMessage $message) => [
                'id' => $message->id,
                'message_type' => $message->message_type?->value,
                'message_type_label' => $message->message_type?->label(),
                'body' => $message->body,
                'author' => $message->author,
                'is_system' => $message->message_type === TicketMessageType::SystemEvent,
                'created_at' => optional($message->created_at)?->toDateTimeString(),
                'attachments' => $message->attachments->map(fn ($attachment) => [
                    'id' => $attachment->id,
                    'name' => $attachment->original_name,
                    'mime_type' => $attachment->mime_type,
                    'size_bytes' => $attachment->size_bytes,
                    'uploaded_by' => $attachment->uploader?->name,
                    'download_url' => route('tickets.attachments.show', ['ticket' => $ticket->id, 'attachment' => $attachment->id]),
                ])->values(),
            ])->values(),
            'slaIndicators' => [
                'first_response' => $slaDeadlineService->computeIndicator($ticket, 'first_response_due_at'),
                'resolution' => $slaDeadlineService->computeIndicator($ticket, 'resolution_due_at'),
            ],
            'can' => [
                'update' => $request->user()->can('update', $ticket),
                'delete' => $request->user()->can('delete', $ticket),
                'addPublicReply' => $request->user()->can('addPublicReply', $ticket),
                'addInternalNote' => $request->user()->can('addInternalNote', $ticket),
            ],
        ];
    }

    private function formData(?int $defaultClientId = null, ?int $defaultAssetId = null, ?int $defaultServiceId = null): array
    {
        return [
            'clients' => ClientCompany::query()->orderBy('name')->get(['id', 'name', 'client_code']),
            'contacts' => ClientContact::query()->orderBy('full_name')->get(['id', 'full_name', 'client_company_id']),
            'assets' => Asset::query()->orderBy('name')->get(['id', 'name', 'asset_code', 'client_company_id']),
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'client_company_id']),
            'slaPlans' => SlaPlan::query()->orderBy('name')->get(['id', 'name', 'response_minutes', 'resolution_minutes']),
            'clientUsers' => ClientUserProfile::query()
                ->with('user:id,name,email')
                ->orderBy('id')
                ->get(['id', 'user_id', 'client_company_id'])
                ->map(fn (ClientUserProfile $profile) => [
                    'id' => $profile->user_id,
                    'name' => $profile->user?->name,
                    'email' => $profile->user?->email,
                    'client_company_id' => $profile->client_company_id,
                ])->values(),
            'staff' => User::query()->role(['super-admin', 'admin', 'staff', 'support-agent'])->orderBy('name')->get(['id', 'name']),
            'clients' => ClientCompany::query()->orderBy('name')->get(['id', 'name']),
            'formData' => $this->formData(),
            'defaults' => [
                'status' => 'new',
                'priority' => 'medium',
                'source' => 'portal',
            ],
            'defaultClientId' => $defaultClientId,
            'defaultAssetId' => $defaultAssetId,
            'defaultServiceId' => $defaultServiceId,
        ];
    }
}
