import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormDateField } from '@/Components/forms/form-date-field';
import { getDomainOptions } from '@/lib/domain-references';
import { ENVIRONMENT_OPTIONS, withCurrentOption } from '@/lib/form-options';

function getAssetTypeSlug(assetTypes, assetTypeId) {
  return assetTypes.find((type) => `${type.id}` === `${assetTypeId}`)?.slug;
}

function renderMetaField(field, value, onChange) {
  if (field.input === 'textarea') {
    return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} />;
  }

  if (field.input === 'boolean') {
    return <Switch checked={Boolean(value)} onCheckedChange={(checked) => onChange(checked)} />;
  }

  if (field.input === 'date') {
    return <FormDateField id={`meta-${field.key}`} value={value || ''} onChange={onChange} />;
  }

  return <Input type={field.input === 'number' ? 'number' : field.input === 'url' ? 'url' : 'text'} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}

export default function AssetForm({ data, setData, errors, processing, onSubmit, submitLabel, formData, domainReferences, metaFieldsByType }) {
  const statusOptions = getDomainOptions(domainReferences, 'assetStatus');
  const criticalityOptions = getDomainOptions(domainReferences, 'assetCriticality');
  const parents = formData.parentAssets.filter((entry) => !data.client_company_id || `${entry.client_company_id}` === `${data.client_company_id}`);
  const selectedTypeSlug = getAssetTypeSlug(formData.assetTypes, data.asset_type_id);
  const selectedMetaFields = metaFieldsByType?.[selectedTypeSlug] || [];

  const updateMeta = (key, value) => setData('meta', { ...data.meta, [key]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Asset details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="client_company_id" label="Client" value={data.client_company_id} onChange={(value) => setData('client_company_id', value)} options={formData.clients.map((client) => ({ value: client.id, label: client.name }))} placeholder="Select client" error={errors.client_company_id} />
          <FormSelectField id="asset_type_id" label="Asset type" value={data.asset_type_id} onChange={(value) => setData('asset_type_id', value)} options={formData.assetTypes.map((type) => ({ value: type.id, label: type.name }))} placeholder="Select type" error={errors.asset_type_id} />
          <FormField id="name" label="Name" error={errors.name}><Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} /></FormField>
          <FormField id="asset_code" label="Asset code" error={errors.asset_code}><Input id="asset_code" value={data.asset_code} onChange={(e) => setData('asset_code', e.target.value)} /></FormField>
          <FormSelectField id="parent_asset_id" label="Parent asset" value={data.parent_asset_id} onChange={(value) => setData('parent_asset_id', value)} options={parents.map((asset) => ({ value: asset.id, label: `${asset.name} (${asset.asset_code})` }))} allowEmpty emptyLabel="No parent" error={errors.parent_asset_id} />
          <FormSelectField id="assigned_staff_id" label="Assigned staff" value={data.assigned_staff_id} onChange={(value) => setData('assigned_staff_id', value)} options={formData.staff.map((user) => ({ value: user.id, label: user.name }))} allowEmpty emptyLabel="Unassigned" error={errors.assigned_staff_id} />
          <FormSelectField id="status" label="Status" value={data.status} onChange={(value) => setData('status', value)} options={statusOptions} error={errors.status} />
          <FormSelectField id="criticality" label="Criticality" value={data.criticality} onChange={(value) => setData('criticality', value)} options={criticalityOptions} error={errors.criticality} />
          <FormField id="service_category" label="Service category" error={errors.service_category}><Input id="service_category" value={data.service_category || ''} onChange={(e) => setData('service_category', e.target.value)} /></FormField>
          <FormSelectField id="environment" label="Environment" value={data.environment} onChange={(value) => setData('environment', value)} options={withCurrentOption(ENVIRONMENT_OPTIONS, data.environment)} allowEmpty emptyLabel="Not set" error={errors.environment} />
          <FormField id="vendor" label="Vendor" error={errors.vendor}><Input id="vendor" value={data.vendor || ''} onChange={(e) => setData('vendor', e.target.value)} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lifecycle and metadata</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormDateField id="start_date" label="Start date" value={data.start_date} onChange={(value) => setData('start_date', value)} error={errors.start_date} />
          <FormDateField id="renewal_date" label="Renewal date" value={data.renewal_date} onChange={(value) => setData('renewal_date', value)} error={errors.renewal_date} />
          <FormDateField id="end_date" label="End date" value={data.end_date} onChange={(value) => setData('end_date', value)} error={errors.end_date} />
          {selectedMetaFields.length === 0 ? <p className="text-sm text-muted-foreground md:col-span-2">No type-specific metadata fields for this asset type.</p> : selectedMetaFields.map((field) => (
            <FormField key={field.key} label={field.label} error={errors[`meta.${field.key}`]} className={field.input === 'textarea' ? 'md:col-span-2' : ''}>
              {renderMetaField(field, data.meta?.[field.key], (value) => updateMeta(field.key, value))}
            </FormField>
          ))}
          <FormField id="notes" label="Notes" className="md:col-span-2" error={errors.notes}><Textarea id="notes" value={data.notes || ''} onChange={(e) => setData('notes', e.target.value)} rows={4} /></FormField>
          <p className="text-xs text-destructive md:col-span-2">{errors.meta}</p>
        </CardContent>
      </Card>

      <div className="flex gap-2"><Button disabled={processing}>{submitLabel}</Button><Button variant="outline" asChild><Link href="/assets">Cancel</Link></Button></div>
    </form>
  );
}
