import { useMemo } from 'react';
import { Input } from '@/Components/ui/input';
import { FormField } from '@/Components/forms/form-field';

function getTimezoneOptions() {
  const fallback = ['UTC'];
  const values = typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : fallback;

  return values;
}

export function TimezoneSelectField({ id = 'timezone', label = 'Timezone', value, onChange, error, required = false }) {
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const datalistId = `${id}-options`;

  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Input
        id={id}
        list={datalistId}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Select timezone (e.g. Asia/Male or UTC)"
        autoComplete="off"
      />
      <datalist id={datalistId}>
        {timezoneOptions.map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>
    </FormField>
  );
}
