import { Link } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { usePage } from '@inertiajs/react';

export default function ClientDashboard({ summary, recentTickets, can }) {
  const { props } = usePage();

  return (
    <ClientPortalLayout title="Dashboard" description="A focused view of your company support activity.">
      <section className="grid gap-4 md:grid-cols-3">
        {summary.filter((item) => item.value !== null).map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{item.value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>Your latest company ticket activity.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? <EmptyState title="No tickets yet" description="Your company has no tickets yet. Reach out to your support contact to get started." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link href={`/portal/tickets/${ticket.id}`} className="font-medium hover:underline">{ticket.ticket_number}</Link>
                      <div className="text-xs text-muted-foreground">{ticket.title}</div>
                    </TableCell>
                    <TableCell><DomainPriorityBadge domainReferences={props.domainReferences} value={ticket.priority} /></TableCell>
                    <TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell>
                    <TableCell>{ticket.updated_at || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/portal/tickets" className="rounded-lg border bg-card p-4 text-sm text-foreground transition-colors hover:bg-accent">View my company tickets</Link>
        {can.viewAssets && <Link href="/portal/assets" className="rounded-lg border bg-card p-4 text-sm text-foreground transition-colors hover:bg-accent">Browse company assets</Link>}
        {can.viewContacts && <Link href="/portal/contacts" className="rounded-lg border bg-card p-4 text-sm text-foreground transition-colors hover:bg-accent">View company contacts</Link>}
      </section>
    </ClientPortalLayout>
  );
}
