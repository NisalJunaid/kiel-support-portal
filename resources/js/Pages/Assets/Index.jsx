import AppLayout from '@/Layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import AssetForm from '@/Pages/Assets/Partials/AssetForm';

export default function AssetsIndex({ assets, filters, can, domainReferences, clients, assetTypes, formData, metaFieldsByType }) {
  const [search, setSearch] = useState(filters.search || '');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');
  const [assetTypeId, setAssetTypeId] = useState(filters.asset_type_id ? String(filters.asset_type_id) : 'all');
  const [status, setStatus] = useState(filters.status || 'all');
  const [criticality, setCriticality] = useState(filters.criticality || 'all');
  const [createOpen, setCreateOpen] = useState(false);
  const statusOptions = getDomainOptions(domainReferences, 'assetStatus');
  const criticalityOptions = getDomainOptions(domainReferences, 'assetCriticality');
  const { data, setData, post, processing, errors, reset } = useForm({ client_company_id: formData.defaultClientId || '', parent_asset_id: '', asset_type_id: '', name: '', asset_code: '', service_category: '', status: 'provisioning', environment: '', criticality: 'medium', assigned_staff_id: '', start_date: '', renewal_date: '', end_date: '', vendor: '', notes: '', meta: {}, from_drawer: true });

  return (
    <AppLayout title="Assets" description="Manage infrastructure and service assets linked to clients." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Assets' }]}> 
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Asset inventory</CardTitle>{can.create && <Button size="sm" onClick={() => setCreateOpen(true)}>Create asset</Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); router.get('/assets', { search: search || undefined, client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId, asset_type_id: assetTypeId === 'all' ? undefined : assetTypeId, status: status === 'all' ? undefined : status, criticality: criticality === 'all' ? undefined : criticality }, { preserveState: true, replace: true }); }} className="grid gap-2 md:grid-cols-5">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, code, vendor" className="md:col-span-2" />
            <Select value={clientCompanyId} onValueChange={setClientCompanyId}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent><SelectItem value="all">All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select>
            <Select value={assetTypeId} onValueChange={setAssetTypeId}><SelectTrigger><SelectValue placeholder="Asset type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{assetTypes.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>)}</SelectContent></Select>
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={criticality} onValueChange={setCriticality}><SelectTrigger><SelectValue placeholder="Criticality" /></SelectTrigger><SelectContent><SelectItem value="all">All criticality</SelectItem>{criticalityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <div className="md:col-span-5 flex gap-2"><Button type="submit" variant="outline">Filter</Button><Button type="button" variant="ghost" onClick={() => { setSearch(''); setClientCompanyId('all'); setAssetTypeId('all'); setStatus('all'); setCriticality('all'); router.get('/assets'); }}>Reset</Button></div>
          </form>
          {assets.data.length === 0 ? <EmptyState title="No assets found" description="Create a first asset or adjust your filters." /> : <><Table><TableHeader><TableRow><TableHead>Asset name</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Criticality</TableHead><TableHead>Renewal</TableHead><TableHead /></TableRow></TableHeader><TableBody>{assets.data.map((asset) => <TableRow key={asset.id}><TableCell><Link href={`/assets/${asset.id}`} className="font-medium hover:underline">{asset.name}</Link><p className="text-xs text-muted-foreground">{asset.asset_code}</p></TableCell><TableCell>{asset.client?.name || '—'}</TableCell><TableCell>{asset.type?.name || '—'}</TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={asset.criticality} /></TableCell><TableCell>{asset.renewal_date || '—'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/assets/${asset.id}`)}>View</DropdownMenuItem>{can.update && <DropdownMenuItem onSelect={() => router.visit(`/assets/${asset.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this asset?')) router.delete(`/assets/${asset.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table><ListPagination paginated={assets} /></>}
        </CardContent>
      </Card>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); reset(); }} title="Create asset" description="Register a managed client asset." processing={processing}>
        <AssetForm data={data} setData={setData} errors={errors} processing={processing} formData={formData} domainReferences={domainReferences} metaFieldsByType={metaFieldsByType} submitLabel="Create asset" onSubmit={(e) => { e.preventDefault(); post('/assets', { preserveScroll: true, onSuccess: () => { setCreateOpen(false); reset(); } }); }} />
      </EntityCreateDrawer>
    </AppLayout>
  );
}
