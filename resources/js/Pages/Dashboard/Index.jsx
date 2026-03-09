import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/shared/status-badge';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

export default function Dashboard({ summaryCards, priorityQueue, awaitingClientTickets, renewalWatch, quickLinks }) {
  const { props } = usePage();

  const linkVisible = (href) => {
    if (href.startsWith('/clients')) return props.authorization?.canViewClients;
    if (href.startsWith('/assets')) return props.authorization?.canViewAssets;
    if (href.startsWith('/tickets')) return props.authorization?.canViewTickets;
    if (href.startsWith('/services')) return props.authorization?.canViewServices;
    if (href.startsWith('/activity')) return props.authorization?.canViewActivity;

    return true;
  };

  return (
    <AppLayout
      title="Dashboard"
      description="Operational summary of ticket load, renewals, and client activity."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{card.value}</div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{card.hint}</p>
                <StatusBadge status={card.badge} />
              </div>
              <Button asChild variant="link" className="h-auto p-0 pt-3 text-xs">
                <Link href={card.href}>View details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority Queue</CardTitle>
            <CardDescription>Urgent and high-priority tickets requiring attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {priorityQueue.length === 0 ? (
              <EmptyState title="No high-priority tickets" description="The priority queue is currently clear." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorityQueue.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link href={`/tickets/${row.id}`} className="font-medium hover:underline">{row.ticket_number}</Link>
                        <div className="text-xs text-muted-foreground">{row.title}</div>
                      </TableCell>
                      <TableCell>{row.client_name || '—'}</TableCell>
                      <TableCell><DomainPriorityBadge domainReferences={props.domainReferences} value={row.priority} /></TableCell>
                      <TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="ticketStatus" value={row.status} /></TableCell>
                      <TableCell>{row.updated_at || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting Client Responses</CardTitle>
            <CardDescription>Tickets paused until client follow-up arrives.</CardDescription>
          </CardHeader>
          <CardContent>
            {awaitingClientTickets.length === 0 ? (
              <EmptyState title="No waiting tickets" description="No tickets are currently waiting on clients." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awaitingClientTickets.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Link href={`/tickets/${row.id}`} className="font-medium hover:underline">{row.ticket_number}</Link>
                        <div className="text-xs text-muted-foreground">{row.title}</div>
                      </TableCell>
                      <TableCell>{row.client_name || '—'}</TableCell>
                      <TableCell>{row.updated_at || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets Expiring Soon</CardTitle>
            <CardDescription>Assets with renewals due in the next 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {renewalWatch.assets.length === 0 ? (
              <EmptyState title="No upcoming asset renewals" description="No asset renewals are due in the next month." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader>
                <TableBody>
                  {renewalWatch.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Link href={`/assets/${asset.id}`} className="font-medium hover:underline">{asset.name}</Link>
                        <div className="text-xs text-muted-foreground">{asset.asset_code}</div>
                      </TableCell>
                      <TableCell>{asset.client_name || '—'}</TableCell>
                      <TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell>
                      <TableCell>{asset.renewal_date || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Renewing Soon</CardTitle>
            <CardDescription>Services that require contract renewal soon.</CardDescription>
          </CardHeader>
          <CardContent>
            {renewalWatch.services.length === 0 ? (
              <EmptyState title="No upcoming service renewals" description="No service renewals are due in the next month." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader>
                <TableBody>
                  {renewalWatch.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Link href={`/services/${service.id}`} className="font-medium hover:underline">{service.name}</Link>
                        <div className="text-xs text-muted-foreground">{service.renewal_cycle || '—'}</div>
                      </TableCell>
                      <TableCell>{service.client_name || '—'}</TableCell>
                      <TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="serviceStatus" value={service.status} /></TableCell>
                      <TableCell>{service.renewal_date || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump directly into the main operational modules.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickLinks.filter((link) => linkVisible(link.href)).map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg border bg-background p-4 transition-colors hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{link.label}</p>
                  <Badge variant="outline">Open</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{link.description}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
