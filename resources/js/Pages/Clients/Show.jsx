import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Badge } from '@/Components/ui/badge';
import { getDomainBadgeVariant, getDomainLabel } from '@/lib/domain-references';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useState } from 'react';

export default function ClientsShow({ client, contacts, client_users, can, domainReferences }) {
  const [tab, setTab] = useState('contacts');

  return (
    <AppLayout title={client.name} description="Client company detail view." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients', href: '/clients' }, { label: client.name }]}>
      <div className="flex gap-2">
        {can.update && <Button asChild variant="outline"><Link href={`/clients/${client.id}/edit`}>Edit</Link></Button>}
        {can.delete && <Button variant="outline" onClick={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</Button>}
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="font-medium">Status:</span> <DomainStatusBadge domainReferences={domainReferences} referenceKey="clientStatus" value={client.status} /></p><p><span className="font-medium">Client code:</span> {client.client_code}</p><p><span className="font-medium">Legal name:</span> {client.legal_name}</p><p><span className="font-medium">Industry:</span> {client.industry || '—'}</p><p><span className="font-medium">Timezone:</span> {client.timezone}</p><p><span className="font-medium">Onboarded at:</span> {client.onboarded_at || '—'}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Contact & ownership</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="font-medium">Primary email:</span> {client.primary_email || '—'}</p><p><span className="font-medium">Phone:</span> {client.phone || '—'}</p><p><span className="font-medium">Website:</span> {client.website || '—'}</p><p><span className="font-medium">Account manager:</span> {client.account_manager?.name || 'Unassigned'}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Addresses</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="font-medium">Billing</p><p className="text-muted-foreground whitespace-pre-wrap">{client.billing_address || 'No billing address provided.'}</p></div><div><p className="font-medium">Technical</p><p className="text-muted-foreground whitespace-pre-wrap">{client.technical_address || 'No technical address provided.'}</p></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="text-muted-foreground whitespace-pre-wrap">{client.notes || 'No notes recorded.'}</p><p><span className="font-medium">Created:</span> {client.created_at}</p><p><span className="font-medium">Last updated:</span> {client.updated_at}</p></CardContent></Card>
      </section>

      <Tabs>
        <TabsList>
          <TabsTrigger active={tab === 'contacts'} onClick={() => setTab('contacts')}>Contacts</TabsTrigger>
          <TabsTrigger active={tab === 'users'} onClick={() => setTab('users')}>Users</TabsTrigger>
        </TabsList>
        <TabsContent active={tab === 'contacts'}>
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Client contacts</CardTitle>{can.create_contact && <Button asChild size="sm"><Link href={`/contacts/create?client=${client.id}`}>Add contact</Link></Button>}</CardHeader><CardContent className="space-y-2 text-sm">{contacts.length === 0 ? <p className="text-muted-foreground">No contacts added yet.</p> : contacts.map((contact) => <div key={contact.id} className="flex items-center justify-between rounded-md border p-2"><div><Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">{contact.full_name}</Link><p className="text-xs text-muted-foreground">{contact.email}</p></div><div className="flex items-center gap-2"><Badge variant={getDomainBadgeVariant(domainReferences, 'contactType', contact.contact_type)}>{getDomainLabel(domainReferences, 'contactType', contact.contact_type)}</Badge><Badge variant={contact.is_active ? 'success' : 'secondary'}>{contact.is_active ? 'Active' : 'Inactive'}</Badge></div></div>)}</CardContent></Card>
        </TabsContent>
        <TabsContent active={tab === 'users'}>
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Client users</CardTitle>{can.create_client_user && <Button asChild size="sm"><Link href={`/client-users/create?client=${client.id}`}>Add user</Link></Button>}</CardHeader><CardContent className="space-y-2 text-sm">{client_users.length === 0 ? <p className="text-muted-foreground">No client users created yet.</p> : client_users.map((user) => <div key={user.id} className="flex items-center justify-between rounded-md border p-2"><div><Link href={`/client-users/${user.id}`} className="font-medium hover:underline">{user.name}</Link><p className="text-xs text-muted-foreground">{user.email}</p></div><div className="text-xs text-muted-foreground">{user.role_label}</div></div>)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
