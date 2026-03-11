import { Badge } from '@/Components/ui/badge';

export function TicketSystemEventRow({ message }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="px-2 py-0 text-[10px] uppercase tracking-wide">System</Badge>
        <span>{message.body}</span>
        <span>•</span>
        <span>{message.created_at}</span>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
