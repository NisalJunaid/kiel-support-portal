import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export default function ClientUserForm({ data, setData, errors, processing, onSubmit, clients, contacts, submitLabel }) {
  const filteredContacts = contacts.filter((contact) => String(contact.client_company_id) === String(data.client_company_id));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>User identity</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="client_company_id">Client company *</Label>
            <select id="client_company_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.client_company_id ?? ''} onChange={(e) => { setData('client_company_id', e.target.value); setData('contact_id', ''); }}>
              <option value="">Select client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select><FieldError message={errors.client_company_id} /></div>

          <div className="space-y-2"><Label htmlFor="contact_id">Linked contact (optional)</Label>
            <select id="contact_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.contact_id ?? ''} onChange={(e) => setData('contact_id', e.target.value)}>
              <option value="">No linked contact</option>{filteredContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.full_name} ({contact.email})</option>)}
            </select><FieldError message={errors.contact_id} /></div>

          {[['name', 'Name *'], ['email', 'Email *', 'email'], ['role_label', 'Role label *']].map(([field, label, type = 'text']) => <div key={field} className="space-y-2"><Label htmlFor={field}>{label}</Label><Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} /><FieldError message={errors[field]} /></div>)}

          <div className="space-y-2"><Label htmlFor="password">Password {submitLabel.includes('Update') ? '(optional)' : '*'}</Label><Input id="password" type="password" value={data.password ?? ''} onChange={(e) => setData('password', e.target.value)} /><FieldError message={errors.password} /></div>
          <div className="space-y-2"><Label htmlFor="password_confirmation">Confirm password</Label><Input id="password_confirmation" type="password" value={data.password_confirmation ?? ''} onChange={(e) => setData('password_confirmation', e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access flags</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[['can_view_all_company_tickets', 'Can view all company tickets'], ['can_create_tickets', 'Can create tickets'], ['can_view_assets', 'Can view assets'], ['can_manage_contacts', 'Can manage contacts']].map(([field, label]) => (
            <div key={field} className="flex items-center justify-between rounded-md border p-3">
              <div><p className="text-sm font-medium">{label}</p><FieldError message={errors[field]} /></div>
              <Switch checked={!!data[field]} onCheckedChange={(checked) => setData(field, checked)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
