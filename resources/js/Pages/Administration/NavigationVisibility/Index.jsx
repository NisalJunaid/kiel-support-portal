import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';

const roleLabels = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  'support-agent': 'Support Agent',
  'asset-manager': 'Asset Manager',
  'client-user': 'Client User',
};

function NavGroup({ title, description, items, roles, visibility, onToggle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-medium">Navigation Item</th>
                {roles.map((role) => (
                  <th key={role} className="p-2 text-center font-medium">{roleLabels[role] || role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key} className="border-b last:border-b-0">
                  <td className="p-2 align-middle">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.key}</div>
                  </td>
                  {roles.map((role) => (
                    <td key={`${role}-${item.key}`} className="p-2 text-center align-middle">
                      <div className="flex justify-center">
                        <Switch checked={Boolean(visibility?.[role]?.[item.key])} onCheckedChange={(checked) => onToggle(role, item.key, checked)} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NavigationVisibilityIndex({ roles, items, visibility }) {
  const form = useForm({ visibility });

  const toggleVisibility = (role, key, enabled) => {
    form.setData('visibility', {
      ...form.data.visibility,
      [role]: {
        ...(form.data.visibility?.[role] || {}),
        [key]: enabled,
      },
    });
  };

  return (
    <AppLayout
      title="Navigation Visibility"
      description="Configure navigation visibility per role. Backend authorization still controls route access."
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Navigation Visibility' }]}
    >
      <div className="flex justify-end">
        <Button disabled={form.processing} onClick={() => form.patch('/administration/navigation-visibility', { preserveScroll: true })}>
          Save visibility rules
        </Button>
      </div>

      <NavGroup
        title="Staff/Admin Workspace Navigation"
        description="These links control the left sidebar in the staff workspace."
        items={items.staff || []}
        roles={roles}
        visibility={form.data.visibility}
        onToggle={toggleVisibility}
      />

      <NavGroup
        title="Client Portal Navigation"
        description="These links control the left navigation in the client portal."
        items={items.portal || []}
        roles={roles}
        visibility={form.data.visibility}
        onToggle={toggleVisibility}
      />
    </AppLayout>
  );
}
