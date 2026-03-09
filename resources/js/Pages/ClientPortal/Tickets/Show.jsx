import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { EmptyState } from '@/Components/shared/empty-state';

export default function ClientTicketShow({ ticket, messages, attachments }) {
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
        <CardHeader><CardTitle>Public Conversation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {messages.length === 0 ? <EmptyState title="No public replies yet" description="Public updates from support will appear here." /> : messages.map((message) => (
            <div key={message.id} className="rounded-md border bg-white p-3">
              <div className="text-xs text-muted-foreground">{message.author?.name || 'Support'} • {message.created_at}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          {attachments.length === 0 ? <EmptyState title="No ticket attachments" description="Attachments shared on the ticket will appear here." /> : (
            <ul className="space-y-2 text-sm">
              {attachments.map((attachment) => <li key={attachment.id} className="rounded-md border bg-white p-2">{attachment.name}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
