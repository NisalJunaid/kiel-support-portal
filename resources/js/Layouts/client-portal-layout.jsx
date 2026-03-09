import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Ticket, Boxes, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlashMessages } from '@/Components/shared/flash-messages';
import { Button } from '@/Components/ui/button';

const nav = [
  { label: 'Dashboard', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'My Tickets', href: '/portal/tickets', icon: Ticket },
  { label: 'Assets', href: '/portal/assets', icon: Boxes, requires: 'canViewAssets' },
  { label: 'Contacts', href: '/portal/contacts', icon: Users, requires: 'canViewContacts' },
];

export default function ClientPortalLayout({ children, title, description }) {
  const { url, props } = usePage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Kiel</p>
            <p className="text-lg font-semibold">Client Portal</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/logout" method="post" as="button">Log out</Link>
          </Button>
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
                  <Link key={item.href} href={item.href} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm', active ? 'bg-primary text-white' : 'hover:bg-accent')}>
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
          {children}
        </main>
      </div>
    </div>
  );
}
