import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, CircleDashed, Clock3, Users } from 'lucide-react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

const kpiCardMeta = {
  open_tickets: {
    icon: CircleDashed,
    iconClassName: 'text-blue-600 dark:text-blue-400',
    dotClassName: 'bg-blue-500/90',
  },
  overdue_tickets: {
    icon: AlertCircle,
    iconClassName: 'text-rose-600 dark:text-rose-400',
    dotClassName: 'bg-rose-500/90',
  },
  awaiting_client_tickets: {
    icon: Clock3,
    iconClassName: 'text-amber-600 dark:text-amber-400',
    dotClassName: 'bg-amber-500/90',
  },
  active_clients: {
    icon: Users,
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500/90',
  },
};

export default function Dashboard({ summaryCards, recentOpenTickets, awaitingClientTickets }) {
  const { props } = usePage();

  return (
    <AppLayout
      title="Dashboard"
      description="Executive summary of tickets and active clients."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = kpiCardMeta[card.key]?.icon || CircleDashed;

          return (
            <Card key={card.key} className="border-border/70 bg-card/80 shadow-sm">
              <CardHeader className="space-y-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <span className={`h-2.5 w-2.5 rounded-full ${kpiCardMeta[card.key]?.dotClassName || 'bg-muted-foreground/40'}`} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
                  <div className="rounded-md bg-muted/60 p-2">
                    <Icon className={`h-4 w-4 ${kpiCardMeta[card.key]?.iconClassName || 'text-muted-foreground'}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.hint}</p>
                {card.href ? (
                  <Button asChild variant="link" className="h-auto p-0 pt-2 text-xs text-muted-foreground hover:text-foreground">
                    <Link href={card.href}>Open list</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Awaiting Client Responses</CardTitle>
            <CardDescription>Tickets currently paused until client follow-up is received.</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Open Tickets</CardTitle>
            <CardDescription>Latest active tickets across all priorities.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOpenTickets.length === 0 ? (
              <EmptyState title="No active tickets" description="There are no open tickets right now." />
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
                  {recentOpenTickets.map((row) => (
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
      </section>
    </AppLayout>
  );
}
