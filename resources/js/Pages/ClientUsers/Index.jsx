import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';
import { FilterBar } from '@/Components/shared/filter-bar';
import { ListPagination } from '@/Components/shared/list-pagination';
import { RowActionsDropdown } from '@/Components/shared/row-actions-dropdown';
import { SectionCard } from '@/Components/shared/section-card';

export default function ClientUsersIndex({ clientUsers, filters, clients, can }) {
  const [search, setSearch] = useState(filters.search || '');
  const [clientCompanyId, setClientCompanyId] = useState(filters.client_company_id ? String(filters.client_company_id) : 'all');

  const applyFilters = (event) => {
    event.preventDefault();
    router.get('/client-users', {
      search: search || undefined,
      client_company_id: clientCompanyId === 'all' ? undefined : clientCompanyId,
    }, { preserveState: true, replace: true });
  };

  const resetFilters = () => {
    setSearch('');
    setClientCompanyId('all');
    router.get('/client-users');
  };

  return (
    <AppLayout title="Client Users" description="Manage client access accounts." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Client Users' }]}>
      <SectionCard
        title="Client users"
        description="Search and manage access for customer-side users."
        action={can.create ? <Button asChild size="sm"><Link href="/client-users/create">Create client user</Link></Button> : null}
      >
        <FilterBar onSubmit={applyFilters} onReset={resetFilters} submitLabel="Filter">
          <Input className="md:col-span-2" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={clientCompanyId} onValueChange={setClientCompanyId}>
            <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {clients.map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterBar>

        {clientUsers.data.length === 0 ? (
          <EmptyState title="No client users found" description="Create a user or adjust your filters." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientUsers.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/client-users/${user.id}`} className="font-medium hover:underline">{user.name}</Link>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>{user.client_company?.name}</TableCell>
                    <TableCell>{user.role_label}</TableCell>
                    <TableCell className="text-xs">{[user.can_create_tickets && 'Ticket create', user.can_view_assets && 'Assets', user.can_manage_contacts && 'Contacts'].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell className="text-right">
                      <RowActionsDropdown>
                        <DropdownMenuItem onSelect={() => router.visit(`/client-users/${user.id}`)}>View</DropdownMenuItem>
                        {can.update && <DropdownMenuItem onSelect={() => router.visit(`/client-users/${user.id}/edit`)}>Edit</DropdownMenuItem>}
                      </RowActionsDropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ListPagination paginated={clientUsers} />
          </>
        )}
      </SectionCard>
    </AppLayout>
  );
}
