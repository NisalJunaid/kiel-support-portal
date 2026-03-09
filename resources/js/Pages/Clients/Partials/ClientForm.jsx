import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export default function ClientForm({ data, setData, errors, processing, onSubmit, managers = [], submitLabel = 'Save client' }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Client company details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            ['name', 'Name *'], ['legal_name', 'Legal name *'], ['client_code', 'Client code *'], ['industry', 'Industry'],
            ['website', 'Website'], ['primary_email', 'Primary email'], ['phone', 'Phone'], ['timezone', 'Timezone *'], ['onboarded_at', 'Onboarded at', 'date'],
          ].map(([field, label, type = 'text']) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{label}</Label>
              <Input id={field} type={type} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
              <FieldError message={errors[field]} />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.status} onChange={(e) => setData('status', e.target.value)}>
              <option value="">Select status</option><option value="prospect">Prospect</option><option value="onboarding">Onboarding</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="archived">Archived</option>
            </select>
            <FieldError message={errors.status} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_manager_id">Account manager</Label>
            <select id="account_manager_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.account_manager_id ?? ''} onChange={(e) => setData('account_manager_id', e.target.value)}>
              <option value="">Unassigned</option>
              {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
            </select>
            <FieldError message={errors.account_manager_id} />
          </div>

          {['billing_address', 'technical_address', 'notes'].map((field) => (
            <div key={field} className="space-y-2 md:col-span-2">
              <Label htmlFor={field}>{field.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Label>
              <Textarea id={field} value={data[field] ?? ''} onChange={(e) => setData(field, e.target.value)} />
              <FieldError message={errors[field]} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Button disabled={processing}>{submitLabel}</Button>
    </form>
  );
}
