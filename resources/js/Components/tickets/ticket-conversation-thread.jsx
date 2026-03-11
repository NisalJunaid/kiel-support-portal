import { EmptyState } from '@/Components/shared/empty-state';
import { TicketMessageBubble } from '@/Components/tickets/ticket-message-bubble';
import { TicketSystemEventRow } from '@/Components/tickets/ticket-system-event-row';

export function TicketConversationThread({
  messages = [],
  currentUserId = null,
  emptyTitle = 'No conversation yet',
  emptyDescription = 'Messages will appear here as the ticket is updated.',
  showTypeBadge = true,
  className = '',
}) {
  if (!messages.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message) => {
        if (message.message_type === 'system_event' || message.is_system) {
          return <TicketSystemEventRow key={message.id} message={message} />;
        }

        return (
          <TicketMessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            showTypeBadge={showTypeBadge}
          />
        );
      })}
    </div>
  );
}
