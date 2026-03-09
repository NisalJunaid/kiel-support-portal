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

export default function ClientsIndex({ clients, filters, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search ?? '');

  const submitSearch = (e) => {
    e.preventDefault();
    router.get('/clients', { search }, { preserveState: true, replace: true });
  };

  return (
    <AppLayout title="Client Companies" description="Manage customer accounts and ownership." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients' }]}> 
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Client companies</CardTitle>
          {can.create && <Button asChild size="sm"><Link href="/clients/create">Create client</Link></Button>}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={submitSearch} className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code, or email" />
            <Button variant="outline" type="submit">Search</Button>
          </form>

          {clients.data.length === 0 ? (
            <EmptyState title="No clients found" description="Create your first client company or adjust your search query." />
          ) : (
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
                          {can.update && <DropdownMenuItem onSelect={() => router.visit(`/clients/${client.id}/edit`)}>Edit</DropdownMenuItem>}
                          {can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
