import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Building2, Users, Boxes, Ticket, Briefcase, BarChart3, Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Building2, requires: 'canViewClients' },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Assets', href: '/assets', icon: Boxes },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Services', href: '/services', icon: Briefcase },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Administration', href: '/administration', icon: Shield, requires: 'canViewAdminReadiness' },
  { label: 'System Reference', href: '/administration/system-reference', icon: Shield, requires: 'canViewSystemReference' },
];

export function AppSidebar() {
  const { url, props } = usePage();

  if (!props.auth?.user) {
    return null;
  }

  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Kiel</p>
        <p className="text-lg font-semibold">Support Portal</p>
      </div>
      <nav className="space-y-1">
        {nav.filter((item) => !item.requires || props.authorization?.[item.requires]).map((item) => {
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
  );
}
