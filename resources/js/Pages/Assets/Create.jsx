import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import AssetForm from '@/Pages/Assets/Partials/AssetForm';

export default function AssetsCreate({ formData, domainReferences }) {
  const { data, setData, post, processing, errors } = useForm({
    client_company_id: formData.defaultClientId || '',
    parent_asset_id: '',
    asset_type_id: '',
    name: '',
    asset_code: '',
    service_category: '',
    status: 'provisioning',
    environment: '',
    criticality: 'medium',
    assigned_staff_id: '',
    start_date: '',
    renewal_date: '',
    end_date: '',
    vendor: '',
    notes: '',
    meta: { ip_address: '', hostname: '', plan: '', region: '' },
  });

  return <AppLayout title="Create asset" description="Register a managed client asset." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: 'Create' }]}><AssetForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); post('/assets'); }} submitLabel="Create asset" formData={formData} domainReferences={domainReferences} /></AppLayout>;
}
