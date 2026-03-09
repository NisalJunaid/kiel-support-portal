import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';
import { useState } from 'react';

export default function ServicesShow({ service, activity, can, domainReferences }) {
  const [tab, setTab] = useState('overview');

  return (
    <AppLayout title={service.name} description="Service subscription profile and linked assets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Services', href: '/services' }, { label: service.name }]}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2"><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceStatus" value={service.status} /><DomainStatusBadge domainReferences={domainReferences} referenceKey="serviceType" value={service.service_type} /></div>
        <div className="flex gap-2">{can.update && <Button asChild variant="outline" size="sm"><Link href={`/services/${service.id}/edit`}>Edit</Link></Button>}{can.delete && <Button size="sm" variant="outline" onClick={() => { if (confirm('Archive this service?')) router.delete(`/services/${service.id}`); }}>Archive</Button>}</div>
      </div>

      <Tabs>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {['overview', 'assets', 'activity'].map((value) => <TabsTrigger key={value} active={tab === value} onClick={() => setTab(value)}>{value[0].toUpperCase() + value.slice(1)}</TabsTrigger>)}
        </TabsList>

        <TabsContent active={tab === 'overview'}>
          <Card>
            <CardHeader><CardTitle>Service details</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-2">
              <p><span className="font-medium">Client:</span> <Link href={`/clients/${service.client?.id}`} className="hover:underline">{service.client?.name || '—'}</Link></p>
              <p><span className="font-medium">SLA plan ID:</span> {service.sla_plan_id || '—'}</p>
              <p><span className="font-medium">Renewal cycle:</span> {service.renewal_cycle || '—'}</p>
              <p><span className="font-medium">Start date:</span> {service.start_date || '—'}</p>
              <p><span className="font-medium">Renewal date:</span> {service.renewal_date || '—'}</p>
              <p><span className="font-medium">End date:</span> {service.end_date || '—'}</p>
              <p className="md:col-span-2"><span className="font-medium">Notes:</span> {service.notes || 'No notes'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'assets'}>
          <Card>
            <CardHeader><CardTitle>Linked assets</CardTitle></CardHeader>
            <CardContent>
              {service.assets.length === 0 ? <EmptyState title="No linked assets" description="Link assets to this service from the edit form." /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Status</TableHead><TableHead>Criticality</TableHead></TableRow></TableHeader>
                  <TableBody>{service.assets.map((asset) => <TableRow key={asset.id}><TableCell><Link className="font-medium hover:underline" href={`/assets/${asset.id}`}>{asset.name}</Link><p className="text-xs text-muted-foreground">{asset.asset_code}</p></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetStatus" value={asset.status} /></TableCell><TableCell><DomainStatusBadge domainReferences={domainReferences} referenceKey="assetCriticality" value={asset.criticality} /></TableCell></TableRow>)}</TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={tab === 'activity'}>
          <ActivityTimeline items={activity} title="Recent activity" description="Service audit trail." emptyDescription="Service changes will appear here." />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
