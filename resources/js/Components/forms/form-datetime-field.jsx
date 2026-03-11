import { CalendarClock, X } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { FormField } from '@/Components/forms/form-field';

export function FormDateTimeField({ id, label, value, onChange, error, hint, required = false }) {
  return (
    <FormField id={id} label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type="datetime-local" className="pl-9 pr-10" value={value || ''} onChange={(event) => onChange(event.target.value)} />
        {value ? (
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => onChange('')}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </FormField>
  );
}
