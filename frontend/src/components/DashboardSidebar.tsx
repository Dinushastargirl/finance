'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Wallet, 
  ArrowRightLeft, 
  FileText, 
  Settings, 
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  ShieldCheck,
  UserCircle,
  PiggyBank
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: "Intelligence Hub",
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Portfolio Growth', href: '/dashboard/executive', icon: TrendingUp },
    ]
  },
  {
    label: "Core Finance",
    items: [
      { name: 'Customers', href: '/clients', icon: Users },
      { name: 'Pawn Loans', href: '/loans', icon: Wallet },
      { name: 'Client Accounts', href: '/savings', icon: PiggyBank },
      { name: 'Ledger Records', href: '/accounting/ledger', icon: FileText },
    ]
  },
  {
    label: "Transactions",
    items: [
      { name: 'All Transactions', href: '/transactions', icon: ArrowRightLeft },
      { name: 'Vault Transfers', href: '/transactions/transfers', icon: History },
    ]
  },
  {
    label: "Operational Ops",
    items: [
      { name: 'End-of-Day', href: '/operations/eod', icon: ShieldCheck },
      { name: 'Analytics Reports', href: '/reports', icon: BarChart3 },
      { name: 'Manage Staff', href: '/employees', icon: Users, adminOnly: true },
    ]
  }
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-950 text-slate-300 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-2xl overflow-hidden border-r border-white/5 font-sans",
        isCollapsed ? "w-24" : "w-72"
      )}
    >
      {/* Branding Section */}
      <div className="h-28 flex items-center px-6 mb-2 relative shrink-0">
        <div className="flex items-center gap-4">
          <div className="min-w-[56px] h-14 w-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 ring-2 ring-white/10 group-hover:scale-110 transition-transform duration-300 transform rotate-3 relative overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent" />
             <span className="text-white font-black text-xl tracking-tighter relative z-10">RP</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-white font-black tracking-tighter text-2xl leading-none">RUPASINGHE</span>
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-90">Finance Intel Hub</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-4 space-y-10 overflow-y-auto pt-6 scrollbar-hide pb-10">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-4">
            {!isCollapsed && (
              <p className="px-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
                {group.label}
              </p>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                if (item.adminOnly && user?.role !== 'ADMIN') return null;
                
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "group flex items-center h-12 px-5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                      isActive 
                        ? "bg-primary text-white shadow-xl shadow-primary/20" 
                        : "hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 shrink-0 transition-all duration-300 group-hover:scale-110",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
                    )} />
                    {!isCollapsed && (
                      <span className="ml-5 font-bold text-[13px] tracking-tight">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile & Footer */}
      <div className="p-4 border-t border-white/5 space-y-3 bg-black/20 shrink-0">
        {!isCollapsed && user && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-3xl bg-white/5 border border-white/5 group transition-all">
            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10 relative">
              <UserCircle className="w-7 h-7 text-slate-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-black text-sm truncate tracking-tight">{user.firstName || 'User'}</span>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate">{user.role || 'Staff'}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center w-full h-11 px-5 rounded-2xl hover:bg-white/5 text-slate-500 hover:text-white transition-all group"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
              <>
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="ml-5 font-bold text-[13px]">Minimize Hub</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center w-full h-11 px-5 rounded-2xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="ml-5 font-bold text-[13px]">Vault Seal Exit</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
