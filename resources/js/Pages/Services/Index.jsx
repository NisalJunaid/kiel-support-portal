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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function ServicesIndex({ services, filters, can, domainReferences, clients }) {
  const [search, setSearch] = useState(filters.search || '');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');
  const [serviceType, setServiceType] = useState(filters.service_type || 'all');
  const [status, setStatus] = useState(filters.status || 'all');
  const serviceTypeOptions = getDomainOptions(domainReferences, 'serviceType');
  const serviceStatusOptions = getDomainOptions(domainReferences, 'serviceStatus');

  return (
    <AppLayout title="Services" description="Manage client services/subscriptions and linked assets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Services' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Services</CardTitle>{can.create && <Button asChild size="sm"><Link href="/services/create">Create service</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); router.get('/services', { search: search || undefined, client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId, service_type: serviceType === 'all' ? undefined : serviceType, status: status === 'all' ? undefined : status }, { preserveState: true, replace: true }); }} className="grid gap-2 md:grid-cols-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, description, provider" className="md:col-span-2" />
            <Select value={clientCompanyId} onValueChange={setClientCompanyId}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent><SelectItem value="all">All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select>
            <Select value={serviceType} onValueChange={setServiceType}><SelectTrigger><SelectValue placeholder="Service type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{serviceTypeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{serviceStatusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <div className="md:col-span-4 flex gap-2"><Button type="submit" variant="outline">Filter</Button><Button type="button" variant="ghost" onClick={() => { setSearch(''); setClientCompanyId('all'); setServiceType('all'); setStatus('all'); router.get('/services'); }}>Reset</Button></div>
          </form>
          {services.data.length === 0 ? <EmptyState title="No services found" description="Create your first service/subscription or adjust the filters." /> : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Linked assets</TableHead><TableHead>Renewal</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{services.data.map((service) => (
                  <TableRow key={service.id}><TableCell><Link href={`/services/${service.id}`} className="font-medium hover:underline">{service.name}</Link></TableCell><TableCell>{service.client?.name || '—'}</TableCell><TableCell><Badge variant="outline">{service.service_type}</Badge></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceStatus" value={service.status} /></TableCell><TableCell>{service.assets?.length ?? 0}</TableCell><TableCell>{service.renewal_date || '—'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => router.visit(`/services/${service.id}`)}>View</DropdownMenuItem>{can.update && <DropdownMenuItem onSelect={() => router.visit(`/services/${service.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this service?')) router.delete(`/services/${service.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>
                ))}</TableBody>
              </Table>
              <ListPagination paginated={services} />
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
