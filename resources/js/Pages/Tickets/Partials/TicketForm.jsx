import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormDateTimeField } from '@/Components/forms/form-datetime-field';
import FileUploadField from '@/Components/shared/file-upload-field';
import { getDomainOptions } from '@/lib/domain-references';

export default function TicketForm({ data, setData, errors, processing, onSubmit, submitLabel, formData, domainReferences, onCancel }) {
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');
  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const contacts = formData.contacts.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);
  const assets = formData.assets.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);
  const services = formData.services.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);
  const requesters = formData.clientUsers.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Ticket details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="client_company_id" label="Client" value={data.client_company_id} onChange={(value) => setData('client_company_id', value)} options={formData.clients.map((client) => ({ value: client.id, label: client.name }))} placeholder="Select client" error={errors.client_company_id} />
          <FormField id="category" label="Category" error={errors.category}><Input id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Incident, request, change..." /></FormField>
          <FormField id="title" label="Title" error={errors.title} className="md:col-span-2"><Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} /></FormField>
          <FormField id="description" label="Description" error={errors.description} className="md:col-span-2"><Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Routing and assignment</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="requester_user_id" label="Requester user" value={data.requester_user_id} onChange={(value) => setData('requester_user_id', value)} options={requesters.map((user) => ({ value: user.id, label: `${user.name} (${user.email})` }))} allowEmpty emptyLabel="No requester user" error={errors.requester_user_id} />
          <FormSelectField id="requester_contact_id" label="Requester contact" value={data.requester_contact_id} onChange={(value) => setData('requester_contact_id', value)} options={contacts.map((contact) => ({ value: contact.id, label: contact.full_name }))} allowEmpty emptyLabel="No requester contact" error={errors.requester_contact_id} />
          <FormSelectField id="asset_id" label="Asset" value={data.asset_id} onChange={(value) => setData('asset_id', value)} options={assets.map((asset) => ({ value: asset.id, label: `${asset.name} (${asset.asset_code})` }))} allowEmpty emptyLabel="No linked asset" error={errors.asset_id} />
          <FormSelectField id="service_id" label="Service" value={data.service_id} onChange={(value) => setData('service_id', value)} options={services.map((service) => ({ value: service.id, label: service.name }))} allowEmpty emptyLabel="No linked service" error={errors.service_id} />
          <FormField id="assigned_team" label="Assigned team" error={errors.assigned_team}><Input id="assigned_team" value={data.assigned_team} onChange={(e) => setData('assigned_team', e.target.value)} placeholder="Service Desk" /></FormField>
          <FormSelectField id="assigned_user_id" label="Assigned user" value={data.assigned_user_id} onChange={(value) => setData('assigned_user_id', value)} options={formData.staff.map((user) => ({ value: user.id, label: user.name }))} allowEmpty emptyLabel="Unassigned" error={errors.assigned_user_id} />
          <FormField id="source" label="Source" error={errors.source}><Input id="source" value={data.source} onChange={(e) => setData('source', e.target.value)} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Priority and SLA</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="priority" label="Priority" value={data.priority} onChange={(value) => setData('priority', value)} options={priorityOptions} error={errors.priority} />
          <FormSelectField id="status" label="Status" value={data.status} onChange={(value) => setData('status', value)} options={statusOptions} error={errors.status} />
          <FormSelectField id="sla_plan_id" label="SLA plan override" value={data.sla_plan_id} onChange={(value) => setData('sla_plan_id', value)} options={formData.slaPlans.map((plan) => ({ value: plan.id, label: plan.name }))} allowEmpty emptyLabel="Use service/client SLA" error={errors.sla_plan_id} />
          <FormField id="impact" label="Impact (1-5)" error={errors.impact}><Input id="impact" type="number" min="1" max="5" value={data.impact} onChange={(e) => setData('impact', e.target.value)} /></FormField>
          <FormField id="urgency" label="Urgency (1-5)" error={errors.urgency}><Input id="urgency" type="number" min="1" max="5" value={data.urgency} onChange={(e) => setData('urgency', e.target.value)} /></FormField>
          <FormDateTimeField id="first_response_due_at" label="First response due" value={data.first_response_due_at} onChange={(value) => setData('first_response_due_at', value)} error={errors.first_response_due_at} />
          <FormDateTimeField id="resolution_due_at" label="Resolution due" value={data.resolution_due_at} onChange={(value) => setData('resolution_due_at', value)} error={errors.resolution_due_at} />
          <FormDateTimeField id="resolved_at" label="Resolved at" value={data.resolved_at} onChange={(value) => setData('resolved_at', value)} error={errors.resolved_at} />
          <FormDateTimeField id="closed_at" label="Closed at" value={data.closed_at} onChange={(value) => setData('closed_at', value)} error={errors.closed_at} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          <FileUploadField
            id="ticket-attachments"
            label="Attach files"
            helperText="Up to 5 files (PDF, images, Office docs, CSV/TXT), max 5MB each."
            error={errors.attachments || errors['attachments.0']}
            onChange={(event) => setData('attachments', Array.from(event.target.files || []))}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button disabled={processing}>{submitLabel}</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
              return;
            }

            router.get('/tickets');
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
