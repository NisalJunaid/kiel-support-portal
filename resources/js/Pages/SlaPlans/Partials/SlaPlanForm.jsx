import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

function jsonFieldError(value) {
  if (!value) {
    return null;
  }

  try {
    JSON.parse(value);
    return null;
  } catch {
    return 'Must be valid JSON.';
  }
}

export default function SlaPlanForm({ data, setData, errors, processing, submitLabel, onSubmit }) {
  const businessHoursError = jsonFieldError(data.business_hours);
  const escalationRulesError = jsonFieldError(data.escalation_rules);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SLA plan details</CardTitle>
          <CardDescription>Set response and resolution targets used by clients, services, and tickets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={data.name} onChange={(e) => setData('name', e.target.value)} /><p className="text-xs text-destructive">{errors.name}</p></div>
          <div className="space-y-2"><Label>Response minutes</Label><Input type="number" min="1" value={data.response_minutes} onChange={(e) => setData('response_minutes', e.target.value)} /><p className="text-xs text-destructive">{errors.response_minutes}</p></div>
          <div className="space-y-2"><Label>Resolution minutes</Label><Input type="number" min="1" value={data.resolution_minutes} onChange={(e) => setData('resolution_minutes', e.target.value)} /><p className="text-xs text-destructive">{errors.resolution_minutes}</p></div>
          <div className="space-y-2 md:col-span-2"><Label>Business hours JSON (optional)</Label><Textarea rows={4} value={data.business_hours} onChange={(e) => setData('business_hours', e.target.value)} placeholder='{"timezone":"UTC","workdays":["Mon","Tue"]}' /><p className="text-xs text-muted-foreground">Use valid JSON object format for business hours metadata.</p><p className="text-xs text-destructive">{errors.business_hours || businessHoursError}</p></div>
          <div className="space-y-2 md:col-span-2"><Label>Escalation rules JSON (optional)</Label><Textarea rows={4} value={data.escalation_rules} onChange={(e) => setData('escalation_rules', e.target.value)} placeholder='[{"after_minutes":30,"notify_role":"staff"}]' /><p className="text-xs text-muted-foreground">Use valid JSON array format for escalation rules.</p><p className="text-xs text-destructive">{errors.escalation_rules || escalationRulesError}</p></div>
        </CardContent>
      </Card>
      <div className="flex gap-2"><Button disabled={processing || !!businessHoursError || !!escalationRulesError}>{submitLabel}</Button><Button variant="outline" asChild><Link href="/sla-plans">Cancel</Link></Button></div>
    </form>
  );
}
