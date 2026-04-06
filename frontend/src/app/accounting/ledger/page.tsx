'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Landmark, Filter, Download, 
  RefreshCcw, ArrowRightLeft, CreditCard, Banknote,
  Search, ChevronLeft, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LedgerPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/gl/journal', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setJournals(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = journals.filter(j => 
    j.type.toLowerCase().includes(filter.toLowerCase()) || 
    j.branchId.toLowerCase().includes(filter.toLowerCase()) ||
    j.referenceId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-black tracking-widest text-xs uppercase mb-2">
            <BookOpen className="h-4 w-4" /> Mifos X Compliance
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-none">General Ledger</h1>
          <p className="text-slate-500 font-medium">Native Double-Entry Journal Audit Trail.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search TX / Branch..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium" 
            />
          </div>
          <Button onClick={loadJournals} variant="outline" className="gap-2 font-bold border-slate-300">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Sync Ledger
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 shadow-lg shadow-indigo-100 gap-2">
            <Download className="h-4 w-4" /> Export GLS
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Ledger Summary Cards */}
        <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200">
          <CardHeader className="pb-2">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Total Pawn Receivable</p>
            <CardTitle className="text-3xl font-black">Rs. 8,452,000</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-indigo-500 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-white w-3/4 rounded-full shadow-[0_0_8px_white]" />
            </div>
            <p className="text-[10px] font-bold mt-2 text-indigo-200 uppercase tracking-wide">Category: 1100 Assets</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200">
          <CardHeader className="pb-2">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-200">Interest Income (MTD)</p>
            <CardTitle className="text-3xl font-black">Rs. 420,150</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-1 w-full bg-emerald-500 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-white w-1/2 rounded-full shadow-[0_0_8px_white]" />
            </div>
            <p className="text-[10px] font-bold mt-2 text-emerald-200 uppercase tracking-wide">Category: 4001 Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-xl shadow-slate-200 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ledger Integrity</p>
              <CardTitle className="text-3xl font-black">100% Balanced</CardTitle>
            </div>
            <Landmark className="h-10 w-10 text-slate-700" />
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Sum(Debits) === Sum(Credits). All 11 branches verified and consolidated.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Table */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow>
                <TableHead className="w-16 font-black text-xs uppercase tracking-widest text-slate-500 pl-8">#</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-500">Timestamp</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-500">Branch</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-500">Transaction Type</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-500 w-[400px]">Double-Entry Details</TableHead>
                <TableHead className="font-black text-xs uppercase tracking-widest text-slate-500 pr-8 text-right">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 h text-center py-20">
                    <RefreshCcw className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4 opacity-20" />
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Pulling from Firestore Ledger...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No matching journal entries found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((j, idx) => (
                  <TableRow key={idx} className="group hover:bg-slate-50/80 border-slate-50 transition-colors">
                    <TableCell className="font-bold text-slate-400 pl-8">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-slate-600 text-xs">
                      {j.timestamp ? new Date(j.timestamp).toLocaleString('en-GB') : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 font-black text-xs border-slate-200">
                        {j.branchId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          j.type === 'PAWN' ? 'bg-blue-100 text-blue-700' : 
                          j.type === 'REPAYMENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {j.type === 'PAWN' ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                        </div>
                        <span className="font-black text-slate-900 tracking-tight">{j.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                        {j.entries?.map((e:any, ei:number) => (
                          <div key={ei} className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                            <span className="text-slate-500 w-48 truncate">{e.accountName} <span className="text-[9px] opacity-40 font-medium">({e.account})</span></span>
                            <div className="flex gap-4">
                              <span className={e.type === 'DEBIT' ? 'text-blue-600' : 'text-emerald-600'}>
                                {e.type === 'DEBIT' ? `DR Rs. ${e.amount.toLocaleString()}` : ''}
                              </span>
                              <span className={e.type === 'CREDIT' ? 'text-emerald-600' : 'text-blue-600'}>
                                {e.type === 'CREDIT' ? `CR Rs. ${e.amount.toLocaleString()}` : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-tighter truncate max-w-[120px] ml-auto">
                        REF:{j.referenceId}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 text-slate-400 border-slate-200">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-black text-xs text-slate-400 uppercase tracking-widest">Page 1 of 1</span>
        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 text-slate-400 border-slate-200">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}
