import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';

export default function SlaPlansShow({ slaPlan, usage, can }) {
  return (
    <AppLayout
      title={slaPlan.name}
      description="SLA plan details and current module usage."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans', href: '/sla-plans' }, { label: slaPlan.name }]}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{slaPlan.name}</CardTitle>
              <CardDescription>Response target {slaPlan.response_minutes} minutes · Resolution target {slaPlan.resolution_minutes} minutes</CardDescription>
            </div>
            <div className="flex gap-2">
              {can.update && <Button asChild variant="outline"><Link href={`/sla-plans/${slaPlan.id}/edit`}>Edit</Link></Button>}
              {can.delete && <Button variant="destructive" onClick={() => { if (confirm('Archive this SLA plan?')) router.delete(`/sla-plans/${slaPlan.id}`); }}>Archive</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{slaPlan.clients_count} clients</Badge>
              <Badge variant="secondary">{slaPlan.services_count} services</Badge>
              <Badge variant="secondary">{slaPlan.tickets_count} tickets</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Business hours</CardTitle></CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{slaPlan.business_hours ? JSON.stringify(slaPlan.business_hours, null, 2) : 'Not configured.'}</pre>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Escalation rules</CardTitle></CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{slaPlan.escalation_rules ? JSON.stringify(slaPlan.escalation_rules, null, 2) : 'Not configured.'}</pre>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent usage</CardTitle><CardDescription>Where this SLA currently appears.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium">Clients</h3>
              {usage.clients.length === 0 ? <EmptyState title="No client assignments" description="Assign this SLA to clients from client edit pages." /> : (
                <ul className="space-y-1 text-sm">{usage.clients.map((client) => <li key={client.id}><Link className="text-primary hover:underline" href={`/clients/${client.id}`}>{client.name}</Link></li>)}</ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Services</h3>
              {usage.services.length === 0 ? <EmptyState title="No service assignments" description="Assign this SLA to services from service edit pages." /> : (
                <ul className="space-y-1 text-sm">{usage.services.map((service) => <li key={service.id}><Link className="text-primary hover:underline" href={`/services/${service.id}`}>{service.name}</Link></li>)}</ul>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Tickets</h3>
              {usage.tickets.length === 0 ? <EmptyState title="No ticket usage" description="Tickets using this SLA will appear here." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {usage.tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell><Link className="text-primary hover:underline" href={`/tickets/${ticket.id}`}>{ticket.ticket_number} · {ticket.subject}</Link></TableCell>
                        <TableCell>{ticket.client_company?.name || '—'}</TableCell>
                        <TableCell>{ticket.status}</TableCell>
                        <TableCell>{ticket.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
