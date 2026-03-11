import { useMemo, useState } from 'react';
import { Input } from '@/Components/ui/input';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormField } from '@/Components/forms/form-field';

function getTimezoneOptions() {
  const fallback = ['UTC'];
  const values = typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : fallback;

  return values.map((zone) => ({ value: zone, label: zone }));
}

export function TimezoneSelectField({ id = 'timezone', label = 'Timezone', value, onChange, error, required = false }) {
  const [search, setSearch] = useState('');
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const filteredOptions = useMemo(
    () => timezoneOptions.filter((option) => option.label.toLowerCase().includes(search.toLowerCase())),
    [timezoneOptions, search],
  );

  const selectedExists = timezoneOptions.some((option) => option.value === value);
  const options = selectedExists || !value
    ? filteredOptions
    : [{ value, label: `${value} (current)` }, ...filteredOptions];

  return (
    <FormField id={id} label={label} required={required} error={error}>
      <Input
        id={`${id}-search`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search timezone (e.g. Asia, UTC, Europe/London)"
      />
      <FormSelectField
        id={id}
        label={null}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={filteredOptions.length ? 'Select timezone' : 'No timezone match'}
      />
    </FormField>
  );
}
