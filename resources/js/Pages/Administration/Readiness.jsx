import AppLayout from '@/Layouts/app-layout';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

export default function Readiness({ currentUser, seededRoles, permissionReadinessNote }) {
  return (
    <AppLayout
      title="Administration Readiness"
      description="Authentication and role foundations are active for internal users."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Administration' }]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Current Session</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.roles.map((role) => <Badge key={role} variant="info">{role}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Permission Readiness</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{permissionReadinessNote}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Seeded Roles</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Baseline Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seededRoles.map((role) => (
                <TableRow key={role}>
                  <TableCell><Badge variant="secondary">{role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Foundational role seeded for authorization mapping.</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
