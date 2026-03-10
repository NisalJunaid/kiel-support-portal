import AppLayout from '@/Layouts/app-layout';
import { TicketDetailWorkspace } from '@/Pages/Tickets/Partials/TicketDetailWorkspace';

export default function TicketsShow({ ticket, messages, attachments, can, domainReferences, slaIndicators }) {
  return (
    <AppLayout title={`Ticket ${ticket.ticket_number}`} description={ticket.title} breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Tickets', href: '/tickets' }, { label: ticket.ticket_number }]}>
      <TicketDetailWorkspace
        ticket={ticket}
        messages={messages}
        attachments={attachments}
        can={can}
        domainReferences={domainReferences}
        slaIndicators={slaIndicators}
      />
    </AppLayout>
  );
}
