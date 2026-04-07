'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

// Construct DashboardShell directly in the Client Component to avoid serializing functions across boundaries
const DashboardShell = ({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-sm shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-900 tracking-tight">Rupasinghe Pawning</h1>
          <button className="md:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Portfolio Management */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portfolio</p>
            <a href="/" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Dashboard</a>
            <a href="/clients" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Customers</a>
            <a href="/loans" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Pawn Items</a>
            <a href="/transactions" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Transactions</a>
          </div>

          {/* Core Banking / Accounting */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accounting & GL</p>
            <a href="/accounting/ledger" className="block px-4 py-2 rounded-lg hover:bg-indigo-50 text-indigo-700 font-black transition-colors">General Ledger</a>
            <a href="/transactions/transfers" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Vault Transfers</a>
            <a href="/reports" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">Risk Reports</a>
          </div>

          {/* Operations */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operations</p>
            <a href="/operations/eod" className="block px-4 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-black transition-colors">End-of-Day</a>
            {user?.role === 'ADMIN' && (
              <a href="/employees" className="block px-4 py-2 rounded-lg hover:bg-emerald-50 text-emerald-700 font-black transition-colors">Manage Staff</a>
            )}
          </div>

          {/* Administration */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System</p>
            <a href="/profile" className="block px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition-colors">My Settings</a>
          </div>
        </nav>
        <div className="p-6 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <p className="text-slate-900 font-bold">{user?.firstName || 'Unknown'}</p>
            <p className="text-sm font-medium text-slate-500">{user?.role === 'ADMIN' ? 'Head Office' : 'Branch Teller'}</p>
          </div>
          <button onClick={onLogout} className="text-sm bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-lg hover:bg-rose-200">
            Log Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col bg-slate-50 w-full overflow-hidden min-w-0">
        <header className="h-20 border-b border-slate-200 flex items-center px-6 md:px-8 bg-white shadow-sm shrink-0">
          <button 
            className="md:hidden p-2 -ml-2 mr-4 text-slate-600 hover:bg-slate-100 rounded-lg" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 truncate">Branch Management</h2>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
      if (pathname === '/login') {
        router.push('/');
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xl font-bold text-slate-400">Loading Session...</p></div>;
  }

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return <DashboardShell user={user} onLogout={handleLogout}>{children}</DashboardShell>;
}
