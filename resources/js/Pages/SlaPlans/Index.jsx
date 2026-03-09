import AppLayout from '@/Layouts/app-layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { EmptyState } from '@/Components/shared/empty-state';

export default function SlaPlansIndex({ slaPlans, filters, can }) {
  const [search, setSearch] = useState(filters.search || '');

  return (
    <AppLayout title="SLA Plans" description="Define practical SLA response and resolution targets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans' }]}>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>SLA Plans</CardTitle>{can.create && <Button asChild size="sm"><Link href="/sla-plans/create">Create SLA plan</Link></Button>}</CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); router.get('/sla-plans', { search: search || undefined }, { preserveState: true, replace: true }); }} className="flex gap-2"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SLA plans" /><Button type="submit" variant="outline">Filter</Button></form>
          {slaPlans.data.length === 0 ? <EmptyState title="No SLA plans" description="Create your first SLA plan to start auto-populating deadlines." /> : (
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Response</TableHead><TableHead>Resolution</TableHead><TableHead /></TableRow></TableHeader><TableBody>{slaPlans.data.map((plan) => <TableRow key={plan.id}><TableCell>{plan.name}</TableCell><TableCell>{plan.response_minutes} min</TableCell><TableCell>{plan.resolution_minutes} min</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{can.update && <DropdownMenuItem onSelect={() => router.visit(`/sla-plans/${plan.id}/edit`)}>Edit</DropdownMenuItem>}{can.delete && <DropdownMenuItem onSelect={() => { if (confirm('Archive this SLA plan?')) router.delete(`/sla-plans/${plan.id}`); }}>Archive</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></TableCell></TableRow>)}</TableBody></Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
