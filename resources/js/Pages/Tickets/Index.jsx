import AppLayout from '@/Layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader } from '@/Components/ui/table';
import { DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';
import { FilterBar } from '@/Components/shared/filter-bar';
import { RowActionsDropdown } from '@/Components/shared/row-actions-dropdown';
import { SectionCard } from '@/Components/shared/section-card';
import { ClickableTableRow } from '@/Components/shared/clickable-table-row';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { TicketDetailWorkspace } from '@/Pages/Tickets/Partials/TicketDetailWorkspace';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import TicketForm from '@/Pages/Tickets/Partials/TicketForm';

export default function TicketsIndex({ tickets, filters, can, domainReferences, staff, clients, drawerTicket = null, formData, defaults, currentUser }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [assignedUserId, setAssignedUserId] = useState(filters.assigned_user_id ? String(filters.assigned_user_id) : 'all');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');
  const [selectedTicketId, setSelectedTicketId] = useState(drawerTicket?.ticket?.id || null);
  const [createOpen, setCreateOpen] = useState(false);
  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');
  const { data, setData, post, processing, errors, reset } = useForm({ client_company_id: formData.defaultClientId || '', requester_user_id: '', requester_contact_id: '', asset_id: formData.defaultAssetId || '', service_id: formData.defaultServiceId || '', title: '', description: '', category: '', priority: defaults.priority, impact: '', urgency: '', status: defaults.status, source: defaults.source, assigned_team: '', assigned_user_id: '', sla_plan_id: '', first_response_due_at: '', resolution_due_at: '', resolved_at: '', closed_at: '', attachments: [], from_drawer: true });

  const indexParams = useMemo(() => ({ search: search || undefined, status: status === 'all' ? undefined : status, priority: priority === 'all' ? undefined : priority, assigned_user_id: assignedUserId === 'all' ? undefined : assignedUserId, client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId }), [search, status, priority, assignedUserId, clientCompanyId]);
  const openTicketDrawer = (ticketId) => { setSelectedTicketId(ticketId); router.get('/tickets', { ...indexParams, drawer_ticket: ticketId }, { preserveState: true, preserveScroll: true, replace: true, only: ['drawerTicket'] }); };
  const closeTicketDrawer = () => { setSelectedTicketId(null); router.get('/tickets', indexParams, { preserveState: true, preserveScroll: true, replace: true, only: ['drawerTicket'] }); };
  const refreshTicketData = () => router.reload({ only: ['tickets', 'drawerTicket'], preserveScroll: true, preserveState: true });

  const quickWorkflowActions = (ticket) => {
    if (!ticket.can?.update) {
      return { directActions: [], transitionActions: [] };
    }

    const directActions = [
      {
        label: 'Assign to me',
        visible: currentUser?.id && ticket.assignee?.id !== currentUser.id,
        run: () => router.patch(`/tickets/${ticket.id}/workflow/assignment`, { assigned_user_id: currentUser.id }, { preserveScroll: true, onSuccess: refreshTicketData }),
      },
      {
        label: 'Change status',
        visible: true,
        run: () => openTicketDrawer(ticket.id),
      },
      {
        label: 'Change priority',
        visible: true,
        run: () => openTicketDrawer(ticket.id),
      },
    ].filter((action) => action.visible);

    const transitionActions = [
      {
        label: 'Resolve',
        visible: ticket.status !== 'resolved' && ticket.status !== 'closed',
        run: () => router.post(`/tickets/${ticket.id}/workflow/resolve`, {}, { preserveScroll: true, onSuccess: refreshTicketData }),
      },
      {
        label: 'Close',
        visible: ticket.status !== 'closed',
        run: () => router.post(`/tickets/${ticket.id}/workflow/close`, {}, { preserveScroll: true, onSuccess: refreshTicketData }),
      },
      {
        label: 'Reopen',
        visible: ticket.status === 'resolved' || ticket.status === 'closed',
        run: () => router.post(`/tickets/${ticket.id}/workflow/reopen`, {}, { preserveScroll: true, onSuccess: refreshTicketData }),
      },
    ].filter((action) => action.visible);

    return { directActions, transitionActions };
  };

  return (
    <AppLayout title="Tickets" description="Track support cases, assignment, and SLA health." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets' }]}> 
      <SectionCard title="Tickets" description="Case queue with SLA and workflow controls." action={can.create && <Button size="sm" onClick={() => setCreateOpen(true)}>Create ticket</Button>}>
        <FilterBar onSubmit={(e) => { e.preventDefault(); router.get('/tickets', indexParams, { preserveState: true, replace: true }); }} onReset={() => { setSearch(''); setStatus('all'); setPriority('all'); setAssignedUserId('all'); setClientCompanyId('all'); router.get('/tickets'); }} submitLabel="Filter">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket #, title, category" className="md:col-span-2" />
          <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
          <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{priorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
          <Select value={assignedUserId} onValueChange={setAssignedUserId}><SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger><SelectContent><SelectItem value="all">All assignees</SelectItem>{staff.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}</SelectContent></Select>
          <Select value={clientCompanyId} onValueChange={setClientCompanyId}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent><SelectItem value="all">All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select>
        </FilterBar>

        {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="Create your first support ticket or refine filters." /> : <><Table><TableHeader><tr><TableHead>Ticket</TableHead><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Assignee</TableHead><TableHead>Updated</TableHead><TableHead /></tr></TableHeader><TableBody>{tickets.data.map((ticket) => { const { directActions, transitionActions } = quickWorkflowActions(ticket); const hasActions = directActions.length > 0 || transitionActions.length > 0; return <ClickableTableRow key={ticket.id} onOpen={() => openTicketDrawer(ticket.id)}><TableCell className="font-medium">{ticket.ticket_number}</TableCell><TableCell>{ticket.title}</TableCell><TableCell>{ticket.client?.name || '—'}</TableCell><TableCell><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell><TableCell>{ticket.assignee?.name || 'Unassigned'}</TableCell><TableCell>{ticket.updated_at}</TableCell><TableCell className="text-right" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}><RowActionsDropdown>{!hasActions ? <DropdownMenuItem disabled>No actions available</DropdownMenuItem> : <>{directActions.map((action) => <DropdownMenuItem key={`${ticket.id}-${action.label}`} onSelect={action.run}>{action.label}</DropdownMenuItem>)}{transitionActions.map((action) => <DropdownMenuItem key={`${ticket.id}-${action.label}`} onSelect={action.run}>{action.label}</DropdownMenuItem>)}</>}</RowActionsDropdown></TableCell></ClickableTableRow>; })}</TableBody></Table><ListPagination paginated={tickets} /></>}
      </SectionCard>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); reset(); }} title="Create ticket" description="Open a new support ticket." processing={processing}>
        <TicketForm data={data} setData={setData} errors={errors} processing={processing} formData={formData} domainReferences={domainReferences} submitLabel="Create ticket" onSubmit={(e) => { e.preventDefault(); post('/tickets', { forceFormData: true, preserveScroll: true, onSuccess: () => { setCreateOpen(false); reset(); } }); }} />
      </EntityCreateDrawer>

      <Sheet open={!!selectedTicketId && !!drawerTicket?.ticket} onOpenChange={(open) => !open && closeTicketDrawer()}>
        <SheetContent side="right" className="z-[120] w-full border-l bg-card p-0 text-card-foreground sm:max-w-[72rem]">
          <div className="flex h-full min-h-0 flex-col"><SheetHeader className="border-b px-6 py-4"><SheetTitle>{drawerTicket?.ticket?.ticket_number}</SheetTitle><SheetDescription>{drawerTicket?.ticket?.title}</SheetDescription></SheetHeader><div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{drawerTicket?.ticket ? <TicketDetailWorkspace embedded ticket={drawerTicket.ticket} messages={drawerTicket.messages} attachments={drawerTicket.attachments} can={drawerTicket.can} domainReferences={domainReferences} slaIndicators={drawerTicket.slaIndicators} staff={staff} onWorkflowSuccess={refreshTicketData} /> : null}</div></div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
