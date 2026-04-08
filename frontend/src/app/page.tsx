'use client';

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

const statsTemplate = [
  { label: "Total Balance", value: "$0", change: "+0.0%", trend: "up", icon: DollarSign, color: "emerald" },
  { label: "Active Loans", value: "0", change: "+0.0%", trend: "up", icon: CreditCard, color: "blue" },
  { label: "Total Clients", value: "0", change: "+0.0%", trend: "up", icon: Users, color: "indigo" },
  { label: "Pending Transactions", value: "0", change: "-0.0%", trend: "down", icon: Activity, color: "rose" },
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
  { name: "Personal Loans", value: 35, color: "#3b82f6" },
  { name: "Business Loans", value: 28, color: "#10b981" },
  { name: "Mortgage", value: 22, color: "#8b5cf6" },
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
          { label: "Total Asset Balance", value: "$2,456,890", change: "+12.5%", trend: "up", icon: DollarSign, color: "emerald" },
          { label: "Active Pawn Loans", value: "1,234", change: "+8.2%", trend: "up", icon: CreditCard, color: "blue" },
          { label: "Total Clients", value: clients.length.toString(), change: "+15.3%", trend: "up", icon: Users, color: "indigo" },
          { label: "Pending Logistics", value: "267", change: "-4.1%", trend: "down", icon: Activity, color: "rose" },
        ]);
        setRecentTransactions(txs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Intelligence Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Welcome back! Here's a real-time overview of the branch portfolios today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                  {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Revenue vs Expenses Flow</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 600}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 600}} />
              <Tooltip />
              <Legend wrapperStyle={{fontWeight: 600, fontSize: 12}} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Portfolio Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={loanDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {loanDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {loanDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Activity Feed</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Client ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900">{tx.clientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full tracking-widest">{tx.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-black text-slate-900">Rs. {tx.amount?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
