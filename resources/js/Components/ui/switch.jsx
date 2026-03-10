import { cn } from '@/lib/utils';

export function Switch({ checked, onCheckedChange, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn('inline-flex h-6 w-11 items-center rounded-full border border-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', checked ? 'bg-primary' : 'bg-muted', className)}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className={cn('h-5 w-5 rounded-full border border-border bg-background shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}
