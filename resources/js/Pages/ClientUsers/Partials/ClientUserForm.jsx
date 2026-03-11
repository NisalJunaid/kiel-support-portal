import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { CLIENT_USER_ROLE_OPTIONS, withCurrentOption } from '@/lib/form-options';

export default function ClientUserForm({ data, setData, errors, processing, onSubmit, clients, contacts, submitLabel }) {
  const filteredContacts = contacts.filter((contact) => String(contact.client_company_id) === String(data.client_company_id));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>User identity</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField
            id="client_company_id"
            label="Client company"
            required
            value={data.client_company_id}
            onChange={(value) => {
              setData('client_company_id', value);
              setData('contact_id', '');
            }}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            placeholder="Select client"
            error={errors.client_company_id}
          />

          <FormSelectField
            id="contact_id"
            label="Linked contact"
            value={data.contact_id}
            onChange={(value) => setData('contact_id', value)}
            options={filteredContacts.map((contact) => ({ value: contact.id, label: `${contact.full_name} (${contact.email})` }))}
            allowEmpty
            emptyLabel="No linked contact"
            error={errors.contact_id}
          />

          {[['name', 'Name', 'text', true], ['email', 'Email', 'email', true]].map(([field, label, type = 'text', required = false]) => (
            <FormField key={field} id={field} label={label} required={required} error={errors[field]}>
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} placeholder={field === 'name' ? 'Enter full name' : 'name@company.com'} />
            </FormField>
          ))}

          <FormSelectField
            id="role_label"
            label="Role label"
            required
            value={data.role_label}
            onChange={(value) => setData('role_label', value)}
            options={withCurrentOption(CLIENT_USER_ROLE_OPTIONS, data.role_label)}
            placeholder="Select role"
            error={errors.role_label}
          />

          <FormField id="password" label={`Password ${submitLabel.includes('Update') ? '(optional)' : '*'}`} error={errors.password}><Input id="password" type="password" value={data.password ?? ''} onChange={(e) => setData('password', e.target.value)} placeholder="Minimum 8 characters" /></FormField>
          <FormField id="password_confirmation" label="Confirm password"><Input id="password_confirmation" type="password" value={data.password_confirmation ?? ''} onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="Re-enter password" /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access flags</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[['can_view_all_company_tickets', 'Can view all company tickets'], ['can_create_tickets', 'Can create tickets'], ['can_view_assets', 'Can view assets'], ['can_manage_contacts', 'Can manage contacts']].map(([field, label]) => (
            <div key={field} className="flex items-center justify-between rounded-md border p-3">
              <div><p className="text-sm font-medium">{label}</p>{errors[field] ? <p className="text-xs text-destructive">{errors[field]}</p> : null}</div>
              <Switch checked={!!data[field]} onCheckedChange={(checked) => setData(field, checked)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
