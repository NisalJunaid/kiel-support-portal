import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function TicketsIndex({ tickets, filters, can, domainReferences, staff, clients }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [assignedUserId, setAssignedUserId] = useState(filters.assigned_user_id ? String(filters.assigned_user_id) : 'all');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');
  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');

  const slaBadgeClass = (state) => ({ breached: 'bg-red-100 text-red-700', at_risk: 'bg-amber-100 text-amber-700', healthy: 'bg-emerald-100 text-emerald-700', none: 'bg-muted text-muted-foreground' }[state] || 'bg-muted text-muted-foreground');

  const updateTicket = (ticketId, endpoint, payload = {}) => {
    router.patch(`/tickets/${ticketId}/workflow/${endpoint}`, payload, { preserveScroll: true });
  };

  return (
    <AppLayout title="Tickets" description="Track support cases, assignment, and SLA health." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Tickets</CardTitle>{can.create && <Button asChild size="sm"><Link href="/tickets/create">Create ticket</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); router.get('/tickets', { search: search || undefined, status: status === 'all' ? undefined : status, priority: priority === 'all' ? undefined : priority, assigned_user_id: assignedUserId === 'all' ? undefined : assignedUserId, client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId }, { preserveState: true, replace: true }); }}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket #, title, category" className="md:col-span-2" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{priorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}><SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger><SelectContent><SelectItem value="all">All assignees</SelectItem>{staff.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}</SelectContent></Select>
            <Select value={clientCompanyId} onValueChange={setClientCompanyId}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent><SelectItem value="all">All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select>
            <div className="md:col-span-5 flex gap-2"><Button type="submit" variant="outline">Filter</Button><Button type="button" variant="ghost" onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); setAssignedUserId('all'); setClientCompanyId('all'); router.get('/tickets'); }}>Reset</Button></div>
          </form>

          {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="Create your first support ticket or refine filters." /> : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>SLA</TableHead><TableHead>Assignee</TableHead><TableHead>Updated</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{tickets.data.map((ticket) => <TableRow key={ticket.id}><TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">{ticket.ticket_number}</Link></TableCell><TableCell>{ticket.title}</TableCell><TableCell>{ticket.client?.name || '—'}</TableCell><TableCell><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell><TableCell><div className="flex flex-col gap-1"><Badge className={slaBadgeClass(ticket.sla_response_indicator?.state)} variant="outline">Response: {ticket.sla_response_indicator?.label || '—'}</Badge><Badge className={slaBadgeClass(ticket.sla_resolution_indicator?.state)} variant="outline">Resolution: {ticket.sla_resolution_indicator?.label || '—'}</Badge></div></TableCell><TableCell>{ticket.assignee?.name || 'Unassigned'}</TableCell><TableCell>{ticket.updated_at}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}`)}>View</DropdownMenuItem>{can.update && <>
                  <DropdownMenuItem onSelect={() => updateTicket(ticket.id, 'assignment', { assigned_user_id: null })}>Unassign</DropdownMenuItem>
                  {staff.map((user) => <DropdownMenuItem key={user.id} onSelect={() => updateTicket(ticket.id, 'assignment', { assigned_user_id: user.id })}>Assign to {user.name}</DropdownMenuItem>)}
                  <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/resolve`)}>Resolve</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/close`)}>Close</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/reopen`)}>Reopen</DropdownMenuItem>
                </>}{can.update && <DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this ticket?')) router.delete(`/tickets/${ticket.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody>
              </Table>
              <ListPagination paginated={tickets} />
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
