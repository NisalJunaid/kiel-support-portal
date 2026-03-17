import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn('flex min-h-24 w-full rounded-md border border-input/80 bg-input px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors duration-200 placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60', className)}
      {...props}
    />
  );
}
