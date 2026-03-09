import { useForm } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { EmptyState } from '@/Components/shared/empty-state';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';

export default function ClientTicketShow({ ticket, messages, attachments, can }) {
  const form = useForm({
    message_type: 'public_reply',
    body: '',
  });

  const submitReply = (e) => {
    e.preventDefault();
    form.post(`/portal/tickets/${ticket.id}/messages`, {
      preserveScroll: true,
      onSuccess: () => form.reset('body'),
    });
  };

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
            <div key={message.id} className="rounded-md border bg-card p-3">
              <div className="text-xs text-muted-foreground">{message.author?.name || 'Support'} • {message.created_at}</div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
            </div>
          ))}

          {can?.addPublicReply && (
            <form onSubmit={submitReply} className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-medium">Add reply</p>
              <Textarea
                value={form.data.body}
                onChange={(e) => form.setData('body', e.target.value)}
                placeholder="Write your reply to support..."
                rows={4}
              />
              {form.errors.body && <p className="text-sm text-destructive">{form.errors.body}</p>}
              <Button size="sm" disabled={form.processing}>Send reply</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          {attachments.length === 0 ? <EmptyState title="No ticket attachments" description="Attachments shared on the ticket will appear here." /> : (
            <ul className="space-y-2 text-sm">
              {attachments.map((attachment) => <li key={attachment.id} className="rounded-md border bg-card p-2">{attachment.name}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
