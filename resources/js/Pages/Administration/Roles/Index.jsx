import AppLayout from '@/Layouts/app-layout';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { SectionCard } from '@/Components/shared/section-card';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import { EntityDrawer } from '@/Components/shared/entity-drawer';
import { FormField } from '@/Components/forms/form-field';

function RoleForm({ data, setData, errors, processing, permissions, onSubmit, submitLabel, protectedName = false }) {
  const togglePermission = (name, enabled) => {
    const current = Array.isArray(data.permissions) ? data.permissions : [];
    if (enabled) {
      setData('permissions', Array.from(new Set([...current, name])));
      return;
    }

    setData('permissions', current.filter((item) => item !== name));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField id="name" label="Role name" required error={errors.name} hint={protectedName ? 'Protected role names cannot be renamed.' : null}>
        <Input id="name" value={data.name || ''} disabled={protectedName} onChange={(event) => setData('name', event.target.value)} placeholder="example-role" />
      </FormField>
      <FormField label="Permissions" error={errors.permissions}>
        <div className="grid gap-3 md:grid-cols-2">
          {permissions.map((permission) => (
            <div key={permission} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-xs">{permission}</span>
              <Switch checked={(data.permissions || []).includes(permission)} onCheckedChange={(enabled) => togglePermission(permission, enabled)} />
            </div>
          ))}
        </div>
      </FormField>
      <div className="flex justify-end"><Button type="submit" disabled={processing}>{submitLabel}</Button></div>
    </form>
  );
}

export default function RoleManagementIndex({ roles, permissions, protectedRoles }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const createForm = useForm({ name: '', permissions: [] });
  const editForm = useForm({ name: '', permissions: [] });

  const openEdit = (role) => {
    setEditingRole(role);
    editForm.setData({ name: role.name, permissions: role.permissions || [] });
    setEditOpen(true);
  };

  return (
    <AppLayout title="Role Management" description="Manage roles and permission assignments (super-admin only)." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Role Management' }]}>
      <SectionCard title="Roles" description="System roles are protected from renaming. Permission assignment remains editable." action={<Button size="sm" onClick={() => setCreateOpen(true)}>Create role</Button>}>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Users</TableHead><TableHead>Permissions</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell><div className="flex items-center gap-2"><span className="font-medium">{role.name}</span>{role.is_protected ? <Badge variant="secondary">Protected</Badge> : null}</div></TableCell>
                <TableCell>{role.users_count}</TableCell>
                <TableCell className="text-xs">{role.permissions.join(', ') || 'No permissions'}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => openEdit(role)}>Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); createForm.reset(); }} title="Create role" description="Create a new role and assign permissions." processing={createForm.processing}>
        <RoleForm data={createForm.data} setData={createForm.setData} errors={createForm.errors} processing={createForm.processing} permissions={permissions} submitLabel="Create role" onSubmit={(event) => { event.preventDefault(); createForm.post('/administration/roles', { preserveScroll: true, onSuccess: () => { setCreateOpen(false); createForm.reset(); } }); }} />
      </EntityCreateDrawer>

      <EntityDrawer open={editOpen} onOpenChange={setEditOpen} title={editingRole ? `Edit role: ${editingRole.name}` : 'Edit role'} description={`Protected roles: ${protectedRoles.join(', ')}`} className="z-[120] w-full border-l bg-card p-0 text-card-foreground sm:max-w-[64rem]">
        {editingRole ? <RoleForm data={editForm.data} setData={editForm.setData} errors={editForm.errors} processing={editForm.processing} permissions={permissions} protectedName={Boolean(editingRole.is_protected)} submitLabel="Save role" onSubmit={(event) => { event.preventDefault(); editForm.patch(`/administration/roles/${editingRole.id}`, { preserveScroll: true, onSuccess: () => setEditOpen(false) }); }} /> : null}
      </EntityDrawer>
    </AppLayout>
  );
}
