import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { getDomainOptions } from '@/lib/domain-references';

export default function TicketForm({ data, setData, errors, processing, onSubmit, submitLabel, formData, domainReferences }) {
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');
  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const contacts = formData.contacts.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);
  const assets = formData.assets.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);
  const requesters = formData.clientUsers.filter((item) => !data.client_company_id || `${item.client_company_id}` === `${data.client_company_id}`);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Ticket details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Client</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.client_company_id} onChange={(e) => setData('client_company_id', e.target.value)}><option value="">Select client</option>{formData.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select><p className="text-xs text-destructive">{errors.client_company_id}</p></div>
          <div className="space-y-2"><Label>Category</Label><Input value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Incident, request, change..." /><p className="text-xs text-destructive">{errors.category}</p></div>
          <div className="space-y-2 md:col-span-2"><Label>Title</Label><Input value={data.title} onChange={(e) => setData('title', e.target.value)} /><p className="text-xs text-destructive">{errors.title}</p></div>
          <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} /><p className="text-xs text-destructive">{errors.description}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Routing and assignment</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Requester user</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.requester_user_id} onChange={(e) => setData('requester_user_id', e.target.value)}><option value="">No requester user</option>{requesters.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select><p className="text-xs text-destructive">{errors.requester_user_id}</p></div>
          <div className="space-y-2"><Label>Requester contact</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.requester_contact_id} onChange={(e) => setData('requester_contact_id', e.target.value)}><option value="">No requester contact</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.full_name}</option>)}</select><p className="text-xs text-destructive">{errors.requester_contact_id}</p></div>
          <div className="space-y-2"><Label>Asset</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.asset_id} onChange={(e) => setData('asset_id', e.target.value)}><option value="">No linked asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.asset_code})</option>)}</select><p className="text-xs text-destructive">{errors.asset_id}</p></div>
          <div className="space-y-2"><Label>Assigned team</Label><Input value={data.assigned_team} onChange={(e) => setData('assigned_team', e.target.value)} placeholder="Service Desk" /><p className="text-xs text-destructive">{errors.assigned_team}</p></div>
          <div className="space-y-2"><Label>Assigned user</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.assigned_user_id} onChange={(e) => setData('assigned_user_id', e.target.value)}><option value="">Unassigned</option>{formData.staff.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select><p className="text-xs text-destructive">{errors.assigned_user_id}</p></div>
          <div className="space-y-2"><Label>Source</Label><Input value={data.source} onChange={(e) => setData('source', e.target.value)} /><p className="text-xs text-destructive">{errors.source}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Priority and SLA</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Priority</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.priority} onChange={(e) => setData('priority', e.target.value)}>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><p className="text-xs text-destructive">{errors.priority}</p></div>
          <div className="space-y-2"><Label>Status</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><p className="text-xs text-destructive">{errors.status}</p></div>
          <div className="space-y-2"><Label>Impact (1-5)</Label><Input type="number" min="1" max="5" value={data.impact} onChange={(e) => setData('impact', e.target.value)} /><p className="text-xs text-destructive">{errors.impact}</p></div>
          <div className="space-y-2"><Label>Urgency (1-5)</Label><Input type="number" min="1" max="5" value={data.urgency} onChange={(e) => setData('urgency', e.target.value)} /><p className="text-xs text-destructive">{errors.urgency}</p></div>
          <div className="space-y-2"><Label>First response due</Label><Input type="datetime-local" value={data.first_response_due_at} onChange={(e) => setData('first_response_due_at', e.target.value)} /><p className="text-xs text-destructive">{errors.first_response_due_at}</p></div>
          <div className="space-y-2"><Label>Resolution due</Label><Input type="datetime-local" value={data.resolution_due_at} onChange={(e) => setData('resolution_due_at', e.target.value)} /><p className="text-xs text-destructive">{errors.resolution_due_at}</p></div>
          <div className="space-y-2"><Label>Resolved at</Label><Input type="datetime-local" value={data.resolved_at} onChange={(e) => setData('resolved_at', e.target.value)} /><p className="text-xs text-destructive">{errors.resolved_at}</p></div>
          <div className="space-y-2"><Label>Closed at</Label><Input type="datetime-local" value={data.closed_at} onChange={(e) => setData('closed_at', e.target.value)} /><p className="text-xs text-destructive">{errors.closed_at}</p></div>
        </CardContent>
      </Card>

      <div className="flex gap-2"><Button disabled={processing}>{submitLabel}</Button><Button variant="outline" asChild><Link href="/tickets">Cancel</Link></Button></div>
    </form>
  );
}
