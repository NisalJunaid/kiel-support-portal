import AppLayout from '@/Layouts/app-layout';
import { EmptyState } from '@/Components/shared/empty-state';

export default function Placeholder({ module }) {
  return (
    <AppLayout
      title={module}
      description={`${module} module foundation is ready for CRUD implementation.`}
      breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: module }]}
    >
      <EmptyState title={`${module} coming next`} description={`This ${module} section is wired through Laravel routes and Inertia pages.`} />
    </AppLayout>
  );
}
