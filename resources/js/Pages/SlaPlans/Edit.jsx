import AppLayout from '@/Layouts/app-layout';
import { useForm } from '@inertiajs/react';
import SlaPlanForm from '@/Pages/SlaPlans/Partials/SlaPlanForm';

export default function SlaPlansEdit({ slaPlan }) {
  const { data, setData, put, processing, errors } = useForm({
    name: slaPlan.name || '',
    response_minutes: slaPlan.response_minutes || '',
    resolution_minutes: slaPlan.resolution_minutes || '',
    business_hours: slaPlan.business_hours ? JSON.stringify(slaPlan.business_hours, null, 2) : '',
    escalation_rules: slaPlan.escalation_rules ? JSON.stringify(slaPlan.escalation_rules, null, 2) : '',
  });

  return <AppLayout title="Edit SLA plan" description="Update SLA thresholds and metadata." breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'SLA Plans', href: '/sla-plans' }, { label: 'Edit' }]}><SlaPlanForm data={data} setData={setData} errors={errors} processing={processing} submitLabel="Save changes" onSubmit={(e) => { e.preventDefault(); put(`/sla-plans/${slaPlan.id}`); }} /></AppLayout>;
}
