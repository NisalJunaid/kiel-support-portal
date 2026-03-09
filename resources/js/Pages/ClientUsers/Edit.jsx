import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ClientUserForm from './Partials/ClientUserForm';

export default function ClientUsersEdit({ clientUser, clients, contacts }) {
  const { data, setData, put, processing, errors } = useForm({ ...clientUser, password: '', password_confirmation: '' });

  return <AppLayout title="Edit Client User" description="Update client user account."><ClientUserForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); put(`/client-users/${clientUser.id}`); }} clients={clients} contacts={contacts} submitLabel="Update client user" /></AppLayout>;
}
