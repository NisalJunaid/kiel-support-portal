import { Link } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { ListPagination } from '@/Components/shared/list-pagination';
import { usePage } from '@inertiajs/react';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

export default function ClientTicketsIndex({ tickets, canCreate }) {
  const { props } = usePage();

  return (
    <ClientPortalLayout title="My Company Tickets" description="All tickets scoped to your company.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          {canCreate ? (
            <Button asChild size="sm">
              <Link href="/portal/tickets/create">Create ticket</Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="There are no tickets for your company yet." /> : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
                <TableBody>
                  {tickets.data.map((ticket) => (
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
              <ListPagination paginated={tickets} className="mt-4" />
            </>
          )}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
