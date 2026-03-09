import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DomainPriorityBadge } from '@/Components/shared/domain-priority-badge';
import { DomainStatusBadge } from '@/Components/shared/domain-status-badge';

const priorityKeys = new Set(['ticketPriority', 'assetCriticality']);

export default function SystemReference({ domainReferences }) {
  return (
    <AppLayout
      title="System Reference"
      description="Canonical statuses and type vocabularies used across backend and frontend."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Administration', href: '/administration' }, { label: 'System Reference' }]}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(domainReferences).map(([referenceKey, config]) => (
          <Card key={referenceKey}>
            <CardHeader>
              <CardTitle>{config.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Value</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.options.map((option) => (
                    <TableRow key={option.value}>
                      <TableCell className="font-mono text-xs">{option.value}</TableCell>
                      <TableCell>{option.label}</TableCell>
                      <TableCell>
                        {priorityKeys.has(referenceKey) ? (
                          <DomainPriorityBadge domainReferences={domainReferences} referenceKey={referenceKey} value={option.value} />
                        ) : (
                          <DomainStatusBadge domainReferences={domainReferences} referenceKey={referenceKey} value={option.value} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
