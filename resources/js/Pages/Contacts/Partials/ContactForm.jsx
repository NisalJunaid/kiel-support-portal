import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { getDomainOptions } from '@/lib/domain-references';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export default function ContactForm({ data, setData, errors, processing, onSubmit, clients, domainReferences, submitLabel = 'Save contact' }) {
  const contactTypes = getDomainOptions(domainReferences, 'contactType');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client_company_id">Client company *</Label>
            <select id="client_company_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.client_company_id ?? ''} onChange={(e) => setData('client_company_id', e.target.value)}>
              <option value="">Select client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
            <FieldError message={errors.client_company_id} />
          </div>

          {[['full_name', 'Full name *'], ['title', 'Title'], ['department', 'Department'], ['email', 'Email *', 'email'], ['phone', 'Phone'], ['mobile', 'Mobile']].map(([field, label, type = 'text']) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
              <FieldError message={errors[field]} />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="contact_type">Contact type *</Label>
            <select id="contact_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.contact_type} onChange={(e) => setData('contact_type', e.target.value)}>
              <option value="">Select type</option>
              {contactTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <FieldError message={errors.contact_type} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation_level">Escalation level</Label>
            <Input id="escalation_level" type="number" min="1" max="5" value={data.escalation_level ?? ''} onChange={(e) => setData('escalation_level', e.target.value)} />
            <FieldError message={errors.escalation_level} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_contact_method">Preferred contact method</Label>
            <select id="preferred_contact_method" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.preferred_contact_method ?? ''} onChange={(e) => setData('preferred_contact_method', e.target.value)}>
              <option value="">No preference</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="mobile">Mobile</option>
            </select>
            <FieldError message={errors.preferred_contact_method} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Status *</Label>
            <select id="is_active" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.is_active ? '1' : '0'} onChange={(e) => setData('is_active', e.target.value === '1')}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            <FieldError message={errors.is_active} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value)} />
            <FieldError message={errors.notes} />
          </div>
        </CardContent>
      </Card>
      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
