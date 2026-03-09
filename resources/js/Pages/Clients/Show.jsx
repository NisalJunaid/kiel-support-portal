import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

export default function ClientsShow({ client, can, domainReferences }) {
  return (
    <AppLayout title={client.name} description="Client company detail view." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients', href: '/clients' }, { label: client.name }]}>
      <div className="flex gap-2">
        {can.update && <Button asChild variant="outline"><Link href={`/clients/${client.id}/edit`}>Edit</Link></Button>}
        {can.delete && <Button variant="outline" onClick={() => { if (confirm('Archive this client company?')) router.delete(`/clients/${client.id}`); }}>Archive</Button>}
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Overview</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Status:</span> <DomainStatusBadge domainReferences={domainReferences} referenceKey="clientStatus" value={client.status} /></p>
          <p><span className="font-medium">Client code:</span> {client.client_code}</p>
          <p><span className="font-medium">Legal name:</span> {client.legal_name}</p>
          <p><span className="font-medium">Industry:</span> {client.industry || '—'}</p>
          <p><span className="font-medium">Timezone:</span> {client.timezone}</p>
          <p><span className="font-medium">Onboarded at:</span> {client.onboarded_at || '—'}</p>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Contact & ownership</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Primary email:</span> {client.primary_email || '—'}</p>
          <p><span className="font-medium">Phone:</span> {client.phone || '—'}</p>
          <p><span className="font-medium">Website:</span> {client.website || '—'}</p>
          <p><span className="font-medium">Account manager:</span> {client.account_manager?.name || 'Unassigned'}</p>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Addresses</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
          <div><p className="font-medium">Billing</p><p className="text-muted-foreground whitespace-pre-wrap">{client.billing_address || 'No billing address provided.'}</p></div>
          <div><p className="font-medium">Technical</p><p className="text-muted-foreground whitespace-pre-wrap">{client.technical_address || 'No technical address provided.'}</p></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground whitespace-pre-wrap">{client.notes || 'No notes recorded.'}</p>
          <p><span className="font-medium">Created:</span> {client.created_at}</p>
          <p><span className="font-medium">Last updated:</span> {client.updated_at}</p>
        </CardContent></Card>
      </section>
    </AppLayout>
  );
}
