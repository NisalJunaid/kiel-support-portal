import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ServiceForm from '@/Pages/Services/Partials/ServiceForm';

export default function ServicesCreate({ formData, domainReferences }) {
  const { data, setData, post, processing, errors } = useForm({
    client_company_id: formData.defaultClientId || '',
    name: '',
    service_type: 'managed_hosting',
    status: 'operational',
    sla_plan_id: '',
    renewal_cycle: '',
    start_date: '',
    renewal_date: '',
    end_date: '',
    notes: '',
    asset_ids: [],
  });

  return <AppLayout title="Create service" description="Create a support/management service for a client account." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Services', href: '/services' }, { label: 'Create' }]}><ServiceForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); post('/services'); }} submitLabel="Create service" formData={formData} domainReferences={domainReferences} /></AppLayout>;
}
