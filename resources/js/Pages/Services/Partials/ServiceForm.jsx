import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormDateField } from '@/Components/forms/form-date-field';
import { getDomainOptions } from '@/lib/domain-references';
import { RENEWAL_CYCLE_OPTIONS, withCurrentOption } from '@/lib/form-options';

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
          <FormSelectField id="client_company_id" label="Client" value={data.client_company_id} onChange={(value) => setData('client_company_id', value)} options={formData.clients.map((client) => ({ value: client.id, label: client.name }))} placeholder="Select client" error={errors.client_company_id} />
          <FormField id="name" label="Name" error={errors.name}><Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Enter service name" /></FormField>
          <FormSelectField id="service_type" label="Service type" value={data.service_type} onChange={(value) => setData('service_type', value)} options={serviceTypeOptions} placeholder="Select service type" error={errors.service_type} />
          <FormSelectField id="status" label="Status" value={data.status} onChange={(value) => setData('status', value)} options={statusOptions} placeholder="Select status" error={errors.status} />
          <FormSelectField id="sla_plan_id" label="SLA plan" value={data.sla_plan_id} onChange={(value) => setData('sla_plan_id', value)} options={formData.slaPlans.map((plan) => ({ value: plan.id, label: plan.name }))} allowEmpty emptyLabel="No SLA plan" placeholder="Select SLA plan" error={errors.sla_plan_id} />
          <FormSelectField id="renewal_cycle" label="Renewal cycle" value={data.renewal_cycle} onChange={(value) => setData('renewal_cycle', value)} options={withCurrentOption(RENEWAL_CYCLE_OPTIONS, data.renewal_cycle)} allowEmpty emptyLabel="Not set" placeholder="Select renewal cycle" error={errors.renewal_cycle} />
          <FormDateField id="start_date" label="Start date" value={data.start_date} onChange={(value) => setData('start_date', value)} error={errors.start_date} />
          <FormDateField id="renewal_date" label="Renewal date" value={data.renewal_date} onChange={(value) => setData('renewal_date', value)} error={errors.renewal_date} />
          <FormDateField id="end_date" label="End date" value={data.end_date} onChange={(value) => setData('end_date', value)} error={errors.end_date} />
          <FormField id="notes" label="Notes" error={errors.notes} className="md:col-span-2"><Textarea id="notes" value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} rows={4} placeholder="Add service notes, scope, or renewal context" /></FormField>
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
