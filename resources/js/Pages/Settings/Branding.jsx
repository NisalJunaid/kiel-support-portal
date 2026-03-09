import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ThemePreviewCard } from '@/Components/settings/theme-preview-card';

export default function Branding({ branding }) {
  const form = useForm({
    app_name: branding.app_name,
    primary_color: branding.primary_color,
    secondary_color: branding.secondary_color,
    accent_color: branding.accent_color,
    logo: null,
    remove_logo: false,
  });

  const preview = {
    ...branding,
    ...form.data,
    logo_url: form.data.logo ? URL.createObjectURL(form.data.logo) : branding.logo_url,
  };

  return (
    <AppLayout title="Branding settings" description="Manage logo and global theme for the staff workspace." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }, { label: 'Branding' }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Theme & logo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Application name</Label>
              <Input value={form.data.app_name} onChange={(e) => form.setData('app_name', e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[['primary_color', 'Primary'], ['secondary_color', 'Secondary'], ['accent_color', 'Accent']].map(([key, label]) => (
                <div key={key}>
                  <Label>{label} color</Label>
                  <Input type="color" value={form.data[key]} onChange={(e) => form.setData(key, e.target.value)} className="h-10 p-1" />
                </div>
              ))}
            </div>
            <div>
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={(e) => form.setData('logo', e.target.files?.[0] || null)} />
              {branding.logo_url && <Button type="button" variant="ghost" size="sm" onClick={() => form.setData('remove_logo', !form.data.remove_logo)}>{form.data.remove_logo ? 'Keep logo' : 'Remove existing logo'}</Button>}
            </div>
            <Button onClick={() => form.patch('/settings/branding')} disabled={form.processing}>Save branding</Button>
          </CardContent>
        </Card>
        <ThemePreviewCard branding={preview} />
      </div>
    </AppLayout>
  );
}
