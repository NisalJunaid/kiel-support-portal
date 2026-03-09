import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ClientForm from '@/Pages/Clients/Partials/ClientForm';

export default function ClientsCreate({ managers }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '', legal_name: '', client_code: '', industry: '', status: 'prospect', website: '',
    primary_email: '', phone: '', billing_address: '', technical_address: '', timezone: 'UTC', notes: '', onboarded_at: '', account_manager_id: '',
  });

  return (
    <AppLayout title="Create client" description="Add a new client company account." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Clients', href: '/clients' }, { label: 'Create' }]}>
      <ClientForm data={data} setData={setData} errors={errors} processing={processing} managers={managers} onSubmit={(e) => { e.preventDefault(); post('/clients'); }} submitLabel="Create client" />
    </AppLayout>
  );
}
