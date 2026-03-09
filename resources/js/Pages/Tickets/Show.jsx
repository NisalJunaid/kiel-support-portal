import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';

export default function TicketsShow({ ticket, activity, can, domainReferences }) {
  return (
    <AppLayout title={ticket.ticket_number} description={ticket.title} breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets', href: '/tickets' }, { label: ticket.ticket_number }]}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2"><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></div>
        <div className="flex gap-2">{can.update && <Button asChild size="sm" variant="outline"><Link href={`/tickets/${ticket.id}/edit`}>Edit</Link></Button>}{can.delete && <Button size="sm" variant="outline" onClick={() => { if (confirm('Archive this ticket?')) router.delete(`/tickets/${ticket.id}`); }}>Archive</Button>}</div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Client</p><CardTitle className="text-base">{ticket.client?.name || '—'}</CardTitle></CardHeader><CardContent>{ticket.client && <Link className="text-sm underline" href={`/clients/${ticket.client.id}`}>Open client</Link>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Linked asset</p><CardTitle className="text-base">{ticket.asset?.name || 'None'}</CardTitle></CardHeader><CardContent>{ticket.asset && <Link className="text-sm underline" href={`/assets/${ticket.asset.id}`}>Open asset</Link>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Assignee</p><CardTitle className="text-base">{ticket.assigned_user?.name || 'Unassigned'}</CardTitle></CardHeader><CardContent className="text-sm">Team: {ticket.assigned_team || '—'}</CardContent></Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Ticket summary</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-medium">Title:</span> {ticket.title}</p>
          <p><span className="font-medium">Category:</span> {ticket.category}</p>
          <p><span className="font-medium">Source:</span> {ticket.source}</p>
          <p><span className="font-medium">Requester user:</span> {ticket.requester_user?.name || '—'}</p>
          <p><span className="font-medium">Requester contact:</span> {ticket.requester_contact?.full_name || '—'}</p>
          <p><span className="font-medium">Updated:</span> {ticket.updated_at || '—'}</p>
          <p><span className="font-medium">First response due:</span> {ticket.first_response_due_at || '—'}</p>
          <p><span className="font-medium">Resolution due:</span> {ticket.resolution_due_at || '—'}</p>
          <p><span className="font-medium">Resolved at:</span> {ticket.resolved_at || '—'}</p>
          <p><span className="font-medium">Closed at:</span> {ticket.closed_at || '—'}</p>
          <p className="md:col-span-2"><span className="font-medium">Description:</span> {ticket.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent><EmptyState title="No messages yet" description="Ticket conversation area is ready for replies and internal notes." /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Activity log</CardTitle></CardHeader>
        <CardContent>
          {activity.length === 0 ? <EmptyState title="No activity yet" description="Ticket changes will appear here." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Description</TableHead><TableHead>Actor</TableHead><TableHead>At</TableHead></TableRow></TableHeader>
              <TableBody>{activity.map((item) => <TableRow key={item.id}><TableCell>{item.event}</TableCell><TableCell>{item.description}</TableCell><TableCell>{item.causer_name || 'System'}</TableCell><TableCell>{item.created_at}</TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
