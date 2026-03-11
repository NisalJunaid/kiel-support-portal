import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { FormField } from '@/Components/forms/form-field';
import { FormSelectField } from '@/Components/forms/form-select-field';
import { FormDateField } from '@/Components/forms/form-date-field';
import { TimezoneSelectField } from '@/Components/forms/timezone-select-field';

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
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
            </FormField>
          ))}

          <TimezoneSelectField value={data.timezone} onChange={(value) => setData('timezone', value)} error={errors.timezone} required />
          <FormDateField id="onboarded_at" label="Onboarded at" value={data.onboarded_at} onChange={(value) => setData('onboarded_at', value)} error={errors.onboarded_at} />

          <FormSelectField
            id="status"
            label="Status"
            required
            value={data.status}
            onChange={(value) => setData('status', value)}
            options={[
              { value: 'prospect', label: 'Prospect' },
              { value: 'onboarding', label: 'Onboarding' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'archived', label: 'Archived' },
            ]}
            error={errors.status}
          />

          <FormSelectField
            id="account_manager_id"
            label="Account manager"
            value={data.account_manager_id}
            onChange={(value) => setData('account_manager_id', value)}
            options={managers.map((manager) => ({ value: manager.id, label: manager.name }))}
            allowEmpty
            emptyLabel="Unassigned"
            error={errors.account_manager_id}
          />

          <FormSelectField
            id="sla_plan_id"
            label="Default SLA plan"
            value={data.sla_plan_id}
            onChange={(value) => setData('sla_plan_id', value)}
            options={slaPlans.map((plan) => ({ value: plan.id, label: plan.name }))}
            allowEmpty
            emptyLabel="No default SLA"
            error={errors.sla_plan_id}
          />

          {['billing_address', 'technical_address', 'notes'].map((field) => (
            <FormField key={field} id={field} label={field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} error={errors[field]} className="md:col-span-2">
              <Textarea id={field} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
            </FormField>
          ))}
        </CardContent>
      </Card>
      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
