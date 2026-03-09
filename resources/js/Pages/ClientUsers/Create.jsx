import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ClientUserForm from './Partials/ClientUserForm';

export default function ClientUsersCreate({ clients, contacts, defaults }) {
  const { data, setData, post, processing, errors } = useForm({
    client_company_id: defaults.client_company_id ?? '',
    contact_id: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_label: 'Client User',
    can_view_all_company_tickets: defaults.can_view_all_company_tickets,
    can_create_tickets: defaults.can_create_tickets,
    can_view_assets: defaults.can_view_assets,
    can_manage_contacts: defaults.can_manage_contacts,
  });

  return <AppLayout title="Create Client User" description="Create a client user account."><ClientUserForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); post('/client-users'); }} clients={clients} contacts={contacts} submitLabel="Create client user" /></AppLayout>;
}
