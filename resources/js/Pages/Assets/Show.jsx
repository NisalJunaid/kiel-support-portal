import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { EmptyState } from '@/Components/shared/empty-state';

function formatMetaValue(field, value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (field.input === 'boolean') {
    return value ? 'Enabled' : 'Disabled';
  }

  return value;
}

export default function AssetsShow({ asset, activity, linkedTickets, can, domainReferences, metaFieldsByType }) {
  const [tab, setTab] = useState('overview');
  const metaFields = metaFieldsByType?.[asset.type_slug] || [];

  return (
    <AppLayout
      title={asset.name}
      description="Asset details and related operational context."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: asset.name }]}
    >
      <div className="flex gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/tickets/create?client=${asset.client?.id}&asset=${asset.id}`}>Create ticket</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/tickets?search=${asset.asset_code}`}>View tickets</Link>
        </Button>
        {can.update && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/assets/${asset.id}/edit`}>Edit</Link>
          </Button>
        )}
        {can.delete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('Archive this asset?')) {
                router.delete(`/assets/${asset.id}`);
              }
            }}
          >
            Archive
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-medium">Asset code:</span> {asset.asset_code}</p>
          <p><span className="font-medium">Client:</span> <Link className="underline" href={`/clients/${asset.client?.id}`}>{asset.client?.name}</Link></p>
          <p><span className="font-medium">Type:</span> {asset.type?.name}</p>
          <p><span className="font-medium">Status:</span> <DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={asset.status} /></p>
          <p><span className="font-medium">Criticality:</span> <DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={asset.criticality} /></p>
          <p><span className="font-medium">Renewal date:</span> {asset.renewal_date || '—'}</p>
        </CardContent>
      </Card>

      <Tabs>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {['overview', 'relationships', 'tickets', 'activity'].map((item) => (
            <TabsTrigger key={item} active={tab === item} onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent active={tab === 'overview'}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle & notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Start:</span> {asset.start_date || '—'}</p>
                <p><span className="font-medium">End:</span> {asset.end_date || '—'}</p>
                <p><span className="font-medium">Environment:</span> {asset.environment || '—'}</p>
                <p><span className="font-medium">Vendor:</span> {asset.vendor || '—'}</p>
                <p><span className="font-medium">Notes:</span> {asset.notes || 'No notes recorded.'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type-specific metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {metaFields.length === 0 ? (
                  <p className="text-muted-foreground">No type-specific metadata configured.</p>
                ) : (
                  metaFields.map((field) => (
                    <p key={field.key}>
                      <span className="font-medium">{field.label}:</span> {formatMetaValue(field, asset.meta?.[field.key])}
                    </p>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent active={tab === 'relationships'}>
          <Card>
            <CardHeader>
              <CardTitle>Parent and child assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {asset.parent ? (
                <p className="text-sm">
                  Parent: <Link className="underline" href={`/assets/${asset.parent.id}`}>{asset.parent.name} ({asset.parent.asset_code})</Link>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No parent asset.</p>
              )}

              {asset.children.length === 0 ? (
                <EmptyState title="No child assets" description="Attach dependent assets by selecting this asset as parent." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criticality</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asset.children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell><Link className="font-medium hover:underline" href={`/assets/${child.id}`}>{child.name}</Link></TableCell>
                        <TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={child.status} /></TableCell>
                        <TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={child.criticality} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'tickets'}>
          {linkedTickets.length === 0 ? (
            <EmptyState title="No linked tickets yet" description="Create a ticket from this asset to track incidents or requests." />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Title</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{linkedTickets.map((ticket) => <TableRow key={ticket.id}><TableCell><Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline">{ticket.ticket_number}</Link></TableCell><TableCell>{ticket.title}</TableCell><TableCell><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell></TableRow>)}</TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent active={tab === 'activity'}>
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <EmptyState title="No activity yet" description="Changes on this asset will appear here." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.event}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.causer_name || 'System'}</TableCell>
                        <TableCell>{item.created_at}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
