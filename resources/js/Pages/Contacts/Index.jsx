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
import { getDomainBadgeVariant, getDomainLabel, getDomainOptions } from '@/lib/domain-references';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function ContactsIndex({ contacts, filters, clients, can, domainReferences }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');
  const [contactType, setContactType] = useState(filters.contact_type || 'all');
  const [activeState, setActiveState] = useState(filters.active_state || 'all');
  const typeOptions = getDomainOptions(domainReferences, 'contactType');

  const submit = (e) => {
    e.preventDefault();
    router.get('/contacts', {
      search: search || undefined,
      client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId,
      contact_type: contactType === 'all' ? undefined : contactType,
      active_state: activeState === 'all' ? undefined : activeState,
    }, { preserveState: true, replace: true });
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
            <Select value={clientCompanyId} onValueChange={setClientCompanyId}><SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger><SelectContent><SelectItem value="all">All clients</SelectItem>{clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}</SelectContent></Select>
            <Select value={contactType} onValueChange={setContactType}><SelectTrigger><SelectValue placeholder="Contact type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{typeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            <Select value={activeState} onValueChange={setActiveState}><SelectTrigger><SelectValue placeholder="Active state" /></SelectTrigger><SelectContent><SelectItem value="all">All states</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            <div className="md:col-span-4 flex gap-2"><Button variant="outline" type="submit">Filter</Button><Button type="button" variant="ghost" onClick={() => { setSearch(''); setClientCompanyId('all'); setContactType('all'); setActiveState('all'); router.get('/contacts'); }}>Reset</Button></div>
          </form>

          {contacts.data.length === 0 ? <EmptyState title="No contacts found" description="Create a new client contact or adjust your filters." /> : (
            <>
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
              <ListPagination paginated={contacts} />
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
