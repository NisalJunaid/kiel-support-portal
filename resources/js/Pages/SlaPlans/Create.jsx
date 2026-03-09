import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import SlaPlanForm from '@/Pages/SlaPlans/Partials/SlaPlanForm';

export default function SlaPlansCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    response_minutes: '60',
    resolution_minutes: '240',
    business_hours: '',
    escalation_rules: '',
  });

  return <AppLayout title="Create SLA plan" description="Create an SLA profile used by clients/services/tickets." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans', href: '/sla-plans' }, { label: 'Create' }]}><SlaPlanForm data={data} setData={setData} errors={errors} processing={processing} submitLabel="Create SLA plan" onSubmit={(e) => { e.preventDefault(); post('/sla-plans'); }} /></AppLayout>;
}
