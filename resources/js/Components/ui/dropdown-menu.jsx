import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={cn('z-50 min-w-44 rounded-md border bg-white p-1 shadow-md', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

export const DropdownMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item ref={ref} className={cn('rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent', className)} {...props} />
));

export const DropdownMenuLabel = ({ className, ...props }) => (
  <DropdownMenuPrimitive.Label className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
);
