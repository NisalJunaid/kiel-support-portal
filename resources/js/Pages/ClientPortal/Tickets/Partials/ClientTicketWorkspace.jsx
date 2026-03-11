import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { TicketAttachmentBlock } from '@/Components/tickets/ticket-attachment-block';
import { TicketConversationThread } from '@/Components/tickets/ticket-conversation-thread';
import { TicketReplyComposer } from '@/Components/tickets/ticket-reply-composer';

export default function ClientTicketWorkspace({ ticket, messages, attachments, can, domainReferences, embedded = false }) {
  const currentUserId = usePage().props?.auth?.user?.id || null;

  return (
    <div className={embedded ? 'space-y-4 pb-6' : 'space-y-6'}>
      <Card>
        <CardHeader><CardTitle>Ticket details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
          <div><p className="text-xs text-muted-foreground">Status</p><DomainStatusBadge domainReferences={domainReferences} referenceKey="ticketStatus" value={ticket.status} /></div>
          <div><p className="text-xs text-muted-foreground">Priority</p><DomainPriorityBadge domainReferences={domainReferences} value={ticket.priority} /></div>
          <div><p className="text-xs text-muted-foreground">Updated</p><p>{ticket.updated_at || '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Asset</p><p>{ticket.asset ? `${ticket.asset.name} (${ticket.asset.asset_code})` : '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Service</p><p>{ticket.service?.name || '—'}</p></div>
          <div className="md:col-span-2 lg:col-span-3"><p className="text-xs text-muted-foreground">Description</p><p>{ticket.description}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[30rem] overflow-y-auto rounded-xl border bg-muted/10 p-4">
            <TicketConversationThread messages={messages} currentUserId={currentUserId} emptyTitle="No public replies yet" emptyDescription="Public updates from support will appear here." showTypeBadge={false} />
          </div>
          <TicketReplyComposer endpoint={`/portal/tickets/${ticket.id}/messages`} canAddPublicReply={can?.addPublicReply} canAddInternalNote={false} title="Reply to support" placeholder="Share an update, answer a question, or provide additional details" submitLabel="Send reply" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>{attachments.length === 0 ? <p className="text-sm text-muted-foreground">No ticket attachments.</p> : <TicketAttachmentBlock attachments={attachments} />}</CardContent>
      </Card>
    </div>
  );
}
