import ClientPortalLayout from '@/Layouts/client-portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { EmptyState } from '@/Components/shared/empty-state';

export default function ClientContactsIndex({ contacts }) {
  return (
    <ClientPortalLayout title="Contacts" description="Approved contacts for your company.">
      <Card>
        <CardHeader><CardTitle>Company Contacts</CardTitle></CardHeader>
        <CardContent>
          {contacts.length === 0 ? <EmptyState title="No contacts available" description="No contacts are currently visible in your portal." /> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Title</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
              <TableBody>
                {contacts.map((contact) => <TableRow key={contact.id}><TableCell>{contact.full_name}</TableCell><TableCell>{contact.title || '—'}</TableCell><TableCell>{contact.email || '—'}</TableCell><TableCell>{contact.phone || '—'}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </ClientPortalLayout>
  );
}
