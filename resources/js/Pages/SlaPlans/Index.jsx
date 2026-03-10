import AppLayout from '@/Layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { FilterBar } from '@/Components/shared/filter-bar';
import { RowActionsDropdown } from '@/Components/shared/row-actions-dropdown';
import { SectionCard } from '@/Components/shared/section-card';
import { ListPagination } from '@/Components/shared/list-pagination';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import SlaPlanForm from '@/Pages/SlaPlans/Partials/SlaPlanForm';

export default function SlaPlansIndex({ slaPlans, filters, can }) {
  const [search, setSearch] = useState(filters.search || '');
  const [createOpen, setCreateOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({ name: '', response_minutes: '60', resolution_minutes: '240', business_hours: '', escalation_rules: '', from_drawer: true });

  return (
    <AppLayout title="SLA Plans" description="Define practical SLA response and resolution targets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans' }]}> 
      <SectionCard title="SLA plans" description="Reusable response and resolution targets for ticket workflows." action={can.create ? <Button size="sm" onClick={() => setCreateOpen(true)}>Create SLA plan</Button> : null}>
        <FilterBar onSubmit={(event) => { event.preventDefault(); router.get('/sla-plans', { search: search || undefined }, { preserveState: true, replace: true }); }} onReset={() => { setSearch(''); router.get('/sla-plans'); }} submitLabel="Filter">
          <Input className="md:col-span-2" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search SLA plans" />
        </FilterBar>

        {slaPlans.data.length === 0 ? <EmptyState title="No SLA plans" description="Create your first SLA plan to start auto-populating deadlines." /> : <><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Response</TableHead><TableHead>Resolution</TableHead><TableHead>Usage</TableHead><TableHead /></TableRow></TableHeader><TableBody>{slaPlans.data.map((plan) => <TableRow key={plan.id}><TableCell><Link className="font-medium text-primary hover:underline" href={`/sla-plans/${plan.id}`}>{plan.name}</Link></TableCell><TableCell>{plan.response_minutes} min</TableCell><TableCell>{plan.resolution_minutes} min</TableCell><TableCell><div className="flex flex-wrap gap-1"><Badge variant="outline">{plan.clients_count} clients</Badge><Badge variant="outline">{plan.services_count} services</Badge><Badge variant="outline">{plan.tickets_count} tickets</Badge></div></TableCell><TableCell className="text-right"><RowActionsDropdown><DropdownMenuItem asChild><Link href={`/sla-plans/${plan.id}`}>View</Link></DropdownMenuItem>{can.update && <DropdownMenuItem asChild><Link href={`/sla-plans/${plan.id}/edit`}>Edit</Link></DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this SLA plan?')) router.delete(`/sla-plans/${plan.id}`); }}>Archive</DropdownMenuItem>}</RowActionsDropdown></TableCell></TableRow>)}</TableBody></Table><ListPagination paginated={slaPlans} className="mt-4" /></>}
      </SectionCard>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); reset(); }} title="Create SLA plan" description="Create an SLA profile used by clients, services, and tickets." processing={processing}>
        <SlaPlanForm data={data} setData={setData} errors={errors} processing={processing} submitLabel="Create SLA plan" onSubmit={(e) => { e.preventDefault(); post('/sla-plans', { preserveScroll: true, onSuccess: () => { setCreateOpen(false); reset(); } }); }} />
      </EntityCreateDrawer>
    </AppLayout>
  );
}
