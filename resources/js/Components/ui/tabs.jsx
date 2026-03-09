import { cn } from '@/lib/utils';

export function Tabs({ children, className }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function TabsList({ children, className }) {
  return <div className={cn('inline-flex items-center rounded-md bg-muted p-1', className)}>{children}</div>;
}

export function TabsTrigger({ active, children, onClick }) {
  return <button type="button" onClick={onClick} className={cn('rounded-sm px-3 py-1.5 text-sm', active ? 'bg-background shadow-sm' : 'text-muted-foreground')}>{children}</button>;
}

export function TabsContent({ children, active }) {
  if (!active) return null;
  return <div>{children}</div>;
}
