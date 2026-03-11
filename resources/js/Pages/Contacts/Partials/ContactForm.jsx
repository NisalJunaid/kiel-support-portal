import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { getDomainOptions } from '@/lib/domain-references';

export default function ContactForm({ data, setData, errors, processing, onSubmit, clients, domainReferences, submitLabel = 'Save contact' }) {
  const contactTypes = getDomainOptions(domainReferences, 'contactType');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="client_company_id" label="Client company" required value={data.client_company_id} onChange={(value) => setData('client_company_id', value)} options={clients.map((client) => ({ value: client.id, label: client.name }))} placeholder="Select client" error={errors.client_company_id} />

          {[['full_name', 'Full name', 'text', true], ['title', 'Title'], ['department', 'Department'], ['email', 'Email', 'email', true], ['phone', 'Phone'], ['mobile', 'Mobile']].map(([field, label, type = 'text', required = false]) => (
            <FormField key={field} id={field} label={label} required={required} error={errors[field]}>
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
            </FormField>
          ))}

          <FormSelectField id="contact_type" label="Contact type" required value={data.contact_type} onChange={(value) => setData('contact_type', value)} options={contactTypes} placeholder="Select type" error={errors.contact_type} />

          <FormField id="escalation_level" label="Escalation level" error={errors.escalation_level}>
            <Input id="escalation_level" type="number" min="1" max="5" value={data.escalation_level ?? ''} onChange={(e) => setData('escalation_level', e.target.value)} />
          </FormField>

          <FormSelectField id="preferred_contact_method" label="Preferred contact method" value={data.preferred_contact_method} onChange={(value) => setData('preferred_contact_method', value)} options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'mobile', label: 'Mobile' }]} allowEmpty emptyLabel="No preference" error={errors.preferred_contact_method} />

          <FormField id="is_active" label="Active status" error={errors.is_active} className="md:col-span-2">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">Inactive contacts remain linked to history but are hidden from active flows.</span>
              <Switch id="is_active" checked={Boolean(data.is_active)} onCheckedChange={(checked) => setData('is_active', checked)} />
            </div>
          </FormField>

          <FormField id="notes" label="Notes" error={errors.notes} className="md:col-span-2">
            <Textarea id="notes" value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value)} />
          </FormField>
        </CardContent>
      </Card>
      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
