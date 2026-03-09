import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { getDomainBadgeVariant, getDomainLabel } from '@/lib/domain-references';

export default function ContactsShow({ contact, can, domainReferences }) {
  return (
    <AppLayout title={contact.full_name} description="Client contact details." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Contacts', href: '/contacts' }, { label: contact.full_name }]}> 
      <div className="flex gap-2">
        <Button asChild variant="outline"><Link href={`/clients/${contact.client_company.id}`}>View client</Link></Button>
        {can.update && <Button asChild variant="outline"><Link href={`/contacts/${contact.id}/edit`}>Edit</Link></Button>}
        {can.update && <Button variant="outline" onClick={() => router.patch(`/contacts/${contact.id}/toggle-active`)}>{contact.is_active ? 'Deactivate' : 'Reactivate'}</Button>}
        {can.delete && <Button variant="outline" onClick={() => { if (confirm('Archive this contact?')) router.delete(`/contacts/${contact.id}`); }}>Archive</Button>}
      </div>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          <p><span className="font-medium">Client:</span> {contact.client_company.name}</p>
          <p><span className="font-medium">Type:</span> <Badge variant={getDomainBadgeVariant(domainReferences, 'contactType', contact.contact_type)}>{getDomainLabel(domainReferences, 'contactType', contact.contact_type)}</Badge></p>
          <p><span className="font-medium">Email:</span> {contact.email}</p>
          <p><span className="font-medium">Phone:</span> {contact.phone || '—'}</p>
          <p><span className="font-medium">Mobile:</span> {contact.mobile || '—'}</p>
          <p><span className="font-medium">Department:</span> {contact.department || '—'}</p>
          <p><span className="font-medium">Title:</span> {contact.title || '—'}</p>
          <p><span className="font-medium">Escalation level:</span> {contact.escalation_level || '—'}</p>
          <p><span className="font-medium">Preferred method:</span> {contact.preferred_contact_method || '—'}</p>
          <p><span className="font-medium">Status:</span> <Badge variant={contact.is_active ? 'success' : 'secondary'}>{contact.is_active ? 'Active' : 'Inactive'}</Badge></p>
          <p className="md:col-span-2"><span className="font-medium">Notes:</span> <span className="text-muted-foreground whitespace-pre-wrap">{contact.notes || 'No notes recorded.'}</span></p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
