import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

export default function AssetsIndex({ assets, filters, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search || '');

  return (
    <AppLayout title="Assets" description="Manage infrastructure and service assets linked to clients." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Assets' }]}> 
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Asset inventory</CardTitle>{can.create && <Button asChild size="sm"><Link href="/assets/create">Create asset</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); router.get('/assets', { search: search || undefined }, { preserveState: true, replace: true }); }} className="flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, code, vendor" /><Button type="submit" variant="outline">Filter</Button></form>
          {assets.data.length === 0 ? <EmptyState title="No assets found" description="Create a first asset or adjust your filters." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Asset name</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Criticality</TableHead><TableHead>Renewal</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {assets.data.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell><Link href={`/assets/${asset.id}`} className="font-medium hover:underline">{asset.name}</Link><p className="text-xs text-muted-foreground">{asset.asset_code}</p></TableCell>
                    <TableCell>{asset.client?.name || '—'}</TableCell>
                    <TableCell>{asset.type?.name || '—'}</TableCell>
                    <TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell>
                    <TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={asset.criticality} /></TableCell>
                    <TableCell>{asset.renewal_date || '—'}</TableCell>
                    <TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/assets/${asset.id}`)}>View</DropdownMenuItem>{can.update && <DropdownMenuItem onSelect={() => router.visit(`/assets/${asset.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this asset?')) router.delete(`/assets/${asset.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
