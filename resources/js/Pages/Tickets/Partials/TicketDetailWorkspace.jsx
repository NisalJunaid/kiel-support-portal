import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';
import { TicketAttachmentBlock } from '@/Components/tickets/ticket-attachment-block';
import { TicketConversationThread } from '@/Components/tickets/ticket-conversation-thread';
import { TicketInitialRequestCard } from '@/Components/tickets/ticket-initial-request-card';
import { TicketReplyComposer } from '@/Components/tickets/ticket-reply-composer';
import { CollapsibleDetailSection } from '@/Components/shared/collapsible-detail-section';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { getDomainOptions } from '@/lib/domain-references';

export function TicketDetailWorkspace({ ticket, messages, attachments, can, domainReferences, slaIndicators, staff = [], embedded = false, onWorkflowSuccess = null }) {
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const latestMessage = useMemo(() => messages[messages.length - 1], [messages]);
  const ticketStatusOptions = useMemo(() => getDomainOptions(domainReferences, 'ticketStatus'), [domainReferences]);
  const ticketPriorityOptions = useMemo(() => getDomainOptions(domainReferences, 'ticketPriority'), [domainReferences]);
  const currentUserId = usePage().props?.auth?.user?.id || null;

  const runWorkflowUpdate = (method, url, payload = {}) => {
    router[method](url, payload, {
      preserveScroll: true,
      onSuccess: () => {
        if (onWorkflowSuccess) {
          onWorkflowSuccess();
        }
      },
    });
  };

  const canResolve = can.update && ticket.status !== 'resolved' && ticket.status !== 'closed';
  const canClose = can.update && ticket.status !== 'closed';
  const canReopen = can.update && (ticket.status === 'resolved' || ticket.status === 'closed');

  const openActivityDrawer = async () => {
    setActivityDrawerOpen(true);

    if (activityLoaded || activityLoading) {
      return;
    }

    setActivityLoading(true);

    try {
      const response = await axios.get(`/tickets/${ticket.id}/activity`);
      setActivity(response.data?.activity || []);
      setActivityLoaded(true);
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <div className={embedded ? 'space-y-4 pb-6' : 'space-y-6'}>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base md:text-lg">{ticket.ticket_number} · {ticket.title}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Created {ticket.created_at || '—'} · Updated {ticket.updated_at || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} />
              <DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-5">
          <div><p className="text-xs text-muted-foreground">Client</p><p>{ticket.client?.name || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Requester</p><p>{ticket.requester_user?.name || ticket.requester_contact?.full_name || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Status</p><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></div>
          <div><p className="text-xs text-muted-foreground">Priority</p><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></div>
          <div><p className="text-xs text-muted-foreground">Assignee</p><p>{ticket.assigned_user?.name || 'Unassigned'}</p></div>
          <div><p className="text-xs text-muted-foreground">Last activity</p><p>{latestMessage?.created_at || ticket.updated_at || '—'}</p></div>
        </CardContent>
      </Card>

      <TicketInitialRequestCard
        title="Issue description"
        description={ticket.description}
        requesterName={ticket.requester_user?.name || ticket.requester_contact?.full_name}
        createdAt={ticket.created_at}
      />

      {can.update && (
        <Card>
          <CardHeader><CardTitle>Workflow actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3"><div className="space-y-1"><p className="text-xs text-muted-foreground">Change status</p><Select value={ticket.status} onValueChange={(value) => runWorkflowUpdate('patch', `/tickets/${ticket.id}/workflow/status`, { status: value })}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{ticketStatusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><p className="text-xs text-muted-foreground">Change priority</p><Select value={ticket.priority} onValueChange={(value) => runWorkflowUpdate('patch', `/tickets/${ticket.id}/workflow/priority`, { priority: value })}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{ticketPriorityOptions.map((priorityOption) => <SelectItem key={priorityOption.value} value={priorityOption.value}>{priorityOption.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><p className="text-xs text-muted-foreground">Assign to</p><Select value={ticket.assigned_user?.id ? String(ticket.assigned_user.id) : 'unassigned'} onValueChange={(value) => runWorkflowUpdate('patch', `/tickets/${ticket.id}/workflow/assignment`, { assigned_user_id: value === 'unassigned' ? null : Number(value) })}><SelectTrigger><SelectValue placeholder="Assignee" /></SelectTrigger><SelectContent><SelectItem value="unassigned">Unassigned</SelectItem>{staff.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>)}</SelectContent></Select></div></div>
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={!canResolve} onClick={() => runWorkflowUpdate('post', `/tickets/${ticket.id}/workflow/resolve`)}>Resolve</Button><Button size="sm" variant="outline" disabled={!canClose} onClick={() => runWorkflowUpdate('post', `/tickets/${ticket.id}/workflow/close`)}>Close</Button><Button size="sm" variant="outline" disabled={!canReopen} onClick={() => runWorkflowUpdate('post', `/tickets/${ticket.id}/workflow/reopen`)}>Reopen</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[32rem] overflow-y-auto rounded-xl border bg-muted/10 p-4">
            <TicketConversationThread messages={messages} currentUserId={currentUserId} />
          </div>
          <TicketReplyComposer
            endpoint={`/tickets/${ticket.id}/messages`}
            canAddPublicReply={can.addPublicReply}
            canAddInternalNote={can.addInternalNote}
            defaultType={can.addInternalNote ? 'internal_note' : 'public_reply'}
            title="Add update"
            placeholder="Add details for the requester or your internal team…"
            submitLabel="Post message"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <CollapsibleDetailSection title="SLA details" value={<div className="space-y-2 text-sm"><p>Response due: {ticket.first_response_due_at || '—'} ({slaIndicators?.first_response?.label || 'No SLA'})</p><p>Resolution due: {ticket.resolution_due_at || '—'} ({slaIndicators?.resolution?.label || 'No SLA'})</p></div>} />
          <CollapsibleDetailSection title="Requester information" value={<div className="text-sm"><p>User: {ticket.requester_user?.name || '—'}</p><p>Contact: {ticket.requester_contact?.full_name || '—'}</p></div>} />
          <CollapsibleDetailSection title="Linked asset & service" value={<div className="text-sm"><p>Asset: {ticket.asset?.name || '—'}</p><p>Service: {ticket.service?.name || '—'}</p></div>} />
          <CollapsibleDetailSection title="Metadata" value={<div className="text-sm"><p>Category: {ticket.category}</p><p>Source: {ticket.source}</p><p>SLA plan: {ticket.sla_plan?.name || 'None'}</p></div>} />
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>Ticket attachments</CardTitle></CardHeader><CardContent>{attachments.length === 0 ? <p className="text-sm text-muted-foreground">No files attached directly to this ticket.</p> : <TicketAttachmentBlock attachments={attachments} />}</CardContent></Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Activity log</CardTitle>
            <p className="text-sm text-muted-foreground">Open the full audit timeline in a nested drawer.</p>
          </div>
          <Button variant="outline" size="sm" onClick={openActivityDrawer}>Open activity log</Button>
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
            {activityLoading ? <p className="text-sm text-muted-foreground">Loading activity…</p> : <ActivityTimeline items={activity} title="Activity log" description="Ticket workflow and reply events." emptyDescription="Ticket changes will appear here." />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
