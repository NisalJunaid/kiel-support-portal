import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

export default function ReportsIndex({ summary, ticketsByStatus, ticketsByPriority, ticketsByClient, slaCompliance, assetsExpiringSoon, servicesRenewingSoon }) {
  const { props } = usePage();

  const dayLabel = (days) => {
    if (days === null || days === undefined) return '—';
    if (days === 0) return 'Today';
    if (days < 0) return `${Math.abs(days)} days overdue`;

    return `${days} days`;
  };

  return (
    <AppLayout
      title="Reports"
      description="Operational reporting for ticket load, SLA performance, and upcoming renewals."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Tickets</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.tickets_total}</p><p className="mt-2 text-xs text-muted-foreground">All currently tracked tickets.</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Assets Expiring (30d)</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.assets_expiring_count}</p><p className="mt-2 text-xs text-muted-foreground">Non-retired assets renewing soon.</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Services Renewing (30d)</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.services_renewing_count}</p><p className="mt-2 text-xs text-muted-foreground">Active services approaching renewal.</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Top Client Ticket Load</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold">{summary.top_client_ticket_count}</p><p className="mt-2 text-xs text-muted-foreground">Highest ticket volume for one client.</p></CardContent></Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Tickets by Status</CardTitle><CardDescription>Current distribution of workflow states.</CardDescription></CardHeader>
          <CardContent>
            {ticketsByStatus.length === 0 ? <EmptyState title="No ticket data" description="Ticket status totals will appear once records exist." /> : (
              <Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead className="text-right">Tickets</TableHead></TableRow></TableHeader><TableBody>
                {ticketsByStatus.map((row) => <TableRow key={row.status}><TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="ticketStatus" value={row.status} /></TableCell><TableCell className="text-right font-medium">{row.total}</TableCell></TableRow>)}
              </TableBody></Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tickets by Priority</CardTitle><CardDescription>Where urgency is concentrated.</CardDescription></CardHeader>
          <CardContent>
            {ticketsByPriority.length === 0 ? <EmptyState title="No ticket data" description="Ticket priority totals will appear once records exist." /> : (
              <Table><TableHeader><TableRow><TableHead>Priority</TableHead><TableHead className="text-right">Tickets</TableHead></TableRow></TableHeader><TableBody>
                {ticketsByPriority.map((row) => <TableRow key={row.priority}><TableCell><DomainPriorityBadge domainReferences={props.domainReferences} value={row.priority} /></TableCell><TableCell className="text-right font-medium">{row.total}</TableCell></TableRow>)}
              </TableBody></Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SLA Compliance</CardTitle><CardDescription>Resolution performance against due dates.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {!slaCompliance.is_available ? <EmptyState title="SLA data unavailable" description="Create/resolved tickets with due dates to compute SLA metrics." /> : (
              <>
                <div className="flex items-center justify-between rounded-md border p-3"><span className="text-sm">Resolved within SLA</span><Badge variant="default">{slaCompliance.resolved_within_sla}</Badge></div>
                <div className="flex items-center justify-between rounded-md border p-3"><span className="text-sm">Resolved breaching SLA</span><Badge variant="destructive">{slaCompliance.resolved_breached_sla}</Badge></div>
                <div className="flex items-center justify-between rounded-md border p-3"><span className="text-sm">Open tickets at risk (48h)</span><Badge variant="outline">{slaCompliance.open_at_risk}</Badge></div>
                <div className="flex items-center justify-between rounded-md border p-3"><span className="text-sm">Open tickets breached</span><Badge variant="secondary">{slaCompliance.open_breached}</Badge></div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tickets by Client</CardTitle><CardDescription>Top 10 clients by ticket volume.</CardDescription></CardHeader>
          <CardContent>
            {ticketsByClient.length === 0 ? <EmptyState title="No client ticket activity" description="Client ticket totals appear once tickets are logged." /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Client</TableHead><TableHead className="text-right">Tickets</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ticketsByClient.map((row) => (
                    <TableRow key={row.client_id ?? row.client_name}>
                      <TableCell>{row.client_id ? <Link href={`/clients/${row.client_id}`} className="font-medium hover:underline">{row.client_name}</Link> : row.client_name}</TableCell>
                      <TableCell className="text-right font-medium">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Export</CardTitle><CardDescription>Placeholder for future CSV exports when reporting stabilizes.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Exports are intentionally deferred in this phase to keep reports maintainable and server-driven.</p>
            <p>When needed, add scoped CSV endpoints for each report card to avoid a monolithic export system.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Assets Expiring Soon</CardTitle><CardDescription>Top 10 assets renewing within the next 30 days.</CardDescription></CardHeader>
          <CardContent>
            {assetsExpiringSoon.length === 0 ? <EmptyState title="No upcoming asset renewals" description="No assets are due for renewal in the next 30 days." /> : (
              <Table><TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader><TableBody>
                {assetsExpiringSoon.map((asset) => <TableRow key={asset.id}><TableCell><Link href={`/assets/${asset.id}`} className="font-medium hover:underline">{asset.name}</Link><div className="text-xs text-muted-foreground">{asset.asset_code || '—'}</div></TableCell><TableCell>{asset.client_name || '—'}</TableCell><TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell><TableCell>{asset.renewal_date || '—'}<div className="text-xs text-muted-foreground">{dayLabel(asset.days_until_renewal)}</div></TableCell></TableRow>)}
              </TableBody></Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Services Renewing Soon</CardTitle><CardDescription>Top 10 services renewing within the next 30 days.</CardDescription></CardHeader>
          <CardContent>
            {servicesRenewingSoon.length === 0 ? <EmptyState title="No upcoming service renewals" description="No services are due for renewal in the next 30 days." /> : (
              <Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader><TableBody>
                {servicesRenewingSoon.map((service) => <TableRow key={service.id}><TableCell><Link href={`/services/${service.id}`} className="font-medium hover:underline">{service.name}</Link><div className="text-xs text-muted-foreground">{service.renewal_cycle || 'No cycle'}</div></TableCell><TableCell>{service.client_name || '—'}</TableCell><TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="serviceStatus" value={service.status} /></TableCell><TableCell>{service.renewal_date || '—'}<div className="text-xs text-muted-foreground">{dayLabel(service.days_until_renewal)}</div></TableCell></TableRow>)}
              </TableBody></Table>
            )}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
