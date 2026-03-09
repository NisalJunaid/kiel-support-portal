import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ListPagination } from '@/Components/shared/list-pagination';

export default function NotificationsIndex({ notifications, unreadCount }) {
  return (
    <AppLayout title="Notifications" description="Track ticket events and acknowledge updates." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Notifications' }]}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inbox</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Unread: {unreadCount}</Badge>
            <Button variant="outline" size="sm" onClick={() => router.patch('/notifications/read-all')} disabled={unreadCount === 0}>Mark all as read</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {notifications.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : notifications.data.map((notification) => (
              <div key={notification.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
                    {notification.url && <Link href={notification.url} className="text-sm font-medium text-primary hover:underline">Open ticket</Link>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read_at ? <Badge>Unread</Badge> : <Badge variant="outline">Read</Badge>}
                    {!notification.read_at && <Button variant="outline" size="sm" onClick={() => router.patch(`/notifications/${notification.id}/read`)}>Mark read</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ListPagination paginated={notifications} />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
