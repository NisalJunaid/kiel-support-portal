import AppLayout from '@/Layouts/app-layout';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { getDomainOptions } from '@/lib/domain-references';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useState } from 'react';
import FileUploadField from '@/Components/shared/file-upload-field';
import AttachmentList from '@/Components/shared/attachment-list';

const typeStyles = {
  public_reply: { label: 'Public reply', variant: 'info' },
  internal_note: { label: 'Internal note', variant: 'warning' },
  system_event: { label: 'System event', variant: 'secondary' },
};

export default function TicketsShow({ ticket, activity, can, domainReferences, messages, attachments, formData, slaIndicators }) {
  const [composerTab, setComposerTab] = useState('public_reply');
  const form = useForm({ message_type: 'public_reply', body: '', attachments: [] });

  const statusOptions = getDomainOptions(domainReferences, 'ticketStatus');
  const slaBadgeClass = (state) => ({ breached: 'bg-red-100 text-red-700', at_risk: 'bg-amber-100 text-amber-700', healthy: 'bg-emerald-100 text-emerald-700', none: 'bg-muted text-muted-foreground' }[state] || 'bg-muted text-muted-foreground');
  const priorityOptions = getDomainOptions(domainReferences, 'ticketPriority');

  const submitMessage = () => {
    form.post(`/tickets/${ticket.id}/messages`, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => form.reset('body', 'attachments'),
    });
  };

  const setTab = (tab) => {
    setComposerTab(tab);
    form.setData('message_type', tab);
  };


  const updateAssignment = (assignedUserId) => {
    router.patch(`/tickets/${ticket.id}/workflow/assignment`, { assigned_user_id: assignedUserId || null }, { preserveScroll: true });
  };

  const updateStatus = (status) => {
    router.patch(`/tickets/${ticket.id}/workflow/status`, { status }, { preserveScroll: true });
  };

  const updatePriority = (priority) => {
    router.patch(`/tickets/${ticket.id}/workflow/priority`, { priority }, { preserveScroll: true });
  };

  return (
    <AppLayout title={ticket.ticket_number} description={ticket.title} breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets', href: '/tickets' }, { label: ticket.ticket_number }]}> 
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2"><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></div>
        <div className="flex gap-2">{can.update && <Button asChild size="sm" variant="outline"><Link href={`/tickets/${ticket.id}/edit`}>Edit</Link></Button>}{can.delete && <Button size="sm" variant="outline" onClick={() => { if (confirm('Archive this ticket?')) router.delete(`/tickets/${ticket.id}`); }}>Archive</Button>}</div>
      </div>


      {can.update && (
        <Card>
          <CardHeader><CardTitle>Workflow controls</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={ticket.assigned_user_id ? String(ticket.assigned_user_id) : 'unassigned'} onValueChange={(value) => updateAssignment(value === 'unassigned' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {formData.staff.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={ticket.status} onValueChange={updateStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={ticket.priority} onValueChange={updatePriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => router.post(`/tickets/${ticket.id}/workflow/resolve`, {}, { preserveScroll: true })}>Resolve</Button>
              <Button size="sm" variant="outline" onClick={() => router.post(`/tickets/${ticket.id}/workflow/close`, {}, { preserveScroll: true })}>Close</Button>
              <Button size="sm" variant="outline" onClick={() => router.post(`/tickets/${ticket.id}/workflow/reopen`, {}, { preserveScroll: true })}>Reopen</Button>
              <Button size="sm" variant="ghost" onClick={() => updateAssignment('')}>Unassign</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Client</p><CardTitle className="text-base">{ticket.client?.name || '—'}</CardTitle></CardHeader><CardContent>{ticket.client && <Link className="text-sm underline" href={`/clients/${ticket.client.id}`}>Open client</Link>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Linked asset</p><CardTitle className="text-base">{ticket.asset?.name || 'None'}</CardTitle></CardHeader><CardContent>{ticket.asset && <Link className="text-sm underline" href={`/assets/${ticket.asset.id}`}>Open asset</Link>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Linked service</p><CardTitle className="text-base">{ticket.service?.name || 'None'}</CardTitle></CardHeader><CardContent>{ticket.service && <Link className="text-sm underline" href={`/services/${ticket.service.id}`}>Open service</Link>}</CardContent></Card>
        <Card><CardHeader className="pb-2"><p className="text-sm text-muted-foreground">Assignee</p><CardTitle className="text-base">{ticket.assigned_user?.name || 'Unassigned'}</CardTitle></CardHeader><CardContent className="text-sm">Team: {ticket.assigned_team || '—'}</CardContent></Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Ticket summary</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p><span className="font-medium">Title:</span> {ticket.title}</p>
          <p><span className="font-medium">Category:</span> {ticket.category}</p>
          <p><span className="font-medium">Source:</span> {ticket.source}</p>
          <p><span className="font-medium">Requester user:</span> {ticket.requester_user?.name || '—'}</p>
          <p><span className="font-medium">Requester contact:</span> {ticket.requester_contact?.full_name || '—'}</p>
          <p><span className="font-medium">Updated:</span> {ticket.updated_at || '—'}</p>
          <p><span className="font-medium">SLA plan:</span> {ticket.sla_plan?.name || 'None'}</p>
          <p><span className="font-medium">First response due:</span> {ticket.first_response_due_at || '—'} <Badge variant="outline" className={slaBadgeClass(slaIndicators?.first_response?.state)}>{slaIndicators?.first_response?.label || 'No SLA'}</Badge></p>
          <p><span className="font-medium">Resolution due:</span> {ticket.resolution_due_at || '—'} <Badge variant="outline" className={slaBadgeClass(slaIndicators?.resolution?.state)}>{slaIndicators?.resolution?.label || 'No SLA'}</Badge></p>
          <p><span className="font-medium">Resolved at:</span> {ticket.resolved_at || '—'}</p>
          <p><span className="font-medium">Closed at:</span> {ticket.closed_at || '—'}</p>
          <p className="md:col-span-2"><span className="font-medium">Description:</span> {ticket.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ticket attachments</CardTitle></CardHeader>
        <CardContent><AttachmentList attachments={attachments} emptyText="No files attached directly to this ticket." /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? <EmptyState title="No messages yet" description="Start the conversation with a public reply or an internal note." /> : (
            <div className="space-y-3">
              {messages.map((message) => {
                const style = typeStyles[message.message_type] || typeStyles.system_event;

                return (
                  <div key={message.id} className="rounded-md border bg-muted/20 p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={style.variant}>{style.label}</Badge>
                        <p className="text-sm font-medium">{message.author?.name || 'System'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{message.created_at || '—'}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                    <div className="mt-3">
                      <AttachmentList attachments={message.attachments} emptyText="No attachments on this message." />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(can.addPublicReply || can.addInternalNote) && <Separator />}

          {(can.addPublicReply || can.addInternalNote) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Add message</h3>
              <Tabs>
                <TabsList>
                  {can.addPublicReply && <TabsTrigger active={composerTab === 'public_reply'} onClick={() => setTab('public_reply')}>Public reply</TabsTrigger>}
                  {can.addInternalNote && <TabsTrigger active={composerTab === 'internal_note'} onClick={() => setTab('internal_note')}>Internal note</TabsTrigger>}
                </TabsList>
                <TabsContent active={composerTab === 'public_reply' || composerTab === 'internal_note'}>
                  <Textarea placeholder={composerTab === 'internal_note' ? 'Add an internal note for staff...' : 'Write a reply visible to the client...'} value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} />
                  {form.errors.body && <p className="mt-2 text-sm text-destructive">{form.errors.body}</p>}
                  {form.errors.message_type && <p className="mt-2 text-sm text-destructive">{form.errors.message_type}</p>}
                  <div className="mt-3">
                    <FileUploadField
                      id="message-attachments"
                      label="Attach files"
                      helperText="Up to 5 files, max 5MB each."
                      error={form.errors.attachments || form.errors['attachments.0']}
                      onChange={(event) => form.setData('attachments', Array.from(event.target.files || []))}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{composerTab === 'internal_note' ? 'Internal notes are visible to staff only.' : 'Public replies are visible to client users.'}</p>
                    <Button size="sm" onClick={submitMessage} disabled={form.processing}>Post message</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityTimeline items={activity} title="Activity log" description="Ticket workflow and reply events." emptyDescription="Ticket changes will appear here." />
    </AppLayout>
  );
}
