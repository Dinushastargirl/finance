'use client';

import { usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import { cn } from '@/lib/utils';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen relative w-full overflow-x-hidden">
      <DashboardSidebar />
      <main className="flex-1 transition-all duration-500 ml-24 lg:ml-72 min-h-screen flex flex-col">
        <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
