import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { applyThemeTokens, buildThemeTokens } from '@/lib/theme';
import { resolveBrandLogoUrl } from '@/lib/branding';

function ThemeTokenScope({ branding, children }) {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (!scopeRef.current) return;
    applyThemeTokens(scopeRef.current, buildThemeTokens(branding, Boolean(branding?.dark_mode_enabled)));
    scopeRef.current.classList.toggle('dark', Boolean(branding?.dark_mode_enabled));
  }, [branding]);

  return <div ref={scopeRef}>{children}</div>;
}

export function ThemePreviewCard({ branding }) {
  const logoUrl = resolveBrandLogoUrl(branding, Boolean(branding?.dark_mode_enabled));

  return (
    <Card>
      <CardHeader><CardTitle>Brand preview</CardTitle></CardHeader>
      <CardContent>
        <ThemeTokenScope branding={branding}>
          <div className="space-y-4 rounded-lg border bg-background p-4 text-foreground">
            <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                {logoUrl ? <img src={logoUrl} alt="Brand logo" className="h-8 w-24 object-contain" /> : <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">K</div>}
                <p className="text-sm font-semibold">{branding.app_name}</p>
              </div>
              <Badge>Primary</Badge>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="w-full">Primary action</Button>
              <Button variant="secondary" className="w-full">Secondary action</Button>
              <Input placeholder="Themed input" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one">Option one</SelectItem>
                  <SelectItem value="two">Option two</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Border token</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Dropdown</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Menu item</DropdownMenuItem>
                  <DropdownMenuItem>Another item</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Surface</TableHead><TableHead>Status</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Card / table</TableCell><TableCell className="text-muted-foreground">Readable</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </ThemeTokenScope>
      </CardContent>
    </Card>
  );
}
