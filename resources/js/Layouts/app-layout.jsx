import { useEffect, useState } from 'react';
import { AppHeader } from '@/Components/shared/app-header';
import { AppSidebar } from '@/Components/shared/app-sidebar';
import { FlashMessages } from '@/Components/shared/flash-messages';
import { PageHeader } from '@/Components/shared/page-header';
import { Sheet, SheetContent } from '@/Components/ui/sheet';

export default function AppLayout({ children, title, description, breadcrumbs = [] }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem('kiel.sidebar.collapsed') === '1');
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('kiel.sidebar.collapsed', prev ? '0' : '1');
      return !prev;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} />
      </div>
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 pt-4 sm:max-w-[280px]">
          <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 flex-col">
        <AppHeader sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <PageHeader title={title} description={description} breadcrumbs={breadcrumbs} />
          <FlashMessages />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
