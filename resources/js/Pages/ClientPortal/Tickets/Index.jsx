import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';
import { ListPagination } from '@/Components/shared/list-pagination';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';
import { ClickableTableRow } from '@/Components/shared/clickable-table-row';
import { EntityCreateDrawer } from '@/Components/shared/entity-create-drawer';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import ClientTicketWorkspace from '@/Pages/ClientPortal/Tickets/Partials/ClientTicketWorkspace';
import ClientTicketForm from '@/Pages/ClientPortal/Tickets/Partials/ClientTicketForm';

export default function ClientTicketsIndex({ tickets, canCreate, drawerTicket = null, formData, defaults, canSetPriority }) {
  const { props } = usePage();
  const [selectedTicketId, setSelectedTicketId] = useState(drawerTicket?.ticket?.id || null);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    category: '',
    priority: defaults.priority || 'medium',
    asset_id: '',
    attachments: [],
    from_drawer: true,
  });

  const openTicketDrawer = (ticketId) => {
    setSelectedTicketId(ticketId);
    router.get('/portal/tickets', { drawer_ticket: ticketId }, { preserveState: true, preserveScroll: true, replace: true, only: ['drawerTicket'] });
  };

  const closeTicketDrawer = () => {
    setSelectedTicketId(null);
    router.get('/portal/tickets', {}, { preserveState: true, preserveScroll: true, replace: true, only: ['drawerTicket'] });
  };

  return (
    <ClientPortalLayout title="My Company Tickets" description="All tickets scoped to your company.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          {canCreate ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>Create ticket</Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {tickets.data.length === 0 ? <EmptyState title="No tickets found" description="There are no tickets for your company yet." /> : (
            <>
              <Table>
                <TableHeader><tr><TableHead>Ticket</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead></tr></TableHeader>
                <TableBody>
                  {tickets.data.map((ticket) => (
                    <ClickableTableRow key={ticket.id} onOpen={() => openTicketDrawer(ticket.id)}>
                      <TableCell>
                        <p className="font-medium">{ticket.ticket_number}</p>
                        <div className="text-xs text-muted-foreground">{ticket.title}</div>
                      </TableCell>
                      <TableCell><DomainPriorityBadge domainReferences={props.domainReferences} value={ticket.priority} /></TableCell>
                      <TableCell><DomainStatusBadge domainReferences={props.domainReferences} referenceKey="ticketStatus" value={ticket.status} /></TableCell>
                      <TableCell>{ticket.updated_at || '—'}</TableCell>
                    </ClickableTableRow>
                  ))}
                </TableBody>
              </Table>
              <ListPagination paginated={tickets} className="mt-4" />
            </>
          )}
        </CardContent>
      </Card>

      <EntityCreateDrawer open={createOpen} onOpenChange={setCreateOpen} onCancel={() => { setCreateOpen(false); reset(); }} title="Create ticket" description="Submit a support request for your company." processing={processing}>
        <ClientTicketForm
          data={data}
          setData={setData}
          errors={errors}
          processing={processing}
          formData={formData}
          domainReferences={props.domainReferences}
          canSetPriority={canSetPriority}
          submitLabel="Submit ticket"
          onCancel={() => {
            setCreateOpen(false);
            reset();
          }}
          onSubmit={(event) => {
            event.preventDefault();
            post('/portal/tickets', {
              forceFormData: true,
              preserveScroll: true,
              onSuccess: (page) => {
                setCreateOpen(false);
                reset();
                const createdTicketId = page?.props?.flash?.created_ticket_id;
                if (createdTicketId) {
                  openTicketDrawer(createdTicketId);
                  return;
                }
                router.reload({ only: ['tickets'], preserveScroll: true, preserveState: true });
              },
            });
          }}
        />
      </EntityCreateDrawer>

      <Sheet open={!!selectedTicketId && !!drawerTicket?.ticket} onOpenChange={(open) => !open && closeTicketDrawer()}>
        <SheetContent side="right" className="z-[120] w-full border-l bg-card p-0 text-card-foreground sm:max-w-[72rem]">
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle>{drawerTicket?.ticket?.ticket_number}</SheetTitle>
              <SheetDescription>{drawerTicket?.ticket?.title}</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {drawerTicket?.ticket ? (
                <ClientTicketWorkspace
                  embedded
                  ticket={drawerTicket.ticket}
                  messages={drawerTicket.messages}
                  attachments={drawerTicket.attachments}
                  can={drawerTicket.can}
                  domainReferences={props.domainReferences}
                />
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="text-sm text-muted-foreground">
        Prefer full page? <Link href="/portal/tickets/create" className="underline">Open standalone create page</Link>.
      </div>
    </ClientPortalLayout>
  );
}
