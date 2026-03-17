import AppLayout from '@/Layouts/app-layout';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { SectionCard } from '@/Components/shared/section-card';
import { FilterBar } from '@/Components/shared/filter-bar';
import { ListPagination } from '@/Components/shared/list-pagination';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import { EntityDrawer } from '@/Components/shared/entity-drawer';
import StaffUserForm from '@/Pages/Administration/UserManagement/Partials/StaffUserForm';
import ClientManagedUserForm from '@/Pages/Administration/UserManagement/Partials/ClientManagedUserForm';

export default function UserManagementIndex({ users, filters, roleOptions, staffRoleOptions, clientCompanies, contacts, defaults }) {
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || 'all');
  const [role, setRole] = useState(filters.role || 'all');
  const [staffCreateOpen, setStaffCreateOpen] = useState(false);
  const [clientCreateOpen, setClientCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const staffCreate = useForm({ name: '', email: '', password: '', password_confirmation: '', roles: [] });
  const clientCreate = useForm({ name: '', email: '', password: '', password_confirmation: '', client_company_id: '', contact_id: '', role_label: defaults.client_role_label, can_view_all_company_tickets: defaults.can_view_all_company_tickets, can_create_tickets: defaults.can_create_tickets, can_view_assets: defaults.can_view_assets, can_manage_contacts: defaults.can_manage_contacts });
  const editStaff = useForm({ name: '', email: '', password: '', password_confirmation: '', roles: [] });
  const editClient = useForm({ name: '', email: '', password: '', password_confirmation: '', client_company_id: '', contact_id: '', role_label: defaults.client_role_label, can_view_all_company_tickets: defaults.can_view_all_company_tickets, can_create_tickets: defaults.can_create_tickets, can_view_assets: defaults.can_view_assets, can_manage_contacts: defaults.can_manage_contacts });

  const openEdit = (user) => {
    setEditingUser(user);
    if (user.type === 'staff') {
      editStaff.setData({ name: user.name, email: user.email, password: '', password_confirmation: '', roles: user.roles || [] });
    } else {
      editClient.setData({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        client_company_id: user.client_profile?.client_company_id ? String(user.client_profile.client_company_id) : '',
        contact_id: user.client_profile?.contact_id ? String(user.client_profile.contact_id) : '',
        role_label: user.client_profile?.role_label || defaults.client_role_label,
        can_view_all_company_tickets: Boolean(user.client_profile?.can_view_all_company_tickets),
        can_create_tickets: Boolean(user.client_profile?.can_create_tickets),
        can_view_assets: Boolean(user.client_profile?.can_view_assets),
        can_manage_contacts: Boolean(user.client_profile?.can_manage_contacts),
      });
    }
    setEditOpen(true);
  };

  return (
    <AppLayout title="User Management" description="Manage staff and client users as super-admin." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'User Management' }]}>
      <SectionCard title="Users" description="Create, filter, and update staff and client access accounts." action={<div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setStaffCreateOpen(true)}>Create staff user</Button><Button size="sm" onClick={() => setClientCreateOpen(true)}>Create client user</Button></div>}>
        <FilterBar onSubmit={(event) => { event.preventDefault(); router.get('/administration/users', { search: search || undefined, type: type === 'all' ? undefined : type, role: role === 'all' ? undefined : role }, { preserveState: true, replace: true }); }} onReset={() => { setSearch(''); setType('all'); setRole('all'); router.get('/administration/users'); }}>
          <Input className="md:col-span-2" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="User type" /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="staff">Staff users</SelectItem><SelectItem value="client">Client users</SelectItem></SelectContent></Select>
          <Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{roleOptions.map((option) => <SelectItem key={option.id} value={option.name}>{option.name}</SelectItem>)}</SelectContent></Select>
        </FilterBar>

        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Roles</TableHead><TableHead>Client company</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
                <TableCell><Badge variant={user.type === 'staff' ? 'default' : 'secondary'}>{user.type}</Badge></TableCell>
                <TableCell className="text-xs">{(user.roles || []).join(', ') || '—'}</TableCell>
                <TableCell>{user.client_profile?.client_company_name || '—'}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => openEdit(user)}>Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ListPagination paginated={users} />
      </SectionCard>

      <EntityCreateDrawer open={staffCreateOpen} onOpenChange={setStaffCreateOpen} onCancel={() => { setStaffCreateOpen(false); staffCreate.reset(); }} title="Create staff user" description="Create an internal staff account with staff-side roles." processing={staffCreate.processing}>
        <StaffUserForm data={staffCreate.data} setData={staffCreate.setData} errors={staffCreate.errors} processing={staffCreate.processing} roles={staffRoleOptions} submitLabel="Create staff user" onSubmit={(event) => { event.preventDefault(); staffCreate.post('/administration/users/staff', { preserveScroll: true, onSuccess: () => { setStaffCreateOpen(false); staffCreate.reset(); } }); }} />
      </EntityCreateDrawer>

      <EntityCreateDrawer open={clientCreateOpen} onOpenChange={setClientCreateOpen} onCancel={() => { setClientCreateOpen(false); clientCreate.reset(); }} title="Create client user" description="Create a client portal user and assign company access flags." processing={clientCreate.processing}>
        <ClientManagedUserForm data={clientCreate.data} setData={clientCreate.setData} errors={clientCreate.errors} processing={clientCreate.processing} clientCompanies={clientCompanies} contacts={contacts} submitLabel="Create client user" onSubmit={(event) => { event.preventDefault(); clientCreate.post('/administration/users/client', { preserveScroll: true, onSuccess: () => { setClientCreateOpen(false); clientCreate.reset(); } }); }} />
      </EntityCreateDrawer>

      <EntityDrawer open={editOpen} onOpenChange={setEditOpen} title={editingUser ? `Edit ${editingUser.name}` : 'Edit user'} description="Update account data and role assignments." className="z-[120] w-full border-l bg-card p-0 text-card-foreground sm:max-w-[64rem]">
        {editingUser?.type === 'staff' ? (
          <StaffUserForm isEdit data={editStaff.data} setData={editStaff.setData} errors={editStaff.errors} processing={editStaff.processing} roles={staffRoleOptions} submitLabel="Save staff user" onSubmit={(event) => { event.preventDefault(); editStaff.patch(`/administration/users/staff/${editingUser.id}`, { preserveScroll: true, onSuccess: () => setEditOpen(false) }); }} />
        ) : null}
        {editingUser?.type === 'client' ? (
          <ClientManagedUserForm isEdit data={editClient.data} setData={editClient.setData} errors={editClient.errors} processing={editClient.processing} clientCompanies={clientCompanies} contacts={contacts} submitLabel="Save client user" onSubmit={(event) => { event.preventDefault(); editClient.patch(`/administration/users/client/${editingUser.client_profile.id}`, { preserveScroll: true, onSuccess: () => setEditOpen(false) }); }} />
        ) : null}
      </EntityDrawer>
    </AppLayout>
  );
}
