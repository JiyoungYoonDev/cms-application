'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';

export function ConditionalLayout({ children, sidebarWidth }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider initialWidth={sidebarWidth}>
      <AppSidebar />
      <SidebarInset className='min-h-screen bg-admin-light p-4 md:p-6 lg:p-8'>
        <SidebarTrigger />
        <div className='w-full'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
