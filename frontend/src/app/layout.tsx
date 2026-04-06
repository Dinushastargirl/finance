import type { Metadata } from 'next';
import './globals.css';
import AuthGuard from '@/components/AuthGuard';

const interFont = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

export const metadata: Metadata = {
  title: 'Rupasinghe Pawning | Branch Management',
  description: 'Core pawning and branch transaction platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ fontFamily: interFont }} className="bg-slate-50 text-slate-900 dashboard-shell text-lg" suppressHydrationWarning>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
