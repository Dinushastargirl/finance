'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Landmark, ShieldCheck, 
  RefreshCcw, AlertTriangle, Building2, Wallet, 
  ArrowUpRight, FileText, LayoutDashboard, Database
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [eodStatus, setEodStatus] = useState<any>({});
  const [journals, setJournals] = useState<any[]>([]);
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [pRes, eRes, jRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/portfolio`, { headers }),
        fetch(`${API_BASE_URL}/eod/status`, { headers }),
        fetch(`${API_BASE_URL}/gl/journal`, { headers }),
        fetch(`${API_BASE_URL}/vault`, { headers })
      ]);

      if (pRes.ok) setPortfolio(await pRes.json());
      if (eRes.ok) setEodStatus(await eRes.json());
      if (jRes.ok) setJournals(await jRes.json());
      if (vRes.ok) setVaults(await vRes.json());
    } catch (err) {
      console.error("Failed to load executive data", err);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <RefreshCcw className="h-12 w-12 text-blue-600 animate-spin opacity-50" />
      <p className="font-bold text-slate-500 tracking-tight">Aggregating branch data...</p>
    </div>
  );

  const totalVault = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);
  const branches = ["BRL","KOT","DMT","WAT","KIR","KDW","DHW","PND","KTW","HMG"];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-black tracking-widest text-xs uppercase mb-2">
            <ShieldCheck className="h-4 w-4" /> Head Office Oversight
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-none">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Consolidated view of all 11 branches in real-time.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadData} variant="outline" className="gap-2 font-bold border-slate-300">
            <RefreshCcw className="h-4 w-4" /> Refresh Grid
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-lg shadow-blue-200">
            Export Master Report
          </Button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Total Portfolio</CardTitle>
            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
              <Landmark className="h-5 w-5 text-blue-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              Rs. {portfolio?.outstandingPortfolio?.toLocaleString() || '0'}
            </div>
            <div className="flex items-center mt-2 text-emerald-600 font-bold text-xs gap-1">
              <TrendingUp className="h-3 w-3" /> +12% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Total Vault Cash</CardTitle>
            <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-600 transition-colors">
              <Wallet className="h-5 w-5 text-emerald-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-700 tracking-tighter">
              Rs. {totalVault.toLocaleString()}
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 tracking-wide uppercase">Cash-on-hand (All Branches)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Portfolio At Risk (PAR)</CardTitle>
            <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-600 transition-colors">
              <AlertTriangle className="h-5 w-5 text-rose-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-700 tracking-tighter">
              {portfolio?.portfolioAtRisk_pct || '0'}%
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 tracking-wide uppercase">90+ days overdue ratio</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Active Contracts</CardTitle>
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-600 transition-colors">
              <FileText className="h-5 w-5 text-indigo-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              1,284
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 tracking-wide uppercase">Total Pawn Tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Branch Operations Grid */}
        <Card className="lg:col-span-2 bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-800">Branch Performance Grid</CardTitle>
              <CardDescription className="font-medium">Operational health & EOD status</CardDescription>
            </div>
            <Badge variant="outline" className="font-bold gap-1"><Building2 className="h-3 w-3"/> 11 Units Active</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 hover:bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-slate-600 uppercase text-xs pl-8">Branch</TableHead>
                  <TableHead className="font-black text-slate-600 uppercase text-xs">Portfolio</TableHead>
                  <TableHead className="font-black text-slate-600 uppercase text-xs">Vault Balance</TableHead>
                  <TableHead className="font-black text-slate-600 uppercase text-xs pr-8 text-right">EOD Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map(b => (
                  <TableRow key={b} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="font-black text-slate-900 pl-8">{b}</TableCell>
                    <TableCell className="font-bold text-slate-600">Rs. {((portfolio?.byBranch?.[b] || 0)).toLocaleString()}</TableCell>
                    <TableCell className="font-bold text-emerald-700">
                      Rs. {(vaults.find(v => v.branchId === b)?.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                        eodStatus[b] === 'CLOSED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200 pulse-status'
                      }`}>
                        {eodStatus[b] || 'OPEN'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Activity Feed (GL) */}
        <Card className="bg-white border-slate-200 h-full">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-black text-slate-800">Branch Activity Stream</CardTitle>
            <CardDescription className="font-medium">Real-time General Ledger entries</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {journals.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs">Awaiting Network Events</p>
                </div>
              ) : (
                journals.map((j, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-lg ${j.type === 'PAWN' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {j.type === 'PAWN' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-black text-slate-800 truncate">{j.type} | {j.branchId}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{j.timestamp ? new Date(j.timestamp).toLocaleTimeString() : ''}</p>
                      </div>
                      <p className="text-lg font-black text-slate-900">Rs. {j.amount?.toLocaleString()}</p>
                      <div className="mt-2 space-y-1">
                        {j.entries?.map((e:any, ei:number) => (
                          <div key={ei} className="flex justify-between text-[10px] font-bold uppercase tracking-wider bg-slate-50 p-1 rounded">
                            <span className="text-slate-500">{e.accountName}</span>
                            <span className={e.type === 'DEBIT' ? 'text-blue-600' : 'text-emerald-600'}>{e.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-blue-600 font-black tracking-widest text-xs uppercase gap-1 hover:text-blue-700">
                View Full Forensic Ledger <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .pulse-status {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
