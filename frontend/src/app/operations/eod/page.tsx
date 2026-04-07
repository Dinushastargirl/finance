'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Unlock, CheckCircle2, History, AlertCircle, RefreshCcw, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api-config";

export default function EodPage() {
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [sRes, hRes] = await Promise.all([
        fetch(`${API_BASE_URL}/eod/status`, { headers }),
        fetch(`${API_BASE_URL}/eod/history`, { headers })
      ]);

      if (sRes.ok) setStatus(await sRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCloseDay = async () => {
    if (!confirm("Are you sure you want to close the day? This will freeze all transactions for today and cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/eod/close`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Branch closed successfully!");
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to close day");
      }
    } catch (err) {
      toast.error("Network error during EOD close");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCcw className="animate-spin h-8 w-8 text-blue-600" /></div>;

  const isClosed = status?.status === 'CLOSED';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Status Header */}
      <div className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        isClosed ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex gap-4 items-center">
          <div className={`p-3 rounded-full shrink-0 ${isClosed ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isClosed ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {isClosed ? 'Branch Closed (Frozen)' : 'Branch Operations Active'}
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
              Scope: {status?.branchId} | Date: {status?.date}
            </p>
          </div>
        </div>
        {!isClosed && (
          <Button onClick={handleCloseDay} className="bg-rose-600 hover:bg-rose-700 font-semibold px-6 gap-2 w-full md:w-auto">
            <CheckCircle2 className="h-4 w-4" /> Execute EOD Close
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Today's Stats (Frozen or Current) */}
        <Card className="md:col-span-1 bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-600" /> Today's Counters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Transaction Count</p>
              <p className="text-2xl font-bold text-slate-900">{status?.snapshot?.transactionCount || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Disbursed</p>
              <p className="text-2xl font-bold text-slate-900">Rs. {status?.snapshot?.totalDisbursed?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Repaid</p>
              <p className="text-2xl font-bold text-slate-900">Rs. {status?.snapshot?.totalRepaid?.toLocaleString() || 0}</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Vault Final Balance</p>
              <p className="text-2xl font-bold text-emerald-700">Rs. {status?.snapshot?.vaultBalance?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* EOD History */}
        <Card className="md:col-span-2 bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600" /> Closing History
              </CardTitle>
              <CardDescription className="font-medium">Audit trail of branch shutdowns</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={loadData} className="text-slate-400 hover:text-slate-600">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-xs uppercase tracking-widest pl-6">Date</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest">Vault</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest">Txs</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest pr-6 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                      No historical snapshots recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((h, i) => (
                    <TableRow key={i} className="hover:bg-slate-50">
                      <TableCell className="font-black text-slate-800 pl-6">{h.date}</TableCell>
                      <TableCell className="font-bold text-emerald-700">Rs. {h.vaultBalance?.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-slate-600">{h.transactionCount}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black text-[10px] uppercase tracking-tighter">
                          SUCCESS / FROZEN
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
        <div className="space-y-1">
          <p className="font-black text-blue-900">Mifos X Compliance Note</p>
          <p className="text-sm text-blue-700 font-medium leading-relaxed">
            EOD closing is a mandatory workflow. Once "Locked", the ledger for this date is committed and any further 
            activity must be recorded in the following business day. Audit logs are automatically generated for 
            compliance oversight at the Main Branch.
          </p>
        </div>
      </div>
    </div>
  );
}
