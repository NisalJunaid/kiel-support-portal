import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { FilterBar } from '@/Components/shared/filter-bar';
import { RowActionsDropdown } from '@/Components/shared/row-actions-dropdown';
import { SectionCard } from '@/Components/shared/section-card';

export default function SlaPlansIndex({ slaPlans, filters, can }) {
  const [search, setSearch] = useState(filters.search || '');

  return (
    <AppLayout title="SLA Plans" description="Define practical SLA response and resolution targets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans' }]}>
      <SectionCard
        title="SLA plans"
        description="Reusable response and resolution targets for ticket workflows."
        action={can.create ? <Button asChild size="sm"><Link href="/sla-plans/create">Create SLA plan</Link></Button> : null}
      >
        <FilterBar
          onSubmit={(event) => {
            event.preventDefault();
            router.get('/sla-plans', { search: search || undefined }, { preserveState: true, replace: true });
          }}
          onReset={() => {
            setSearch('');
            router.get('/sla-plans');
          }}
          submitLabel="Filter"
        >
          <Input className="md:col-span-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search SLA plans" />
        </FilterBar>

        {slaPlans.data.length === 0 ? <EmptyState title="No SLA plans" description="Create your first SLA plan to start auto-populating deadlines." /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Response</TableHead><TableHead>Resolution</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {slaPlans.data.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.name}</TableCell>
                  <TableCell>{plan.response_minutes} min</TableCell>
                  <TableCell>{plan.resolution_minutes} min</TableCell>
                  <TableCell className="text-right">
                    <RowActionsDropdown>
                      {can.update && <DropdownMenuItem onSelect={() => router.visit(`/sla-plans/${plan.id}/edit`)}>Edit</DropdownMenuItem>}
                      {can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this SLA plan?')) router.delete(`/sla-plans/${plan.id}`); }}>Archive</DropdownMenuItem>}
                    </RowActionsDropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </AppLayout>
  );
}
