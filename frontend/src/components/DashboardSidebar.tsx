'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Pawn Loans', href: '/loans', icon: Wallet },
  { name: 'Transfers', href: '/transactions/transfers', icon: ArrowRightLeft },
  { name: 'Accounting', href: '/accounting/ledger', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-950 text-slate-300 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-2xl overflow-hidden",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="min-w-[40px] h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
             <span className="text-white font-black text-xs">RP</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-white font-black tracking-tighter text-lg leading-none">RUPASINGHE</span>
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Finance Hub</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "group flex items-center h-11 px-3 rounded-lg transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-50" />
              )}
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-300"
              )} />
              {!isCollapsed && (
                <span className="ml-3 font-bold text-sm tracking-tight">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center w-full h-11 px-3 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all group"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
            <>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="ml-3 font-bold text-sm">Collapse View</span>
            </>
          )}
        </button>
        
        <button className="flex items-center w-full h-11 px-3 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group">
          <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span className="ml-3 font-bold text-sm">Seal Branch</span>}
        </button>
      </div>
    </aside>
  );
}
