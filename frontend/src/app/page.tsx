'use client';

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statsTemplate = [
  { label: "Total Balance", value: "Rs. 0", change: "+0.0%", trend: "up", icon: DollarSign, color: "emerald" },
  { label: "Active Loans", value: "0", change: "+0.0%", trend: "up", icon: CreditCard, color: "blue" },
  { label: "Total Clients", value: "0", change: "+0.0%", trend: "up", icon: Users, color: "primary" },
  { label: "Pending Issues", value: "0", change: "-0.0%", trend: "down", icon: Activity, color: "rose" },
];

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 40000 },
];

const loanDistribution = [
  { name: "Personal Loans", value: 35, color: "var(--color-primary)" },
  { name: "Business Loans", value: 28, color: "#10b981" },
  { name: "Mortgage", value: 22, color: "#7c3aed" },
  { name: "Auto Loans", value: 15, color: "#f59e0b" },
];

export default function Home() {
  const [stats, setStats] = useState(statsTemplate);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: clients } = await supabase.from('client').select('id');
      const { data: txs } = await supabase.from('transaction').select('*').order('timestamp', { ascending: false }).limit(5);

      if (clients && txs) {
        setStats([
          { label: "Total Asset Balance", value: "Rs. 2,456,890", change: "+12.5%", trend: "up", icon: DollarSign, color: "emerald" },
          { label: "Active Pawn Loans", value: "1,234", change: "+8.2%", trend: "up", icon: CreditCard, color: "blue" },
          { label: "Total Active Clients", value: clients.length.toString(), change: "+15.3%", trend: "up", icon: Users, color: "primary" },
          { label: "Pending Logistics", value: "267", change: "-4.1%", trend: "down", icon: Activity, color: "rose" },
        ]);
        setRecentTransactions(txs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors font-black uppercase tracking-widest text-[10px] px-3">
              <Sparkles className="w-3 h-3 mr-1" /> Branch Intelligence Active
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
             Operations <span className="text-gradient">Hub</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Real-time liquidity monitoring, client origination tracking, and portfolio risk management for your branch.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 shadow-xl shadow-primary/20 card-hover">
            Record Transaction <ArrowUpRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass card-hover border-white/40 overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-500/5 blur-3xl`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                    stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600" :
                    stat.color === 'blue' ? "bg-blue-500/10 text-blue-600" :
                    stat.color === 'rose' ? "bg-rose-500/10 text-rose-600" :
                    "bg-primary/10 text-primary"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge className={cn(
                    "font-black text-[10px] uppercase tracking-widest border-none px-2",
                    stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                  )}>
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass border-white/40 overflow-hidden shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <CardTitle className="text-xl font-black tracking-tighter">Growth Trajectory</CardTitle>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claims</span>
               </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  tick={{fontSize: 10, fontWeight: 800}} 
                  axisLine={false} 
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{fontSize: 10, fontWeight: 800}} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(v) => `Rs.${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    fontWeight: 800,
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-white/40 shadow-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tighter">Net Exposure</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="relative h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={loanDistribution} cx="50%" cy="50%" innerRadius={75} outerRadius={100} paddingAngle={4} dataKey="value">
                      {loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Weighted</span>
                  <span className="text-3xl font-black text-slate-900">76.2%</span>
               </div>
            </div>
            <div className="space-y-4 mt-8">
              {loanDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-900 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Records Table */}
      <Card className="glass border-white/40 shadow-2xl overflow-hidden mb-12">
        <CardHeader className="bg-white/30 border-b border-white/20 px-8 py-6">
           <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black tracking-tighter uppercase">Recent Ledger Activity</CardTitle>
              <Button variant="outline" className="border-primary/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white h-9 px-4">View Full History</Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mandate Identifier</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">TX Manifest</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Inflow</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-10 text-center font-bold text-slate-300">Awaiting fresh ledger protocols...</td></tr>
                ) : recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-primary/5 transition-all duration-300 group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4">{tx.clientId}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Badge className="bg-white text-slate-600 border border-slate-200 font-black text-[9px] uppercase tracking-[0.2em] shadow-sm">
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="text-sm font-black text-emerald-600">Rs. {tx.amount?.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
