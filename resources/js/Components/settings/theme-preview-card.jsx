import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

export function ThemePreviewCard({ branding }) {
  return (
    <Card>
      <CardHeader><CardTitle>Brand preview</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4" style={{ backgroundColor: branding.secondary_color }}>
          <div className="mb-3 flex items-center gap-2">
            {branding.logo_url ? <img src={branding.logo_url} className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded" style={{ backgroundColor: branding.primary_color }} />}
            <p className="font-semibold">{branding.app_name}</p>
          </div>
          <div className="flex gap-2">
            <Badge style={{ backgroundColor: branding.primary_color, color: '#fff' }}>Primary</Badge>
            <Badge variant="outline" style={{ borderColor: branding.accent_color }}>Accent</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
