import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { EmptyState } from '@/Components/shared/empty-state';

export function ActivityTimeline({ items, title = 'Activity', description = 'Recorded audit events.', emptyTitle = 'No activity yet', emptyDescription = 'Actions will appear here.' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="capitalize">{item.log_name || 'system'}</Badge>
                    <Badge variant="secondary" className="capitalize">{item.event || 'updated'}</Badge>
                    {item.subject_link && <Link href={item.subject_link} className="text-sm font-medium text-primary hover:underline">View record</Link>}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.created_at || 'Unknown time'}</p>
                </div>
                <p className="text-sm">{item.description}</p>
                <p className="text-xs text-muted-foreground">Actor: {item.causer_name || 'System'}{item.subject_type ? ` • ${item.subject_type}` : ''}</p>
                {index !== items.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
