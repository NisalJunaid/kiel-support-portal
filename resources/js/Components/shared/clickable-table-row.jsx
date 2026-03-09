import { TableRow } from '@/Components/ui/table';
import { cn } from '@/lib/utils';

export function ClickableTableRow({ onOpen, className, children }) {
  return (
    <TableRow
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn('cursor-pointer transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      {children}
    </TableRow>
  );
}
