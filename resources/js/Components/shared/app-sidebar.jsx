import { Link } from '@inertiajs/react';
import { LayoutDashboard, Building2, Users, Boxes, Ticket, Briefcase, Timer, BarChart3, Settings, Shield, History, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requires: 'isStaffWorkspace' },
  { label: 'Clients', href: '/clients', icon: Building2, requires: 'canViewClients' },
  { label: 'Contacts', href: '/contacts', icon: Users, requires: 'canViewContacts' },
  { label: 'Client Users', href: '/client-users', icon: Users, requires: 'canViewClientUsers' },
  { label: 'Assets', href: '/assets', icon: Boxes, requires: 'canViewAssets' },
  { label: 'Tickets', href: '/tickets', icon: Ticket, requires: 'canViewTickets' },
  { label: 'Services', href: '/services', icon: Briefcase, requires: 'canViewServices' },
  { label: 'SLA Plans', href: '/sla-plans', icon: Timer, requires: 'canViewSlaPlans' },
  { label: 'Activity', href: '/activity', icon: History, requires: 'canViewActivity' },
  { label: 'Notifications', href: '/notifications', icon: Bell, requires: 'canViewNotifications' },
  { label: 'Reports', href: '/reports', icon: BarChart3, requires: 'canViewReports' },
  { label: 'Settings', href: '/settings/branding', icon: Settings, requires: 'canViewSettings' },
  { label: 'Administration', href: '/administration', icon: Shield, requires: 'canViewAdminReadiness' },
  { label: 'System Reference', href: '/administration/system-reference', icon: Shield, requires: 'canViewSystemReference' },
];

export function AppSidebar({ collapsed = false, onNavigate, url, auth, authorization, branding }) {
  if (!auth?.user || !authorization?.isStaffWorkspace) return null;

  return (
    <aside className={cn('h-full border-r bg-card p-3 transition-all', collapsed ? 'w-[78px]' : 'w-64')}>
      <div className={cn('mb-6 flex items-center gap-2 rounded-md border bg-muted/40 p-2', collapsed && 'justify-center')}>
        {branding?.logo_url ? <img src={branding.logo_url} alt="Brand logo" className="h-8 w-8 rounded object-cover" /> : <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">K</div>}
        {!collapsed && <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">Kiel</p><p className="text-sm font-semibold leading-tight">{branding?.app_name || 'Support Portal'}</p></div>}
      </div>
      <nav className="space-y-1">
        {nav.filter((item) => !item.requires || authorization?.[item.requires]).map((item) => {
          const Icon = item.icon;
          const active = url.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors', active ? 'bg-primary text-white' : 'hover:bg-accent', collapsed && 'justify-center px-2')} title={collapsed ? item.label : undefined}>
              <Icon className="h-4 w-4" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
