import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import TicketForm from './Partials/TicketForm';

export default function TicketsCreate({ formData, defaults, domainReferences }) {
  const { data, setData, post, processing, errors } = useForm({
    client_company_id: formData.defaultClientId || '',
    requester_user_id: '',
    requester_contact_id: '',
    asset_id: formData.defaultAssetId || '',
    service_id: formData.defaultServiceId || '',
    title: '',
    description: '',
    category: '',
    priority: defaults.priority,
    impact: '',
    urgency: '',
    status: defaults.status,
    source: defaults.source,
    assigned_team: '',
    assigned_user_id: '',
    sla_plan_id: '',
    first_response_due_at: '',
    resolution_due_at: '',
    resolved_at: '',
    closed_at: '',
    attachments: [],
  });

  return <AppLayout title="Create Ticket" description="Open a new support ticket."><TicketForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); post('/tickets', { forceFormData: true }); }} submitLabel="Create ticket" formData={formData} domainReferences={domainReferences} /></AppLayout>;
}
