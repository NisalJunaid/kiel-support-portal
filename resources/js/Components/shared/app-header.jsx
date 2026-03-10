import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Bell, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Switch } from '@/Components/ui/switch';
import { DARK_MODE_STORAGE_KEY } from '@/lib/theme';

export function AppHeader({ sidebarCollapsed, onToggleSidebar, onOpenMobileSidebar, auth, notifications, authorization, branding }) {
  if (!auth?.user || !authorization?.isStaffWorkspace) return null;

  const initials = auth.user.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SU';
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const sync = () => setIsDarkModeEnabled(document.documentElement.classList.contains('dark'));
    window.addEventListener('kiel:theme-preference-changed', sync);

    return () => window.removeEventListener('kiel:theme-preference-changed', sync);
  }, []);

  const onToggleDarkMode = (checked) => {
    setIsDarkModeEnabled(checked);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, checked ? '1' : '0');
    document.documentElement.classList.toggle('dark', checked);
    window.dispatchEvent(new Event('kiel:theme-preference-changed'));

    if (authorization?.canViewSettings) {
      router.patch('/settings/branding/dark-mode', { dark_mode_enabled: checked }, { preserveScroll: true, preserveState: true, replace: true });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenMobileSidebar}><PanelLeft className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={onToggleSidebar}>
          {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Staff Workspace</p>
          <p className="text-xs text-muted-foreground">{branding?.app_name || 'Kiel Support Portal'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border px-2 py-1">
          <span className="text-xs text-muted-foreground">Dark mode</span>
          <Switch checked={isDarkModeEnabled} onCheckedChange={onToggleDarkMode} />
        </div>

        {authorization?.canViewNotifications && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications?.unread_count > 0 && <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">{notifications.unread_count}</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between"><span>Notifications</span><Link href="/notifications" className="text-xs font-medium text-primary">View all</Link></DropdownMenuLabel>
              {(notifications?.recent ?? []).length === 0 ? <DropdownMenuItem disabled>No notifications yet.</DropdownMenuItem> : notifications.recent.map((item) => <DropdownMenuItem key={item.id} className="block cursor-pointer" onSelect={() => { if (!item.read_at) router.patch(`/notifications/${item.id}/read`, {}, { preserveScroll: true }); if (item.url) router.visit(item.url); }}><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.message}</p></DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="gap-2"><Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar><span>{auth.user.name}</span></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{auth.user.email}</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/logout" method="post" as="button">Sign out</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
