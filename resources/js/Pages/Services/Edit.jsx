import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ServiceForm from '@/Pages/Services/Partials/ServiceForm';

export default function ServicesEdit({ service, formData, domainReferences }) {
  const { data, setData, put, processing, errors } = useForm({
    client_company_id: service.client_company_id || '',
    name: service.name || '',
    service_type: service.service_type || 'managed_hosting',
    status: service.status || 'operational',
    sla_plan_id: service.sla_plan_id || '',
    renewal_cycle: service.renewal_cycle || '',
    start_date: service.start_date || '',
    renewal_date: service.renewal_date || '',
    end_date: service.end_date || '',
    notes: service.notes || '',
    asset_ids: service.asset_ids || [],
  });

  return <AppLayout title={`Edit ${service.name}`} description="Update service lifecycle and linked assets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Services', href: '/services' }, { label: service.name, href: `/services/${service.id}` }, { label: 'Edit' }]}><ServiceForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); put(`/services/${service.id}`); }} submitLabel="Save changes" formData={formData} domainReferences={domainReferences} /></AppLayout>;
}
