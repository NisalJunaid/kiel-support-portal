import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormDateField } from '@/Components/forms/form-date-field';
import { TimezoneSelectField } from '@/Components/forms/timezone-select-field';

const inputConfig = {
  name: { placeholder: 'Enter company name' },
  legal_name: { placeholder: 'Enter registered business name' },
  client_code: { placeholder: 'Enter unique client code' },
  industry: { placeholder: 'e.g. Hospitality, Healthcare, Education' },
  website: { placeholder: 'https://example.com' },
  primary_email: { placeholder: 'support@example.com' },
  phone: { placeholder: '+960 7XX XXXX' },
};

export default function ClientForm({ data, setData, errors, processing, onSubmit, managers = [], slaPlans = [], submitLabel = 'Save client' }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Client company details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            ['name', 'Name', 'text', true], ['legal_name', 'Legal name', 'text', true], ['client_code', 'Client code', 'text', true], ['industry', 'Industry'],
            ['website', 'Website', 'url'], ['primary_email', 'Primary email', 'email'], ['phone', 'Phone'],
          ].map(([field, label, type = 'text', required = false]) => (
            <FormField key={field} id={field} label={label} required={required} error={errors[field]}>
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} placeholder={inputConfig[field]?.placeholder} />
            </FormField>
          ))}

          <TimezoneSelectField value={data.timezone} onChange={(value) => setData('timezone', value)} error={errors.timezone} required />
          <FormDateField id="onboarded_at" label="Onboarded at" value={data.onboarded_at} onChange={(value) => setData('onboarded_at', value)} error={errors.onboarded_at} />

          <FormSelectField id="status" label="Status" required value={data.status} onChange={(value) => setData('status', value)} placeholder="Select status" options={[
            { value: 'prospect', label: 'Prospect' },
            { value: 'onboarding', label: 'Onboarding' },
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'archived', label: 'Archived' },
          ]} error={errors.status} />

          <FormSelectField id="account_manager_id" label="Account manager" value={data.account_manager_id} onChange={(value) => setData('account_manager_id', value)} options={managers.map((manager) => ({ value: manager.id, label: manager.name }))} allowEmpty emptyLabel="Unassigned" placeholder="Select account manager" error={errors.account_manager_id} />

          <FormSelectField id="sla_plan_id" label="Default SLA plan" value={data.sla_plan_id} onChange={(value) => setData('sla_plan_id', value)} options={slaPlans.map((plan) => ({ value: plan.id, label: plan.name }))} allowEmpty emptyLabel="No default SLA" placeholder="Select SLA plan" error={errors.sla_plan_id} />

          <FormField id="billing_address" label="Billing address" error={errors.billing_address} className="md:col-span-2">
            <Textarea id="billing_address" value={data.billing_address ?? ''} onChange={(e) => setData('billing_address', e.target.value)} placeholder="Enter billing address" />
          </FormField>
          <FormField id="technical_address" label="Technical address" error={errors.technical_address} className="md:col-span-2">
            <Textarea id="technical_address" value={data.technical_address ?? ''} onChange={(e) => setData('technical_address', e.target.value)} placeholder="Enter service delivery / technical address" />
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
