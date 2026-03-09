import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AppHeader } from '@/Components/shared/app-header';
import { AppSidebar } from '@/Components/shared/app-sidebar';
import { FlashMessages } from '@/Components/shared/flash-messages';
import { PageHeader } from '@/Components/shared/page-header';
import { Sheet, SheetContent } from '@/Components/ui/sheet';

export default function AppLayout({ children, title, description, breadcrumbs = [] }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { url, props } = usePage();

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem('kiel.sidebar.collapsed') === '1');
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('kiel.sidebar.collapsed', prev ? '0' : '1');
      return !prev;
    });
  };

  const sidebarWidth = sidebarCollapsed ? '78px' : '256px';

  return (
    <div className="flex min-h-screen bg-background" style={{ '--sidebar-width': sidebarWidth }}>
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} url={url} auth={props.auth} authorization={props.authorization} branding={props.branding} />
      </div>
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 pt-4 sm:max-w-[280px]">
          <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} url={url} auth={props.auth} authorization={props.authorization} branding={props.branding} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <AppHeader sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} auth={props.auth} notifications={props.notifications} authorization={props.authorization} branding={props.branding} />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
          <FlashMessages flash={props.flash} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
