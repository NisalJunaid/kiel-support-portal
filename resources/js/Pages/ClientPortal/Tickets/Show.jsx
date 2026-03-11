import { usePage } from '@inertiajs/react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import ClientTicketWorkspace from '@/Pages/ClientPortal/Tickets/Partials/ClientTicketWorkspace';

export default function ClientTicketShow({ ticket, messages, attachments, can }) {
  const { props } = usePage();

  return (
    <ClientPortalLayout title={ticket.ticket_number} description={ticket.title}>
      <ClientTicketWorkspace
        ticket={ticket}
        messages={messages}
        attachments={attachments}
        can={can}
        domainReferences={props.domainReferences}
      />
    </ClientPortalLayout>
  );
}
