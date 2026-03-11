import { Label } from '@/Components/ui/label';
import { cn } from '@/lib/utils';

export function FormField({ id, label, required = false, error, hint, className, children }) {
  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label> : null}
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
