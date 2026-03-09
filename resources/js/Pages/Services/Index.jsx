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
import { Badge } from '@/Components/ui/badge';

export default function ServicesIndex({ services, filters, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search || '');

  return (
    <AppLayout title="Services" description="Manage client services/subscriptions and linked assets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Services' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Services</CardTitle>{can.create && <Button asChild size="sm"><Link href="/services/create">Create service</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); router.get('/services', { search: search || undefined }, { preserveState: true, replace: true }); }} className="flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, type, status" /><Button type="submit" variant="outline">Filter</Button></form>
          {services.data.length === 0 ? <EmptyState title="No services found" description="Create your first service/subscription or adjust the filters." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Linked assets</TableHead><TableHead>Renewal</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{services.data.map((service) => <TableRow key={service.id}><TableCell><Link href={`/services/${service.id}`} className="font-medium hover:underline">{service.name}</Link><p className="text-xs text-muted-foreground">{service.renewal_cycle || 'No cycle set'}</p></TableCell><TableCell>{service.client?.name || '—'}</TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceType" value={service.service_type} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceStatus" value={service.status} /></TableCell><TableCell><div className="flex flex-wrap gap-1">{service.assets.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : service.assets.map((asset) => <Badge key={asset.id} variant="outline">{asset.name}</Badge>)}</div></TableCell><TableCell>{service.renewal_date || '—'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/services/${service.id}`)}>View</DropdownMenuItem>{can.update && <DropdownMenuItem onSelect={() => router.visit(`/services/${service.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this service?')) router.delete(`/services/${service.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
