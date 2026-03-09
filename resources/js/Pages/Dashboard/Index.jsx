import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/shared/status-badge';
import { DataTableShell } from '@/Components/shared/data-table-shell';

export default function Dashboard({ summaryCards, priorityQueue }) {
  return (
    <AppLayout
      title="Dashboard"
      description="Operational snapshot for support staff and administrators."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{card.value}</div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.change}</p>
                <StatusBadge status={card.status} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <DataTableShell title="Priority Queue" columns={['Ticket', 'Subject', 'Client', 'Priority', 'Status']}>
        {priorityQueue.map((row) => (
          <tr key={row.ticket} className="border-b">
            <td className="px-2 py-3 font-medium">{row.ticket}</td>
            <td className="px-2 py-3">{row.subject}</td>
            <td className="px-2 py-3">{row.client}</td>
            <td className="px-2 py-3"><StatusBadge status={row.priority} /></td>
            <td className="px-2 py-3"><StatusBadge status={row.status} /></td>
          </tr>
        ))}
      </DataTableShell>
    </AppLayout>
  );
}
