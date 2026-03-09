import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

export default function ClientUsersIndex({ clientUsers, filters, clients, can }) {
  return (
    <AppLayout title="Client Users" description="Manage client access accounts." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Client Users' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Client users</CardTitle>{can.create && <Button asChild><Link href="/client-users/create">Create client user</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input className="h-10 rounded-md border px-3" placeholder="Search" defaultValue={filters.search || ''} onBlur={(e) => router.get('/client-users', { ...filters, search: e.target.value }, { preserveState: true, replace: true })} />
            <select className="h-10 rounded-md border px-3" defaultValue={filters.client_company_id || ''} onChange={(e) => router.get('/client-users', { ...filters, client_company_id: e.target.value || null }, { preserveState: true, replace: true })}><option value="">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
          </div>
          <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Client</TableHead><TableHead>Role</TableHead><TableHead>Access</TableHead><TableHead /></TableRow></TableHeader><TableBody>
            {clientUsers.data.map((user) => <TableRow key={user.id}><TableCell><Link href={`/client-users/${user.id}`} className="font-medium hover:underline">{user.name}</Link><p className="text-xs text-muted-foreground">{user.email}</p></TableCell><TableCell>{user.client_company?.name}</TableCell><TableCell>{user.role_label}</TableCell><TableCell className="text-xs">{user.can_create_tickets ? 'Ticket Create ' : ''}{user.can_view_assets ? 'Assets ' : ''}{user.can_manage_contacts ? 'Contacts' : ''}</TableCell><TableCell className="text-right">{can.update && <Button asChild size="sm" variant="outline"><Link href={`/client-users/${user.id}/edit`}>Edit</Link></Button>}</TableCell></TableRow>)}
          </TableBody></Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
