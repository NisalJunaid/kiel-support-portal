import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ThemePreviewCard } from '@/Components/settings/theme-preview-card';
import { Switch } from '@/Components/ui/switch';
import { applyBrandingTheme, hexToHsl } from '@/lib/theme';

export default function Branding({ branding }) {
  const form = useForm({
    app_name: branding.app_name,
    primary_color: branding.primary_color,
    secondary_color: branding.secondary_color,
    accent_color: branding.accent_color,
    surface_border_color: branding.surface_border_color,
    dark_mode_enabled: Boolean(branding.dark_mode_enabled),
    logo: null,
    remove_logo: false,
  });


  useEffect(() => {
    const root = document.documentElement;
    const prev = {
      primary: root.style.getPropertyValue('--primary'),
      secondary: root.style.getPropertyValue('--secondary'),
      accent: root.style.getPropertyValue('--accent'),
      surfaceBorder: root.style.getPropertyValue('--surface-border'),
      border: root.style.getPropertyValue('--border'),
      input: root.style.getPropertyValue('--input'),
      dark: root.classList.contains('dark'),
    };

    applyBrandingTheme(root, {
      primary: hexToHsl(form.data.primary_color),
      secondary: hexToHsl(form.data.secondary_color),
      accent: hexToHsl(form.data.accent_color),
      surfaceBorder: hexToHsl(form.data.surface_border_color),
    });
    root.classList.toggle('dark', Boolean(form.data.dark_mode_enabled));

    return () => {
      root.style.setProperty('--primary', prev.primary);
      root.style.setProperty('--secondary', prev.secondary);
      root.style.setProperty('--accent', prev.accent);
      root.style.setProperty('--surface-border', prev.surfaceBorder);
      root.style.setProperty('--border', prev.border);
      root.style.setProperty('--input', prev.input);
      root.classList.toggle('dark', prev.dark);
    };
  }, [form.data.primary_color, form.data.secondary_color, form.data.accent_color, form.data.surface_border_color, form.data.dark_mode_enabled]);

  const preview = {
    ...branding,
    ...form.data,
    logo_url: form.data.remove_logo ? null : (form.data.logo ? URL.createObjectURL(form.data.logo) : branding.logo_url),
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
            <div className="grid gap-3 sm:grid-cols-4">
              {[['primary_color', 'Primary'], ['secondary_color', 'Secondary'], ['accent_color', 'Accent'], ['surface_border_color', 'Card border']].map(([key, label]) => (
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
            <Button onClick={() => form.patch('/settings/branding', { forceFormData: true })} disabled={form.processing}>Save branding</Button>
          </CardContent>
        </Card>
        <ThemePreviewCard branding={preview} />
      </div>
    </AppLayout>
  );
}
