import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ThemePreviewCard } from '@/Components/settings/theme-preview-card';
import { Switch } from '@/Components/ui/switch';

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

    const h = (hex) => {
      const clean = hex.replace('#', '');
      const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
      const r = parseInt(full.slice(0, 2), 16) / 255;
      const g = parseInt(full.slice(2, 4), 16) / 255;
      const b = parseInt(full.slice(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return `0 0% ${Math.round(l * 100)}%`;
      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let hue = 0;
      if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue /= 6;
      return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', h(form.data.primary_color));
    root.style.setProperty('--secondary', h(form.data.secondary_color));
    root.style.setProperty('--accent', h(form.data.accent_color));
    root.style.setProperty('--surface-border', h(form.data.surface_border_color));
    root.style.setProperty('--border', h(form.data.surface_border_color));
    root.style.setProperty('--input', h(form.data.surface_border_color));
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
