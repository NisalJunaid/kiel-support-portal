import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { getDomainOptions } from '@/lib/domain-references';

export default function ServiceForm({ data, setData, errors, processing, onSubmit, submitLabel, formData, domainReferences }) {
  const serviceTypeOptions = getDomainOptions(domainReferences, 'serviceType');
  const statusOptions = getDomainOptions(domainReferences, 'serviceStatus');

  const availableAssets = formData.assets.filter((asset) => !data.client_company_id || `${asset.client_company_id}` === `${data.client_company_id}`);

  const selectedAssetIds = (data.asset_ids || []).map((id) => `${id}`);

  const toggleAsset = (assetId) => {
    const value = `${assetId}`;
    if (selectedAssetIds.includes(value)) {
      setData('asset_ids', selectedAssetIds.filter((id) => id !== value));
      return;
    }

    setData('asset_ids', [...selectedAssetIds, value]);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Service details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Client</Label><select value={data.client_company_id} onChange={(e) => setData('client_company_id', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select client</option>{formData.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select><p className="text-xs text-destructive">{errors.client_company_id}</p></div>
          <div className="space-y-2"><Label>Name</Label><Input value={data.name} onChange={(e) => setData('name', e.target.value)} /><p className="text-xs text-destructive">{errors.name}</p></div>
          <div className="space-y-2"><Label>Service type</Label><select value={data.service_type} onChange={(e) => setData('service_type', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{serviceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><p className="text-xs text-destructive">{errors.service_type}</p></div>
          <div className="space-y-2"><Label>Status</Label><select value={data.status} onChange={(e) => setData('status', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><p className="text-xs text-destructive">{errors.status}</p></div>
          <div className="space-y-2"><Label>SLA plan</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.sla_plan_id || ''} onChange={(e) => setData('sla_plan_id', e.target.value)}><option value="">No SLA plan</option>{formData.slaPlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select><p className="text-xs text-destructive">{errors.sla_plan_id}</p></div>
          <div className="space-y-2"><Label>Renewal cycle</Label><Input placeholder="monthly, quarterly, annually" value={data.renewal_cycle || ''} onChange={(e) => setData('renewal_cycle', e.target.value)} /><p className="text-xs text-destructive">{errors.renewal_cycle}</p></div>
          <div className="space-y-2"><Label>Start date</Label><Input type="date" value={data.start_date || ''} onChange={(e) => setData('start_date', e.target.value)} /><p className="text-xs text-destructive">{errors.start_date}</p></div>
          <div className="space-y-2"><Label>Renewal date</Label><Input type="date" value={data.renewal_date || ''} onChange={(e) => setData('renewal_date', e.target.value)} /><p className="text-xs text-destructive">{errors.renewal_date}</p></div>
          <div className="space-y-2"><Label>End date</Label><Input type="date" value={data.end_date || ''} onChange={(e) => setData('end_date', e.target.value)} /><p className="text-xs text-destructive">{errors.end_date}</p></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} rows={4} /><p className="text-xs text-destructive">{errors.notes}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Linked assets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Link this service to one or more assets while keeping service ownership separate from raw asset inventory.</p>
          <div className="flex flex-wrap gap-2">
            {availableAssets.length === 0 ? <p className="text-sm text-muted-foreground">No assets available for selected client.</p> : availableAssets.map((asset) => (
              <button type="button" key={asset.id} onClick={() => toggleAsset(asset.id)} className="rounded-md">
                <Badge variant={selectedAssetIds.includes(`${asset.id}`) ? 'info' : 'outline'}>{asset.name} ({asset.asset_code})</Badge>
              </button>
            ))}
          </div>
          <p className="text-xs text-destructive">{errors.asset_ids}</p>
        </CardContent>
      </Card>

      <div className="flex gap-2"><Button disabled={processing}>{submitLabel}</Button><Button variant="outline" asChild><Link href="/services">Cancel</Link></Button></div>
    </form>
  );
}
