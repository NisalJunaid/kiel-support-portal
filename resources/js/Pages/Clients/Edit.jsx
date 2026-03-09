import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ClientForm from '@/Pages/Clients/Partials/ClientForm';

export default function ClientsEdit({ client, managers, slaPlans }) {
  const { data, setData, put, processing, errors } = useForm({ ...client, onboarded_at: client.onboarded_at ? client.onboarded_at.slice(0, 10) : '', account_manager_id: client.account_manager_id ?? '', sla_plan_id: client.sla_plan_id ?? '' });

  return (
    <AppLayout title={`Edit ${client.name}`} description="Update client profile and ownership." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients', href: '/clients' }, { label: client.name, href: `/clients/${client.id}` }, { label: 'Edit' }]}>
      <ClientForm data={data} setData={setData} errors={errors} processing={processing} managers={managers} slaPlans={slaPlans} onSubmit={(e) => { e.preventDefault(); put(`/clients/${client.id}`); }} submitLabel="Save changes" />
    </AppLayout>
  );
}
