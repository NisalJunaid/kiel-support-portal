import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';

export default function ClientUsersShow({ clientUser, activity, can }) {
  return (
    <AppLayout title={clientUser.name} description="Client user profile.">
      <div className="flex gap-2">
        {can.update && <Button asChild variant="outline"><Link href={`/client-users/${clientUser.id}/edit`}>Edit</Link></Button>}
        {can.delete && <Button variant="outline" onClick={() => { if (confirm('Remove this client user?')) router.delete(`/client-users/${clientUser.id}`); }}>Remove</Button>}
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Email:</span> {clientUser.email}</p>
          <p><span className="font-medium">Client:</span> {clientUser.client_company?.name}</p>
          <p><span className="font-medium">Contact:</span> {clientUser.contact?.full_name || '—'}</p>
          <p><span className="font-medium">Role label:</span> {clientUser.role_label}</p>
          <p><span className="font-medium">Can view all tickets:</span> {clientUser.can_view_all_company_tickets ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Can create tickets:</span> {clientUser.can_create_tickets ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Can view assets:</span> {clientUser.can_view_assets ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Can manage contacts:</span> {clientUser.can_manage_contacts ? 'Yes' : 'No'}</p>
        </CardContent>
      </Card>

      <ActivityTimeline items={activity} title="Activity" description="Client user account lifecycle events." emptyDescription="Client user changes will appear here." />
    </AppLayout>
  );
}
