import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';
import { TicketAttachmentBlock } from '@/Components/tickets/ticket-attachment-block';

const variantStyles = {
  public_reply: 'bg-muted/50 border-border text-foreground',
  internal_note: 'bg-warning/10 border-warning/40 text-foreground',
};

const typeLabels = {
  public_reply: 'Public reply',
  internal_note: 'Internal note',
};

const initialsFor = (name) => {
  if (!name) return 'SY';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

export function TicketMessageBubble({ message, currentUserId = null, showTypeBadge = true }) {
  const isCurrentUser = currentUserId && message.author?.id === currentUserId;
  const isInternal = message.message_type === 'internal_note';
  const alignEnd = isCurrentUser || isInternal;

  return (
    <div className={cn('flex gap-3', alignEnd && 'justify-end')}>
      {!alignEnd && (
        <Avatar className="mt-1 h-8 w-8 border border-border/70">
          <AvatarFallback className="text-xs">{initialsFor(message.author?.name)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('max-w-[85%] space-y-1', alignEnd && 'items-end')}>
        <div className={cn('rounded-2xl border px-4 py-3 shadow-sm', variantStyles[message.message_type] || variantStyles.public_reply)}>
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {showTypeBadge && (
              <Badge variant={isInternal ? 'warning' : 'default'} className="text-[10px] uppercase tracking-wide">
                {typeLabels[message.message_type] || 'Update'}
              </Badge>
            )}
            <span className="font-medium text-foreground">{message.author?.name || 'Support'}</span>
            <span>•</span>
            <span>{message.created_at}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
          <div className="mt-3">
            <TicketAttachmentBlock attachments={message.attachments} compact />
          </div>
        </div>
      </div>
      {alignEnd && (
        <Avatar className="mt-1 h-8 w-8 border border-border/70">
          <AvatarFallback className="text-xs">{initialsFor(message.author?.name)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
