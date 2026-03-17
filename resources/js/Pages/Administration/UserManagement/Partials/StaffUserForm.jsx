import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { FormField } from '@/Components/forms/form-field';

export default function StaffUserForm({ data, setData, errors, processing, roles = [], submitLabel = 'Save', onSubmit, isEdit = false }) {
  const toggleRole = (roleName, enabled) => {
    const current = Array.isArray(data.roles) ? data.roles : [];
    if (enabled) {
      setData('roles', Array.from(new Set([...current, roleName])));
      return;
    }

    setData('roles', current.filter((item) => item !== roleName));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="name" label="Name" required error={errors.name}>
          <Input id="name" value={data.name || ''} onChange={(event) => setData('name', event.target.value)} placeholder="Jane Doe" />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email}>
          <Input id="email" type="email" value={data.email || ''} onChange={(event) => setData('email', event.target.value)} placeholder="jane.doe@kiel.local" />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="password" label={isEdit ? 'Password (optional)' : 'Password'} required={!isEdit} error={errors.password}>
          <Input id="password" type="password" value={data.password || ''} onChange={(event) => setData('password', event.target.value)} placeholder={isEdit ? 'Leave blank to keep existing' : 'At least 8 characters'} />
        </FormField>
        <FormField id="password_confirmation" label={isEdit ? 'Confirm Password (if changed)' : 'Confirm Password'} required={!isEdit} error={errors.password_confirmation}>
          <Input id="password_confirmation" type="password" value={data.password_confirmation || ''} onChange={(event) => setData('password_confirmation', event.target.value)} placeholder="Repeat password" />
        </FormField>
      </div>

      <FormField label="Staff roles" required error={errors.roles} hint="Client-user role is intentionally excluded for staff accounts.">
        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((role) => {
            const checked = (data.roles || []).includes(role.name);
            return (
              <div key={role.id} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">{role.name}</span>
                <Switch checked={checked} onCheckedChange={(enabled) => toggleRole(role.name, enabled)} />
              </div>
            );
          })}
        </div>
      </FormField>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>{submitLabel}</Button>
      </div>
    </form>
  );
}
