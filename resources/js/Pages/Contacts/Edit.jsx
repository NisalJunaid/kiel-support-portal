import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import ContactForm from '@/Pages/Contacts/Partials/ContactForm';

export default function ContactsEdit({ contact, clients, domainReferences }) {
  const { data, setData, put, processing, errors } = useForm({
    client_company_id: contact.client_company_id,
    full_name: contact.full_name ?? '',
    title: contact.title ?? '',
    department: contact.department ?? '',
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    mobile: contact.mobile ?? '',
    contact_type: contact.contact_type ?? 'primary',
    escalation_level: contact.escalation_level ?? '',
    preferred_contact_method: contact.preferred_contact_method ?? '',
    is_active: Boolean(contact.is_active),
    notes: contact.notes ?? '',
  });

  return (
    <AppLayout title={`Edit ${contact.full_name}`} description="Update client contact details." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Contacts', href: '/contacts' }, { label: contact.full_name }]}> 
      <ContactForm data={data} setData={setData} errors={errors} processing={processing} clients={clients} domainReferences={domainReferences} onSubmit={(e) => { e.preventDefault(); put(`/contacts/${contact.id}`); }} submitLabel="Save changes" />
    </AppLayout>
  );
}
