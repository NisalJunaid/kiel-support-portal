import { usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';

export function AppHeader() {
  const { auth } = usePage().props;
  const initials = auth?.user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'SU';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <p className="text-sm text-muted-foreground">Staff Workspace</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <span>{auth?.user?.name ?? 'Staff User'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{auth?.user?.email ?? 'staff@kiel.local'}</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
