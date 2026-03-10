import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ThemePreviewCard } from '@/Components/settings/theme-preview-card';
import { Switch } from '@/Components/ui/switch';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function Branding({ branding }) {
  const form = useForm({
    app_name: branding.app_name,
    primary_color: branding.primary_color,
    secondary_color: branding.secondary_color,
    accent_color: branding.accent_color,
    card_border_color: branding.card_border_color || branding.border_color,
    dark_mode_enabled: Boolean(branding.dark_mode_enabled),
    logo: null,
    remove_logo: false,
  });

  const preview = useMemo(() => ({
    ...branding,
    ...form.data,
    logo_url: form.data.remove_logo ? null : (form.data.logo ? URL.createObjectURL(form.data.logo) : branding.logo_url),
  }), [branding, form.data]);

  const saveBranding = () => {
    form
      .transform((data) => ({
        ...data,
        dark_mode_enabled: data.dark_mode_enabled ? 1 : 0,
        remove_logo: data.remove_logo ? 1 : 0,
      }))
      .patch('/settings/branding', {
        forceFormData: true,
        preserveState: false,
      });
  };

  return (
    <AppLayout title="Branding settings" description="Manage logo and global theme for the staff workspace." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings' }, { label: 'Branding' }]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Theme & logo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(form.errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>Unable to save branding settings. Please review the form fields and try again.</AlertDescription>
              </Alert>
            )}
            <div>
              <Label>Application name</Label>
              <Input value={form.data.app_name} onChange={(e) => form.setData('app_name', e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[['primary_color', 'Primary'], ['secondary_color', 'Secondary'], ['accent_color', 'Accent'], ['card_border_color', 'Card border']].map(([key, label]) => (
                <div key={key}>
                  <Label>{label} color</Label>
                  <Input type="color" value={form.data[key]} onChange={(e) => form.setData(key, e.target.value)} className="h-10 p-1" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Global dark mode</p>
                <p className="text-xs text-muted-foreground">Applies to staff and client portals in real time.</p>
              </div>
              <Switch checked={form.data.dark_mode_enabled} onCheckedChange={(checked) => form.setData('dark_mode_enabled', checked)} />
            </div>
            <div>
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={(e) => form.setData('logo', e.target.files?.[0] || null)} />
              {branding.logo_url && !form.data.remove_logo && (
                <div className="mt-3 rounded-md border p-3">
                  <p className="mb-2 text-xs text-muted-foreground">Current saved logo</p>
                  <img src={branding.logo_url} alt="Current logo" className="h-12 w-12 rounded object-contain" />
                </div>
              )}
              {branding.logo_url && <Button type="button" variant="ghost" size="sm" onClick={() => form.setData('remove_logo', !form.data.remove_logo)}>{form.data.remove_logo ? 'Keep logo' : 'Remove existing logo'}</Button>}
            </div>
            <Button onClick={saveBranding} disabled={form.processing}>Save branding</Button>
          </CardContent>
        </Card>
        <ThemePreviewCard branding={preview} />
      </div>
    </AppLayout>
  );
}
