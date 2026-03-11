import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { getDomainOptions } from '@/lib/domain-references';
import { CONTACT_DEPARTMENT_OPTIONS, withCurrentOption } from '@/lib/form-options';

export default function ContactForm({ data, setData, errors, processing, onSubmit, clients, domainReferences, submitLabel = 'Save contact' }) {
  const contactTypes = getDomainOptions(domainReferences, 'contactType');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Contact details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <FormSelectField id="client_company_id" label="Client company" required value={data.client_company_id} onChange={(value) => setData('client_company_id', value)} options={clients.map((client) => ({ value: client.id, label: client.name }))} placeholder="Select client" error={errors.client_company_id} />

          <FormField id="full_name" label="Full name" required error={errors.full_name}><Input id="full_name" type="text" value={data.full_name ?? ''} onChange={(e) => setData('full_name', e.target.value)} placeholder="Enter full name" /></FormField>
          <FormField id="title" label="Title" error={errors.title}><Input id="title" type="text" value={data.title ?? ''} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. IT Manager" /></FormField>
          <FormSelectField id="department" label="Department" value={data.department} onChange={(value) => setData('department', value)} options={withCurrentOption(CONTACT_DEPARTMENT_OPTIONS, data.department)} allowEmpty emptyLabel="Not set" placeholder="Select department" error={errors.department} />
          <FormField id="email" label="Email" required error={errors.email}><Input id="email" type="email" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} placeholder="name@company.com" /></FormField>
          <FormField id="phone" label="Phone" error={errors.phone}><Input id="phone" type="text" value={data.phone ?? ''} onChange={(e) => setData('phone', e.target.value)} placeholder="+960 7XX XXXX" /></FormField>
          <FormField id="mobile" label="Mobile" error={errors.mobile}><Input id="mobile" type="text" value={data.mobile ?? ''} onChange={(e) => setData('mobile', e.target.value)} placeholder="+960 7XX XXXX" /></FormField>

          <FormSelectField id="contact_type" label="Contact type" required value={data.contact_type} onChange={(value) => setData('contact_type', value)} options={contactTypes} placeholder="Select contact type" error={errors.contact_type} />

          <FormField id="escalation_level" label="Escalation level" error={errors.escalation_level}>
            <Input id="escalation_level" type="number" min="1" max="5" value={data.escalation_level ?? ''} onChange={(e) => setData('escalation_level', e.target.value)} placeholder="1 to 5" />
          </FormField>

          <FormSelectField id="preferred_contact_method" label="Preferred contact method" value={data.preferred_contact_method} onChange={(value) => setData('preferred_contact_method', value)} options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'mobile', label: 'Mobile' }]} allowEmpty emptyLabel="No preference" placeholder="Select preferred method" error={errors.preferred_contact_method} />

          <FormField id="is_active" label="Active status" error={errors.is_active} className="md:col-span-2">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">Inactive contacts remain linked to history but are hidden from active flows.</span>
              <Switch id="is_active" checked={Boolean(data.is_active)} onCheckedChange={(checked) => setData('is_active', checked)} />
            </div>
          </FormField>

          <FormField id="notes" label="Notes" error={errors.notes} className="md:col-span-2">
            <Textarea id="notes" value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value)} placeholder="Add internal notes or context" />
          </FormField>
        </CardContent>
      </Card>
      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
