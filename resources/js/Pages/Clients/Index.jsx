import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { EmptyState } from '@/Components/shared/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function ClientsIndex({ clients, filters, can, domainReferences, accountManagers }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [accountManagerId, setAccountManagerId] = useState(filters.account_manager_id ? String(filters.account_manager_id) : 'all');
  const statusOptions = getDomainOptions(domainReferences, 'clientStatus');

  const submitSearch = (e) => {
    e.preventDefault();
    router.get('/clients', {
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      account_manager_id: accountManagerId === 'all' ? undefined : accountManagerId,
    }, { preserveState: true, replace: true });
  };

  return (
    <AppLayout title="Client Companies" description="Manage customer accounts and ownership." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients' }]}> 
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Client companies</CardTitle>
          {can.create && <Button asChild size="sm"><Link href="/clients/create">Create client</Link></Button>}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={submitSearch} className="grid gap-2 md:grid-cols-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code, or email" className="md:col-span-2" />
            <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={accountManagerId} onValueChange={setAccountManagerId}><SelectTrigger><SelectValue placeholder="Account manager" /></SelectTrigger><SelectContent><SelectItem value="all">All managers</SelectItem>{accountManagers.map((manager) => <SelectItem key={manager.id} value={String(manager.id)}>{manager.name}</SelectItem>)}</SelectContent></Select>
            <div className="md:col-span-4 flex gap-2">
              <Button variant="outline" type="submit">Search</Button>
              <Button type="button" variant="ghost" onClick={() => { setSearch(''); setStatus('all'); setAccountManagerId('all'); router.get('/clients'); }}>Reset</Button>
            </div>
          </form>

          {clients.data.length === 0 ? (
            <EmptyState title="No clients found" description="Create your first client company or adjust your search query." />
          ) : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Client code</TableHead><TableHead>Status</TableHead><TableHead>Account manager</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {clients.data.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link href={`/clients/${client.id}`} className="font-medium hover:underline">{client.name}</Link>
                        <p className="text-xs text-muted-foreground">{client.primary_email || 'No email'}</p>
                      </TableCell>
                      <TableCell>{client.client_code}</TableCell>
                      <TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="clientStatus" value={client.status} /></TableCell>
                      <TableCell>{client.account_manager || 'Unassigned'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Actions</Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => router.visit(`/clients/${client.id}`)}>View</DropdownMenuItem>
                            {client.can?.update && <DropdownMenuItem onSelect={() => router.visit(`/clients/${client.id}/edit`)}>Edit</DropdownMenuItem>}
                            {client.can?.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ListPagination paginated={clients} />
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
