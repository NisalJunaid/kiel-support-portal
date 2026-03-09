import AppLayout from '@/Layouts/app-layout';
import { router } from '@inertiajs/react';
import { ActivityTimeline } from '@/Components/shared/activity-timeline';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

export default function ActivityIndex({ activity, filters, logOptions }) {
  const applyFilter = (value) => {
    router.get('/activity', { log_name: value === 'all' ? '' : value }, { preserveState: true, replace: true });
  };

  return (
    <AppLayout title="Activity" description="Central audit trail across critical support entities." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Activity' }]}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select value={filters.log_name || 'all'} onValueChange={applyFilter}>
            <SelectTrigger><SelectValue placeholder="Filter by module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {logOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => applyFilter('all')}>Clear filter</Button>
      </div>

      <ActivityTimeline items={activity.data} title="Recent audit activity" description="Newest changes first. Use filters to focus on a single module." />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">Showing {activity.from || 0}-{activity.to || 0} of {activity.total} records.</p>
        <div className="flex items-center gap-2">
          {activity.prev_page_url && <Button variant="outline" size="sm" onClick={() => router.visit(activity.prev_page_url, { preserveState: true })}>Previous</Button>}
          {activity.next_page_url && <Button variant="outline" size="sm" onClick={() => router.visit(activity.next_page_url, { preserveState: true })}>Next</Button>}
        </div>
      </div>
    </AppLayout>
  );
}
