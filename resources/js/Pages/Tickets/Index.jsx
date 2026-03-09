import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';

export default function TicketsIndex({ tickets, filters, can, domainReferences, staff }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');

  const updateTicket = (ticketId, endpoint, payload = {}) => {
    router.patch(`/tickets/${ticketId}/workflow/${endpoint}`, payload, { preserveScroll: true });
  };

  return (
    <AppLayout title="Tickets" description="Track support cases, assignment, and SLA health." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Tickets</CardTitle>{can.create && <Button asChild size="sm"><Link href="/tickets/create">Create ticket</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); router.get('/tickets', { search: search || undefined, status: status === 'all' ? undefined : status, priority: priority === 'all' ? undefined : priority }, { preserveState: true, replace: true }); }}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket #, title, category" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{priorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Button type="submit" variant="outline">Filter</Button>
          </form>

          {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="Create your first support ticket or refine filters." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Assignee</TableHead><TableHead>Updated</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{tickets.data.map((ticket) => <TableRow key={ticket.id}><TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">{ticket.ticket_number}</Link></TableCell><TableCell>{ticket.title}</TableCell><TableCell>{ticket.client?.name || '—'}</TableCell><TableCell><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell><TableCell>{ticket.assignee?.name || 'Unassigned'}</TableCell><TableCell>{ticket.updated_at}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}`)}>View</DropdownMenuItem>{can.update && <>
                <DropdownMenuItem onSelect={() => updateTicket(ticket.id, 'assignment', { assigned_user_id: null })}>Unassign</DropdownMenuItem>
                {staff.map((user) => <DropdownMenuItem key={user.id} onSelect={() => updateTicket(ticket.id, 'assignment', { assigned_user_id: user.id })}>Assign to {user.name}</DropdownMenuItem>)}
                <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/resolve`)}>Resolve</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/close`)}>Close</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.post(`/tickets/${ticket.id}/workflow/reopen`)}>Reopen</DropdownMenuItem>
              </>}{can.update && <DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this ticket?')) router.delete(`/tickets/${ticket.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
