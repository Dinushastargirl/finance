'use client';

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Landmark, ShieldCheck, 
  RefreshCcw, AlertTriangle, Building2, Wallet, 
  ArrowUpRight, FileText, LayoutDashboard, Database,
  Download
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [eodStatus, setEodStatus] = useState<any>({});
  const [journals, setJournals] = useState<any[]>([]);
  const [vaults, setVaults] = useState<any[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
      
      if (isRefresh) toast.success("Dashboard data synchronized successfully.");
    } catch (err) {
      console.error("Failed to load executive data", err);
      toast.error("Cloud synchronization failed. Check connection.");
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    const toastId = toast.loading("Generating Master Report PDF...");

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f8fafc" // bg-slate-50
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Executive_Master_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Master Report downloaded.", { id: toastId });
    } catch (err) {
      console.error("PDF Export failed", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <RefreshCcw className="h-12 w-12 text-primary animate-spin opacity-50" />
      <p className="font-black text-primary animate-pulse tracking-widest uppercase text-xs">Aggregating branch data...</p>
    </div>
  );

  const totalVault = vaults.reduce((sum, v) => sum + (v.balance || 0), 0);
  const branches = ["BRL","KOT","DMT","WAT","KIR","KDW","DHW","PND","KTW","HMG"];

  return (
    <div ref={dashboardRef} className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end glass p-8 rounded-3xl border-white/50 shadow-2xl gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase mb-2">
            <ShieldCheck className="h-4 w-4" /> Head Office Oversight
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-none tracking-tighter">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium">Consolidated view of all 11 branches in real-time.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            disabled={refreshing || exporting} 
            onClick={() => loadData(true)} 
            variant="outline" 
            className="flex-1 md:flex-none gap-2 font-black text-[10px] uppercase tracking-widest border-slate-200 glass h-12 px-6"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh Grid'}
          </Button>
          <Button 
            disabled={exporting || refreshing}
            onClick={handleExportPDF}
            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20 rounded-2xl gap-2"
          >
            {exporting ? (
               <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
               <Download className="h-4 w-4" />
            )}
            {exporting ? 'Generating...' : 'Export Master Report'}
          </Button>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-white/50 hover:shadow-2xl transition-all duration-500 group rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Portfolio</CardTitle>
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary transition-colors">
              <Landmark className="h-5 w-5 text-primary group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              Rs. {portfolio?.outstandingPortfolio?.toLocaleString() || '0'}
            </div>
            <div className="flex items-center mt-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest gap-1">
              <TrendingUp className="h-3 w-3" /> +12.5% Growth
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/50 hover:shadow-2xl transition-all duration-500 group rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Vault Cash</CardTitle>
            <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:bg-emerald-600 transition-colors">
              <Wallet className="h-5 w-5 text-emerald-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-emerald-700 tracking-tighter leading-none">
              Rs. {totalVault.toLocaleString()}
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-3 tracking-widest uppercase">Global Cash-on-hand</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/50 hover:shadow-2xl transition-all duration-500 group rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Portfolio At Risk</CardTitle>
            <div className="bg-rose-500/10 p-2 rounded-xl group-hover:bg-rose-600 transition-colors">
              <AlertTriangle className="h-5 w-5 text-rose-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-rose-700 tracking-tighter leading-none">
              {portfolio?.portfolioAtRisk_pct || '0'}%
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-3 tracking-widest uppercase">90+ days overdue ratio</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/50 hover:shadow-2xl transition-all duration-500 group rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Contracts</CardTitle>
            <div className="bg-indigo-500/10 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
              <FileText className="h-5 w-5 text-indigo-600 group-hover:text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              1,284
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-3 tracking-widest uppercase">Total Pawn Tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Branch Operations Grid */}
        <Card className="lg:col-span-2 glass border-white/50 rounded-[2rem] overflow-hidden shadow-xl">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between p-8 bg-white/40">
            <div>
              <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Branch Performance Grid</CardTitle>
              <CardDescription className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mt-1">Operational health & status</CardDescription>
            </div>
            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest gap-1 border-primary/20 bg-primary/5 text-primary"><Building2 className="h-3 w-3"/> 11 Units Online</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pl-10 h-16">Branch ID</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-16">Portfolio</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest h-16">Vault Balance</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase text-[10px] tracking-widest pr-10 text-right h-16">Daily Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map(b => (
                  <TableRow key={b} className="group hover:bg-primary/5 transition-all duration-300">
                    <TableCell className="font-black text-slate-900 pl-10 py-5">{b}</TableCell>
                    <TableCell className="font-bold text-slate-600 py-5 italic">Rs. {((portfolio?.byBranch?.[b] || 0)).toLocaleString()}</TableCell>
                    <TableCell className="font-black text-emerald-700 py-5">
                      Rs. {(vaults.find(v => v.branchId === b)?.balance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-10 py-5">
                      <span className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
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
        <Card className="glass border-white/50 rounded-[2rem] overflow-hidden shadow-xl h-full flex flex-col">
          <CardHeader className="border-b border-slate-100 p-8 bg-white/40">
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight italic">Activity Stream</CardTitle>
            <CardDescription className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mt-1">Real-time ledger events</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="divide-y divide-slate-100 flex-1 max-h-[600px] overflow-y-auto scrollbar-hide">
              {journals.length === 0 ? (
                <div className="p-12 text-center text-slate-300">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-[10px]">Awaiting Network Events</p>
                </div>
              ) : (
                journals.map((j, i) => (
                  <div key={i} className="p-6 hover:bg-primary/5 transition-all duration-300 flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-xl transition-transform group-hover:scale-110 ${j.type === 'PAWN' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {j.type === 'PAWN' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{j.type} | {j.branchId}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{j.timestamp ? new Date(j.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                      </div>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">Rs. {j.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-primary font-black tracking-widest text-[10px] uppercase gap-2 hover:bg-primary/5">
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
