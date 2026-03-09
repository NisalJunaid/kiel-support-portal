import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ContactForm from '@/Pages/Contacts/Partials/ContactForm';

export default function ContactsCreate({ clients, defaults = {}, domainReferences }) {
  const { data, setData, post, processing, errors } = useForm({
    client_company_id: defaults.client_company_id || '',
    full_name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    contact_type: 'primary',
    escalation_level: '',
    preferred_contact_method: '',
    is_active: true,
    notes: '',
  });

  return (
    <AppLayout title="Create contact" description="Add a new contact for a client company." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Contacts', href: '/contacts' }, { label: 'Create' }]}> 
      <ContactForm data={data} setData={setData} errors={errors} processing={processing} clients={clients} domainReferences={domainReferences} onSubmit={(e) => { e.preventDefault(); post('/contacts'); }} submitLabel="Create contact" />
    </AppLayout>
  );
}
