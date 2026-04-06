'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Send, CheckCircle2, AlertCircle, RefreshCcw, Landmark, Truck } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toBranch, setToBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const branches = ["BRL","KOT","DMT","WAT","KIR","KDW","DHW","PND","KTW","HMG"];

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/transfers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTransfers(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleInitiate = async () => {
    if (!toBranch || !amount || !desc) { toast.error("Please fill all fields"); return; }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/transfers/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ toBranch, amount: parseFloat(amount), description: desc })
      });
      if (res.ok) {
        toast.success("Transfer initiated!");
        setAmount(""); setDesc("");
        loadTransfers();
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:8080/transfers/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Transfer acknowledged and vault updated!");
        loadTransfers();
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inter-Branch Transfers</h1>
          <p className="text-slate-500 font-medium tracking-tight">Dual-control physical & cash movement mapping.</p>
        </div>
        <Button onClick={loadTransfers} variant="ghost" className="gap-2 text-slate-400">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Initiate Form */}
        <Card className="lg:col-span-1 h-fit bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" /> Initiate Movement
            </CardTitle>
            <CardDescription className="font-medium">Send cash or items to another branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Destination Branch</Label>
              <Select onValueChange={(val: any) => setToBranch(val as string)}>
                <SelectTrigger className="bg-slate-50 font-bold">
                  <SelectValue placeholder="Select Destination" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(b => <SelectItem key={b} value={b}>{b} Unit</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Amount (LKR)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-slate-50 font-black h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Description / Item details</Label>
              <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Physical cash or item IDs" className="bg-slate-50 font-medium" />
            </div>
            <Button onClick={handleInitiate} className="w-full bg-blue-600 hover:bg-blue-700 font-black h-12 gap-2 mt-2 shadow-lg shadow-blue-100">
              <ArrowRightLeft className="h-4 w-4" /> Send to Destination
            </Button>
          </CardContent>
        </Card>

        {/* Transfer Grid */}
        <Card className="lg:col-span-2 bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" /> Movement Tracker
            </CardTitle>
            <CardDescription className="font-medium">Audit trail of in-transit and acknowledged transfers.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-xs uppercase tracking-widest pl-6">Unit Log</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest">Amount</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="font-black text-xs uppercase tracking-widest pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <ArrowRightLeft className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No active transfers tracked.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((t, i) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 tracking-tight">{t.fromBranch} → {t.toBranch}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-slate-900">Rs. {t.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          t.status === 'ACKNOWLEDGED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {t.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {t.status === 'INITIATED' && (
                          <Button variant="outline" size="sm" onClick={() => handleAcknowledge(t.id)} className="font-black border-slate-300 gap-1 hover:bg-emerald-50 hover:text-emerald-700 border-2">
                             Acknowledge Receipt
                          </Button>
                        )}
                        {t.status === 'ACKNOWLEDGED' && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600 ml-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl flex items-start gap-4 shadow-sm shadow-amber-50">
        <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
        <div className="space-y-1">
          <p className="font-black text-amber-900 uppercase tracking-widest text-xs">Dual-Control Workflow Note</p>
          <p className="text-sm text-amber-700 font-medium leading-relaxed italic">
            "Once initiated, cash is immediately deducted from the sending vault. The destination branch must 
            physically verify the receipt and acknowledge this entry to update their own vault balance. 
            All movements are logged in the General Ledger for headquarters audit."
          </p>
        </div>
      </div>
    </div>
  );
}
