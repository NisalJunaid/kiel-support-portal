import { usePage } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { TicketAttachmentBlock } from '@/Components/tickets/ticket-attachment-block';
import { TicketConversationThread } from '@/Components/tickets/ticket-conversation-thread';
import { TicketReplyComposer } from '@/Components/tickets/ticket-reply-composer';

export default function ClientTicketShow({ ticket, messages, attachments, can }) {
  const currentUserId = usePage().props?.auth?.user?.id || null;

  return (
    <ClientPortalLayout title={ticket.ticket_number} description={ticket.title}>
      <Card>
        <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Status:</span> {ticket.status}</p>
          <p><span className="font-medium">Priority:</span> {ticket.priority}</p>
          <p><span className="font-medium">Description:</span> {ticket.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[30rem] overflow-y-auto rounded-xl border bg-muted/10 p-4">
            <TicketConversationThread
              messages={messages}
              currentUserId={currentUserId}
              emptyTitle="No public replies yet"
              emptyDescription="Public updates from support will appear here."
              showTypeBadge={false}
            />
          </div>
          <TicketReplyComposer
            endpoint={`/portal/tickets/${ticket.id}/messages`}
            canAddPublicReply={can?.addPublicReply}
            canAddInternalNote={false}
            title="Reply to support"
            placeholder="Write your reply to support…"
            submitLabel="Send reply"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          {attachments.length === 0 ? <p className="text-sm text-muted-foreground">No ticket attachments.</p> : <TicketAttachmentBlock attachments={attachments} />}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
