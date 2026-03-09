import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Badge } from '@/Components/ui/badge';
import { getDomainBadgeVariant, getDomainLabel } from '@/lib/domain-references';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { EmptyState } from '@/Components/shared/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { useState } from 'react';

export default function ClientsShow({ client, contacts, client_users, assets, services, activity, stats, can, domainReferences }) {
  const [tab, setTab] = useState('overview');

  return (
    <AppLayout title={client.name} description="Client workspace for account operations." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients', href: '/clients' }, { label: client.name }]}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <DomainStatusBadge domainReferences={domainReferences} referenceKey="clientStatus" value={client.status} />
          <Badge variant="outline">{client.client_code}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {can.create_contact && <Button asChild size="sm"><Link href={`/contacts/create?client=${client.id}`}>Add contact</Link></Button>}
          {can.create_client_user && <Button asChild size="sm"><Link href={`/client-users/create?client=${client.id}`}>Add user</Link></Button>}
          {can.create_asset && <Button asChild size="sm" variant="secondary"><Link href={`/assets/create?client=${client.id}`}>Add asset</Link></Button>}
          {can.create_service && <Button asChild size="sm" variant="secondary"><Link href={`/services/create?client=${client.id}`}>Add service</Link></Button>}
          {can.create_ticket && <Button asChild size="sm" variant="secondary"><Link href="/tickets">Create ticket</Link></Button>}
          {can.update && <Button asChild variant="outline" size="sm"><Link href={`/clients/${client.id}/edit`}>Edit</Link></Button>}
          {can.delete && <Button size="sm" variant="outline" onClick={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</Button>}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Total contacts</p><CardTitle>{stats.contacts_count}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">{stats.active_contacts_count} active</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Client users</p><CardTitle>{stats.users_count}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">{stats.users_can_create_tickets_count} can create tickets</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Asset visibility</p><CardTitle>{stats.users_can_view_assets_count}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Users with asset access</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Services</p><CardTitle>{stats.services_count}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Managed support/subscription relationships</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Account manager</p><CardTitle className="text-lg">{client.account_manager?.name || 'Unassigned'}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">{client.account_manager?.email || 'No manager email available'}</CardContent>
        </Card>
      </section>

      <Tabs>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {['overview', 'contacts', 'users', 'assets', 'tickets', 'services', 'activity'].map((value) => (
            <TabsTrigger key={value} active={tab === value} onClick={() => setTab(value)}>{value[0].toUpperCase() + value.slice(1)}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent active={tab === 'overview'}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Company profile</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="font-medium">Legal name:</span> {client.legal_name || '—'}</p><p><span className="font-medium">Industry:</span> {client.industry || '—'}</p><p><span className="font-medium">Timezone:</span> {client.timezone}</p><p><span className="font-medium">Onboarded:</span> {client.onboarded_at || '—'}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Contact & ownership</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p><span className="font-medium">Primary email:</span> {client.primary_email || '—'}</p><p><span className="font-medium">Phone:</span> {client.phone || '—'}</p><p><span className="font-medium">Website:</span> {client.website || '—'}</p><p><span className="font-medium">Updated:</span> {client.updated_at || '—'}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Addresses</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="font-medium">Billing</p><p className="whitespace-pre-wrap text-muted-foreground">{client.billing_address || 'No billing address provided.'}</p></div><div><p className="font-medium">Technical</p><p className="whitespace-pre-wrap text-muted-foreground">{client.technical_address || 'No technical address provided.'}</p></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Internal notes</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="whitespace-pre-wrap text-muted-foreground">{client.notes || 'No notes recorded.'}</p><p><span className="font-medium">Created:</span> {client.created_at || '—'}</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent active={tab === 'contacts'}>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div><CardTitle>Contacts</CardTitle><p className="text-sm text-muted-foreground">Points of contact for this client account.</p></div>
              {can.create_contact && <Button asChild size="sm"><Link href={`/contacts/create?client=${client.id}`}>Add contact</Link></Button>}
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? <EmptyState title="No contacts yet" description="Add a client contact to track communication owners and escalation points." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell><Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">{contact.full_name}</Link><p className="text-xs text-muted-foreground">{contact.email}</p></TableCell>
                        <TableCell><Badge variant={getDomainBadgeVariant(domainReferences, 'contactType', contact.contact_type)}>{getDomainLabel(domainReferences, 'contactType', contact.contact_type)}</Badge></TableCell>
                        <TableCell><Badge variant={contact.is_active ? 'success' : 'secondary'}>{contact.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'users'}>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div><CardTitle>Users</CardTitle><p className="text-sm text-muted-foreground">Client user accounts and access flags.</p></div>
              {can.create_client_user && <Button asChild size="sm"><Link href={`/client-users/create?client=${client.id}`}>Add user</Link></Button>}
            </CardHeader>
            <CardContent>
              {client_users.length === 0 ? <EmptyState title="No users yet" description="Create client users so stakeholders can access account data." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Access</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {client_users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell><Link href={`/client-users/${user.id}`} className="font-medium hover:underline">{user.name}</Link><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
                        <TableCell>{user.role_label || '—'}</TableCell>
                        <TableCell className="space-x-1">{user.can_create_tickets && <Badge variant="outline">Tickets</Badge>}{user.can_view_assets && <Badge variant="outline">Assets</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'assets'}>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div><CardTitle>Assets</CardTitle><p className="text-sm text-muted-foreground">Infrastructure and service assets tied to this client.</p></div>
              {can.create_asset && <Button asChild size="sm"><Link href={`/assets/create?client=${client.id}`}>Add asset</Link></Button>}
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? <EmptyState title="No assets yet" description="Create an asset to track lifecycle, risk, and ownership for this client." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Criticality</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader>
                  <TableBody>{assets.map((asset) => <TableRow key={asset.id}><TableCell><Link className="font-medium hover:underline" href={`/assets/${asset.id}`}>{asset.name}</Link><p className="text-xs text-muted-foreground">{asset.asset_code}</p></TableCell><TableCell>{asset.type?.name || '—'}</TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={asset.criticality} /></TableCell><TableCell>{asset.renewal_date || '—'}</TableCell></TableRow>)}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'tickets'}>
          <EmptyState title="Tickets workspace ready" description="Ticket module entry is available. Use Create ticket to start ticket operations for this account." />
        </TabsContent>

        <TabsContent active={tab === 'services'}>
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div><CardTitle>Services</CardTitle><p className="text-sm text-muted-foreground">Support and management services associated with this account.</p></div>
              {can.create_service && <Button asChild size="sm"><Link href={`/services/create?client=${client.id}`}>Add service</Link></Button>}
            </CardHeader>
            <CardContent>
              {services.length === 0 ? <EmptyState title="No services yet" description="Create a service subscription to track SLA and support relationship separately from raw assets." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Linked assets</TableHead><TableHead>Renewal</TableHead></TableRow></TableHeader>
                  <TableBody>{services.map((service) => <TableRow key={service.id}><TableCell><Link className="font-medium hover:underline" href={`/services/${service.id}`}>{service.name}</Link><p className="text-xs text-muted-foreground">{service.renewal_cycle || 'No cycle'}</p></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceType" value={service.service_type} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceStatus" value={service.status} /></TableCell><TableCell>{service.assets.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : service.assets.map((asset) => <Badge key={asset.id} variant="outline" className="mr-1">{asset.name}</Badge>)}</TableCell><TableCell>{service.renewal_date || '—'}</TableCell></TableRow>)}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'activity'}>
          <Card>
            <CardHeader><CardTitle>Recent activity</CardTitle><p className="text-sm text-muted-foreground">Latest account-level audit trail events.</p></CardHeader>
            <CardContent>
              {activity.length === 0 ? <EmptyState title="No activity yet" description="Changes on this client account will appear here." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Description</TableHead><TableHead>Actor</TableHead><TableHead>At</TableHead></TableRow></TableHeader>
                  <TableBody>{activity.map((item) => <TableRow key={item.id}><TableCell className="capitalize">{item.event || 'updated'}</TableCell><TableCell>{item.description}</TableCell><TableCell>{item.causer_name || 'System'}</TableCell><TableCell>{item.created_at}</TableCell></TableRow>)}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
