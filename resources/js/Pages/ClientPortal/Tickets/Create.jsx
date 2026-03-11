import { useForm, usePage } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import ClientTicketForm from '@/Pages/ClientPortal/Tickets/Partials/ClientTicketForm';

export default function ClientTicketCreate({ formData, defaults, canSetPriority }) {
  const { props } = usePage();
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    category: '',
    priority: defaults.priority || 'medium',
    asset_id: '',
    attachments: [],
  });

  return (
    <ClientPortalLayout title="Create ticket" description="Submit a support request for your company.">
      <ClientTicketForm
        data={data}
        setData={setData}
        errors={errors}
        processing={processing}
        formData={formData}
        domainReferences={props.domainReferences}
        canSetPriority={canSetPriority}
        onSubmit={(event) => {
          event.preventDefault();
          post('/portal/tickets', { forceFormData: true });
        }}
      />
    </ClientPortalLayout>
  );
}
