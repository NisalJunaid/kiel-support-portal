import AppLayout from '@/Layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { EmptyState } from '@/Components/shared/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';
import { FilterBar } from '@/Components/shared/filter-bar';
import { RowActionsDropdown } from '@/Components/shared/row-actions-dropdown';
import { SectionCard } from '@/Components/shared/section-card';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import ClientForm from '@/Pages/Clients/Partials/ClientForm';

export default function ClientsIndex({ clients, filters, can, domainReferences, accountManagers, slaPlans }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [accountManagerId, setAccountManagerId] = useState(filters.account_manager_id ? String(filters.account_manager_id) : 'all');
  const [createOpen, setCreateOpen] = useState(false);
  const statusOptions = getDomainOptions(domainReferences, 'clientStatus');
  const { data, setData, post, processing, errors, reset } = useForm({ name: '', legal_name: '', client_code: '', industry: '', website: '', primary_email: '', phone: '', timezone: '', onboarded_at: '', status: '', account_manager_id: '', sla_plan_id: '', billing_address: '', technical_address: '', notes: '', from_drawer: true });

  const submitSearch = (e) => {
    e.preventDefault();
    router.get('/clients', { search: search || undefined, status: status === 'all' ? undefined : status, account_manager_id: accountManagerId === 'all' ? undefined : accountManagerId }, { preserveState: true, replace: true });
  };

  return (
    <AppLayout title="Client Companies" description="Manage customer accounts and ownership." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients' }]}> 
      <SectionCard title="Client companies" description="Track customer records, status, and account ownership." action={can.create && <Button size="sm" onClick={() => setCreateOpen(true)}>Create client</Button>}>
        <FilterBar onSubmit={submitSearch} onReset={() => { setSearch(''); setStatus('all'); setAccountManagerId('all'); router.get('/clients'); }} submitLabel="Search">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code, or email" className="md:col-span-2" />
          <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
          <Select value={accountManagerId} onValueChange={setAccountManagerId}><SelectTrigger><SelectValue placeholder="Account manager" /></SelectTrigger><SelectContent><SelectItem value="all">All managers</SelectItem>{accountManagers.map((manager) => <SelectItem key={manager.id} value={String(manager.id)}>{manager.name}</SelectItem>)}</SelectContent></Select>
        </FilterBar>

        {clients.data.length === 0 ? <EmptyState title="No clients found" description="Create your first client company or adjust your search query." /> : <><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Client code</TableHead><TableHead>Status</TableHead><TableHead>Account manager</TableHead><TableHead /></TableRow></TableHeader><TableBody>{clients.data.map((client) => <TableRow key={client.id}><TableCell><Link href={`/clients/${client.id}`} className="font-medium hover:underline">{client.name}</Link><p className="text-xs text-muted-foreground">{client.primary_email || 'No email'}</p></TableCell><TableCell>{client.client_code}</TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="clientStatus" value={client.status} /></TableCell><TableCell>{client.account_manager || 'Unassigned'}</TableCell><TableCell className="text-right"><RowActionsDropdown><DropdownMenuItem onSelect={() => router.visit(`/clients/${client.id}`)}>View</DropdownMenuItem>{client.can?.update && <DropdownMenuItem onSelect={() => router.visit(`/clients/${client.id}/edit`)}>Edit</DropdownMenuItem>}{client.can?.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</DropdownMenuItem>}</RowActionsDropdown></TableCell></TableRow>)}</TableBody></Table><ListPagination paginated={clients} /></>}
      </SectionCard>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); reset(); }} title="Create client" description="Add a new client company account." processing={processing}>
        <ClientForm data={data} setData={setData} errors={errors} processing={processing} managers={accountManagers} slaPlans={slaPlans} submitLabel="Create client" onSubmit={(e) => { e.preventDefault(); post('/clients', { preserveScroll: true, onSuccess: () => { setCreateOpen(false); reset(); } }); }} />
      </EntityCreateDrawer>
    </AppLayout>
  );
}
