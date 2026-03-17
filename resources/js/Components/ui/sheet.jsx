import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

const SheetContent = React.forwardRef(({ className, children, side = 'right', overlayClassName, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className={cn('fixed inset-0 z-[110] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', overlayClassName)} />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed z-[120] border-border bg-card p-6 text-card-foreground shadow-lg transition ease-out data-[state=open]:animate-in data-[state=closed]:animate-out',
        side === 'right' && 'inset-y-0 right-0 h-full w-full border-l duration-300 sm:max-w-xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        side === 'left' && 'inset-y-0 left-0 h-full w-full border-r duration-300 sm:max-w-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        className,
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="h-4 w-4" />
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
));
SheetContent.displayName = Dialog.Content.displayName;

const SheetHeader = ({ className, ...props }) => <div className={cn('space-y-1.5 pr-8', className)} {...props} />;
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => <Dialog.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />);
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => <Dialog.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />);

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
