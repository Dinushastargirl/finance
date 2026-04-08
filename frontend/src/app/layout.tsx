import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';
import DashboardSidebar from '@/components/DashboardSidebar';

const interFont = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

export const metadata: Metadata = {
  title: 'Rupasinghe Pawning | Branch Intelligence',
  description: 'Core pawning and branch transaction platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: interFont }} className="bg-background text-foreground dashboard-shell" suppressHydrationWarning>
        <AuthGuard>
          <div className="flex min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 ml-20 lg:ml-64 transition-all duration-500 p-6 md:p-8">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
