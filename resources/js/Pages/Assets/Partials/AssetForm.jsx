import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { getDomainOptions } from '@/lib/domain-references';

export default function AssetForm({ data, setData, errors, processing, onSubmit, submitLabel, formData, domainReferences }) {
  const statusOptions = getDomainOptions(domainReferences, 'assetStatus');
  const criticalityOptions = getDomainOptions(domainReferences, 'assetCriticality');
  const parents = formData.parentAssets.filter((entry) => !data.client_company_id || `${entry.client_company_id}` === `${data.client_company_id}`);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Asset details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Client</Label><select value={data.client_company_id} onChange={(e) => setData('client_company_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select client</option>{formData.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select><p className="text-xs text-destructive">{errors.client_company_id}</p></div>
          <div className="space-y-2"><Label>Asset type</Label><select value={data.asset_type_id} onChange={(e) => setData('asset_type_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select type</option>{formData.assetTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select><p className="text-xs text-destructive">{errors.asset_type_id}</p></div>
          <div className="space-y-2"><Label>Name</Label><Input value={data.name} onChange={(e) => setData('name', e.target.value)} /><p className="text-xs text-destructive">{errors.name}</p></div>
          <div className="space-y-2"><Label>Asset code</Label><Input value={data.asset_code} onChange={(e) => setData('asset_code', e.target.value)} /><p className="text-xs text-destructive">{errors.asset_code}</p></div>
          <div className="space-y-2"><Label>Parent asset</Label><select value={data.parent_asset_id || ''} onChange={(e) => setData('parent_asset_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">No parent</option>{parents.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.asset_code})</option>)}</select><p className="text-xs text-destructive">{errors.parent_asset_id}</p></div>
          <div className="space-y-2"><Label>Assigned staff</Label><select value={data.assigned_staff_id || ''} onChange={(e) => setData('assigned_staff_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Unassigned</option>{formData.staff.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></div>
          <div className="space-y-2"><Label>Status</Label><select value={data.status} onChange={(e) => setData('status', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="space-y-2"><Label>Criticality</Label><select value={data.criticality} onChange={(e) => setData('criticality', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{criticalityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="space-y-2"><Label>Service category</Label><Input value={data.service_category || ''} onChange={(e) => setData('service_category', e.target.value)} /></div>
          <div className="space-y-2"><Label>Environment</Label><Input value={data.environment || ''} onChange={(e) => setData('environment', e.target.value)} /></div>
          <div className="space-y-2"><Label>Vendor</Label><Input value={data.vendor || ''} onChange={(e) => setData('vendor', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lifecycle and metadata</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Start date</Label><Input type="date" value={data.start_date || ''} onChange={(e) => setData('start_date', e.target.value)} /></div>
          <div className="space-y-2"><Label>Renewal date</Label><Input type="date" value={data.renewal_date || ''} onChange={(e) => setData('renewal_date', e.target.value)} /></div>
          <div className="space-y-2"><Label>End date</Label><Input type="date" value={data.end_date || ''} onChange={(e) => setData('end_date', e.target.value)} /></div>
          <div className="space-y-2"><Label>IP address</Label><Input value={data.meta.ip_address || ''} onChange={(e) => setData('meta', { ...data.meta, ip_address: e.target.value })} /></div>
          <div className="space-y-2"><Label>Hostname</Label><Input value={data.meta.hostname || ''} onChange={(e) => setData('meta', { ...data.meta, hostname: e.target.value })} /></div>
          <div className="space-y-2"><Label>Plan</Label><Input value={data.meta.plan || ''} onChange={(e) => setData('meta', { ...data.meta, plan: e.target.value })} /></div>
          <div className="space-y-2"><Label>Region</Label><Input value={data.meta.region || ''} onChange={(e) => setData('meta', { ...data.meta, region: e.target.value })} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} rows={4} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-2"><Button disabled={processing}>{submitLabel}</Button><Button variant="outline" asChild><Link href="/assets">Cancel</Link></Button></div>
    </form>
  );
}
