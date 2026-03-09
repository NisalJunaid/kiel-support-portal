import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import TicketForm from './Partials/TicketForm';

export default function TicketsEdit({ ticket, formData, domainReferences }) {
  const { data, setData, put, processing, errors } = useForm({
    client_company_id: ticket.client_company_id || '',
    requester_user_id: ticket.requester_user_id || '',
    requester_contact_id: ticket.requester_contact_id || '',
    asset_id: ticket.asset_id || '',
    title: ticket.title || '',
    description: ticket.description || '',
    category: ticket.category || '',
    priority: ticket.priority || 'medium',
    impact: ticket.impact || '',
    urgency: ticket.urgency || '',
    status: ticket.status || 'new',
    source: ticket.source || 'portal',
    assigned_team: ticket.assigned_team || '',
    assigned_user_id: ticket.assigned_user_id || '',
    first_response_due_at: ticket.first_response_due_at || '',
    resolution_due_at: ticket.resolution_due_at || '',
    resolved_at: ticket.resolved_at || '',
    closed_at: ticket.closed_at || '',
  });

  return <AppLayout title={`Edit ${ticket.ticket_number}`} description="Update ticket details, assignment and SLA fields."><TicketForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={(e) => { e.preventDefault(); put(`/tickets/${ticket.id}`); }} submitLabel="Save changes" formData={formData} domainReferences={domainReferences} /></AppLayout>;
}
