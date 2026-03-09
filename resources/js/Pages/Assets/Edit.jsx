import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import AssetForm from '@/Pages/Assets/Partials/AssetForm';

export default function AssetsEdit({ asset, formData, domainReferences, metaFieldsByType }) {
  const { data, setData, put, processing, errors } = useForm({
    client_company_id: asset.client_company_id || '',
    parent_asset_id: asset.parent_asset_id || '',
    asset_type_id: asset.asset_type_id || '',
    name: asset.name || '',
    asset_code: asset.asset_code || '',
    service_category: asset.service_category || '',
    status: asset.status || 'provisioning',
    environment: asset.environment || '',
    criticality: asset.criticality || 'medium',
    assigned_staff_id: asset.assigned_staff_id || '',
    start_date: asset.start_date || '',
    renewal_date: asset.renewal_date || '',
    end_date: asset.end_date || '',
    vendor: asset.vendor || '',
    notes: asset.notes || '',
    meta: asset.meta || {},
  });

  return <AppLayout title={`Edit ${asset.name}`} description="Update asset details and lifecycle metadata." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: asset.name, href: `/assets/${asset.id}` }, { label: 'Edit' }]}><AssetForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); put(`/assets/${asset.id}`); }} submitLabel="Save changes" formData={formData} domainReferences={domainReferences} metaFieldsByType={metaFieldsByType} /></AppLayout>;
}
