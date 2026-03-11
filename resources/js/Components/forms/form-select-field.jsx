import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { FormField } from '@/Components/forms/form-field';

export function FormSelectField({ id, label, value, onChange, options, placeholder = 'Select an option', error, hint, required = false, allowEmpty = false, emptyLabel = 'None', className }) {
  const normalizedValue = value === null || value === undefined || value === '' ? (allowEmpty ? '__empty__' : '') : `${value}`;

  return (
    <FormField id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <Select value={normalizedValue} onValueChange={(next) => onChange(next === '__empty__' ? '' : next)}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="__empty__">{emptyLabel}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={`${option.value}`} value={`${option.value}`}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
