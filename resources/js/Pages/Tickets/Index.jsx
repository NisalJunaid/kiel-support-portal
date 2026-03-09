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

export default function TicketsIndex({ tickets, filters, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [priority, setPriority] = useState(filters.priority || '');

  return (
    <AppLayout title="Tickets" description="Track support cases, assignment, and SLA health." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Tickets</CardTitle>{can.create && <Button asChild size="sm"><Link href="/tickets/create">Create ticket</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-2 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); router.get('/tickets', { search: search || undefined, status: status || undefined, priority: priority || undefined }, { preserveState: true, replace: true }); }}>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ticket #, title, category" />
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status (e.g. open)" />
            <Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="Priority (e.g. high)" />
            <Button type="submit" variant="outline">Filter</Button>
          </form>

          {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="Create your first support ticket or refine filters." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Title</TableHead><TableHead>Client</TableHead><TableHead>Asset</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Assignee</TableHead><TableHead>Updated</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{tickets.data.map((ticket) => <TableRow key={ticket.id}><TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">{ticket.ticket_number}</Link></TableCell><TableCell>{ticket.title}</TableCell><TableCell>{ticket.client?.name || '—'}</TableCell><TableCell>{ticket.asset ? <Link href={`/assets/${ticket.asset.id}`} className="hover:underline">{ticket.asset.name}</Link> : '—'}</TableCell><TableCell><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell><TableCell>{ticket.assignee?.name || 'Unassigned'}</TableCell><TableCell>{ticket.updated_at}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}`)}>View</DropdownMenuItem>{can.update && <DropdownMenuItem onSelect={() => router.visit(`/tickets/${ticket.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this ticket?')) router.delete(`/tickets/${ticket.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
