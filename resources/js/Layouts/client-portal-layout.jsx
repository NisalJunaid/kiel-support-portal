import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Ticket, Boxes, Users, Moon, Sun, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlashMessages } from '@/Components/shared/flash-messages';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { resolveBrandLogoUrl } from '@/lib/branding';
import { useTheme } from '@/lib/theme-context';

const nav = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'My Tickets', href: '/portal/tickets', icon: Ticket },
  { label: 'Assets', href: '/portal/assets', icon: Boxes, requires: 'canViewAssets' },
  { label: 'Contacts', href: '/portal/contacts', icon: Users, requires: 'canViewContacts' },
];

export default function ClientPortalLayout({ children, title, description }) {
  const { url, props } = usePage();
  const branding = props.branding;
  const { darkModeEnabled, setDarkModeEnabled } = useTheme();
  const logoUrl = resolveBrandLogoUrl(branding, darkModeEnabled);
  const initials = props.auth?.user?.avatar_initials || 'U';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/portal/dashboard" className="flex h-12 items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={`${branding?.app_name || 'Support portal'} logo`} className="h-10 w-40 object-contain" />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{branding?.app_name || 'Support Portal'}</span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
              <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Switch checked={darkModeEnabled} onCheckedChange={(checked) => setDarkModeEnabled(checked)} aria-label="Toggle dark mode" />
              <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Avatar>
                    <AvatarImage src={props.auth?.user?.avatar_url || ''} alt={props.auth?.user?.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate">{props.auth?.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{props.auth?.user?.email}</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link href="/settings/profile"><UserCircle2 className="mr-2 h-4 w-4" />My Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/logout" method="post" as="button">Log out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border bg-card p-3">
          <nav className="space-y-1">
            {nav
              .filter((item) => !item.requires || props.authorization?.[item.requires])
              .map((item) => {
                const Icon = item.icon;
                const active = url.startsWith(item.href);

                return (
                  <Link key={item.href} href={item.href} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200', active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent')}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        </aside>

        <main className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <FlashMessages />
          <div className="animate-in fade-in-0 duration-300">{children}</div>
        </main>
      </div>
    </div>
  );
}
