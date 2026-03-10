import { router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';
import AttachmentList from '@/Components/shared/attachment-list';
import { CollapsibleDetailSection } from '@/Components/shared/collapsible-detail-section';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import FileUploadField from '@/Components/shared/file-upload-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Textarea } from '@/Components/ui/textarea';
import { getDomainOptions } from '@/lib/domain-references';

const typeStyles = {
  public_reply: { label: 'Public reply', variant: 'default', container: 'bg-muted/30 border-border' },
  internal_note: { label: 'Internal note', variant: 'warning', container: 'bg-warning/10 border-warning/40' },
  system_event: { label: 'System', variant: 'outline', container: 'bg-secondary/35 border-border' },
};

export function TicketDetailWorkspace({ ticket, messages, attachments, activity, can, domainReferences, slaIndicators, embedded = false }) {
  const [composerType, setComposerType] = useState(can.addInternalNote ? 'internal_note' : 'public_reply');
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const form = useForm({ message_type: composerType, body: '', attachments: [] });
  const latestMessage = useMemo(() => messages[0], [messages]);
  const ticketStatusOptions = useMemo(() => getDomainOptions(domainReferences, 'ticketStatus'), [domainReferences]);

  const submitMessage = () => {
    form.transform((data) => ({ ...data, message_type: composerType })).post(`/tickets/${ticket.id}/messages`, { preserveScroll: true, onSuccess: () => form.reset('body', 'attachments') });
  };

  return (
    <div className={embedded ? 'space-y-4 pb-6' : 'space-y-6'}>
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-6">
          <div><p className="text-xs text-muted-foreground">Status</p><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></div>
          <div><p className="text-xs text-muted-foreground">Priority</p><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></div>
          <div><p className="text-xs text-muted-foreground">Assignee</p><p>{ticket.assigned_user?.name || 'Unassigned'}</p></div>
          <div><p className="text-xs text-muted-foreground">Client</p><p>{ticket.client?.name || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Last activity</p><p>{latestMessage?.created_at || ticket.updated_at || '—'}</p></div>
          {can.update && <div className="grid gap-2"><Select value={ticket.status} onValueChange={(value) => router.patch(`/tickets/${ticket.id}/workflow/status`, { status: value })}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{ticketStatusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {messages.map((message) => {
            const style = typeStyles[message.message_type] || typeStyles.system_event;
            return <div key={message.id} className={`rounded-md border p-3 ${style.container}`}><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><Badge variant={style.variant}>{style.label}</Badge><span className="text-sm font-medium">{message.author?.name || 'System'}</span></div><span className="text-xs text-muted-foreground">{message.created_at}</span></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p><AttachmentList attachments={message.attachments} emptyText="No message attachments." /></div>;
          })}

          {(can.addPublicReply || can.addInternalNote) && <div className="space-y-2 rounded-md border bg-muted/20 p-3"><p className="text-sm font-medium">Add update</p><Select value={composerType} onValueChange={setComposerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{can.addPublicReply && <SelectItem value="public_reply">Public reply</SelectItem>}{can.addInternalNote && <SelectItem value="internal_note">Internal note</SelectItem>}</SelectContent></Select><Textarea value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} placeholder="Write your message..." /><FileUploadField id="message-attachments" label="Attach files" onChange={(e) => form.setData('attachments', Array.from(e.target.files || []))} /><Button size="sm" onClick={submitMessage} disabled={form.processing}>Post message</Button></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <CollapsibleDetailSection title="SLA details" value={<div className="space-y-2 text-sm"><p>Response due: {ticket.first_response_due_at || '—'} ({slaIndicators?.first_response?.label || 'No SLA'})</p><p>Resolution due: {ticket.resolution_due_at || '—'} ({slaIndicators?.resolution?.label || 'No SLA'})</p></div>} />
          <CollapsibleDetailSection title="Requester information" value={<div className="text-sm"><p>User: {ticket.requester_user?.name || '—'}</p><p>Contact: {ticket.requester_contact?.full_name || '—'}</p></div>} />
          <CollapsibleDetailSection title="Linked asset & service" value={<div className="text-sm"><p>Asset: {ticket.asset?.name || '—'}</p><p>Service: {ticket.service?.name || '—'}</p></div>} />
          <CollapsibleDetailSection title="Metadata" value={<div className="text-sm"><p>Category: {ticket.category}</p><p>Source: {ticket.source}</p><p>SLA plan: {ticket.sla_plan?.name || 'None'}</p><p>Description: {ticket.description}</p></div>} />
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Ticket attachments</CardTitle></CardHeader><CardContent><AttachmentList attachments={attachments} emptyText="No files attached directly to this ticket." /></CardContent></Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Activity log</CardTitle>
            <p className="text-sm text-muted-foreground">Open the full audit timeline in a nested drawer.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActivityDrawerOpen(true)}>Open activity log</Button>
        </CardHeader>
      </Card>

      <Sheet open={activityDrawerOpen} onOpenChange={setActivityDrawerOpen}>
        <SheetContent
          side="right"
          overlayClassName="z-[130] bg-black/45"
          className="z-[140] w-full border-l bg-card text-card-foreground sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Activity log · {ticket.ticket_number}</SheetTitle>
            <SheetDescription>Ticket workflow and reply events.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-[calc(100%-2rem)] overflow-y-auto pr-1">
            <ActivityTimeline items={activity} title="Activity log" description="Ticket workflow and reply events." emptyDescription="Ticket changes will appear here." />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
