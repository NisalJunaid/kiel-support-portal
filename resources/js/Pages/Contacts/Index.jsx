import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { Badge } from '@/Components/ui/badge';
import { getDomainLabel, getDomainBadgeVariant } from '@/lib/domain-references';

export default function ContactsIndex({ contacts, filters, clients, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ?? '');

  const submit = (e) => {
    e.preventDefault();
    router.get('/contacts', { search, client_company_id: clientCompanyId || undefined }, { preserveState: true, replace: true });
  };

  return (
    <AppLayout title="Client Contacts" description="Manage client points of contact and escalation paths." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Contacts' }]}> 
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Contacts</CardTitle>
          {can.create && <Button asChild size="sm"><Link href="/contacts/create">Create contact</Link></Button>}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={submit} className="grid gap-2 md:grid-cols-4">
            <Input className="md:col-span-2" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or phone" />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={clientCompanyId} onChange={(e) => setClientCompanyId(e.target.value)}>
              <option value="">All clients</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
            <Button variant="outline" type="submit">Filter</Button>
          </form>

          {contacts.data.length === 0 ? <EmptyState title="No contacts found" description="Create a new client contact or adjust your filters." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Contact</TableHead><TableHead>Client</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {contacts.data.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">{contact.full_name}</Link>
                      <p className="text-xs text-muted-foreground">{contact.email}</p>
                    </TableCell>
                    <TableCell>{contact.client_company?.name}</TableCell>
                    <TableCell><Badge variant={getDomainBadgeVariant(domainReferences, 'contactType', contact.contact_type)}>{getDomainLabel(domainReferences, 'contactType', contact.contact_type)}</Badge></TableCell>
                    <TableCell><Badge variant={contact.is_active ? 'success' : 'secondary'}>{contact.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => router.visit(`/contacts/${contact.id}`)}>View</DropdownMenuItem>
                          {can.update && <DropdownMenuItem onSelect={() => router.visit(`/contacts/${contact.id}/edit`)}>Edit</DropdownMenuItem>}
                          {can.update && <DropdownMenuItem onSelect={() => router.patch(`/contacts/${contact.id}/toggle-active`)}>{contact.is_active ? 'Deactivate' : 'Reactivate'}</DropdownMenuItem>}
                          {can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this contact?')) router.delete(`/contacts/${contact.id}`); }}>Archive</DropdownMenuItem>}
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
