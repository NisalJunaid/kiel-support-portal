import { AppHeader } from '@/Components/shared/app-header';
import { AppSidebar } from '@/Components/shared/app-sidebar';
import { FlashMessages } from '@/Components/shared/flash-messages';
import { PageHeader } from '@/Components/shared/page-header';

export default function AppLayout({ children, title, description, breadcrumbs = [] }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 space-y-6 p-6">
          <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
          <FlashMessages />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
