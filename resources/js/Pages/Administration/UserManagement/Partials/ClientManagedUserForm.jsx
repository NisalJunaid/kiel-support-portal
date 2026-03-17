import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { CLIENT_USER_ROLE_OPTIONS } from '@/lib/form-options';

export default function ClientManagedUserForm({ data, setData, errors, processing, clientCompanies = [], contacts = [], submitLabel = 'Save', onSubmit, isEdit = false }) {
  const selectedCompany = data.client_company_id ? String(data.client_company_id) : '';
  const companyContacts = contacts.filter((contact) => String(contact.client_company_id) === selectedCompany);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="client_name" label="Name" required error={errors.name}>
          <Input id="client_name" value={data.name || ''} onChange={(event) => setData('name', event.target.value)} placeholder="Client portal user name" />
        </FormField>
        <FormField id="client_email" label="Email" required error={errors.email}>
          <Input id="client_email" type="email" value={data.email || ''} onChange={(event) => setData('email', event.target.value)} placeholder="user@client-company.com" />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="client_password" label={isEdit ? 'Password (optional)' : 'Password'} required={!isEdit} error={errors.password}>
          <Input id="client_password" type="password" value={data.password || ''} onChange={(event) => setData('password', event.target.value)} placeholder={isEdit ? 'Leave blank to keep existing' : 'At least 8 characters'} />
        </FormField>
        <FormField id="client_password_confirmation" label={isEdit ? 'Confirm Password (if changed)' : 'Confirm Password'} required={!isEdit} error={errors.password_confirmation}>
          <Input id="client_password_confirmation" type="password" value={data.password_confirmation || ''} onChange={(event) => setData('password_confirmation', event.target.value)} placeholder="Repeat password" />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormSelectField id="client_company_id" label="Client company" required value={data.client_company_id || ''} onChange={(value) => { setData('client_company_id', value); setData('contact_id', ''); }} options={clientCompanies.map((company) => ({ value: company.id, label: company.name }))} placeholder="Select client company" error={errors.client_company_id} />
        <FormSelectField id="contact_id" label="Linked contact" value={data.contact_id || ''} onChange={(value) => setData('contact_id', value)} options={companyContacts.map((contact) => ({ value: contact.id, label: contact.full_name }))} allowEmpty emptyLabel="No linked contact" placeholder="Select linked contact" error={errors.contact_id} />
        <FormSelectField id="role_label" label="Portal role label" required value={data.role_label || ''} onChange={(value) => setData('role_label', value)} options={CLIENT_USER_ROLE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))} placeholder="Select portal role" error={errors.role_label} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['can_create_tickets', 'Can create tickets'],
          ['can_view_all_company_tickets', 'Can view all company tickets'],
          ['can_view_assets', 'Can view assets'],
          ['can_manage_contacts', 'Can manage contacts'],
        ].map(([field, label]) => (
          <div key={field} className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">{label}</span>
            <Switch checked={Boolean(data[field])} onCheckedChange={(enabled) => setData(field, enabled)} />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>{submitLabel}</Button>
      </div>
    </form>
  );
}
