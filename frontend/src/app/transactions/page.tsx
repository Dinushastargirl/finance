'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Send, FileText, ArrowRightLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer State
  const [targetBranchId, setTargetBranchId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase.from('transaction').select('*').order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) {
        setTransactions(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTransfer = async () => {
    try {
      const { error } = await supabase.from('transaction').insert([{
        clientId: 'INTERNAL_TRANSFER',
        type: 'TRANSFER',
        targetBranchId: targetBranchId || 'UNKNOWN',
        amount: parseFloat(amount) || 0,
        description: description || 'Routine Branch Balancing',
        timestamp: new Date().toISOString()
      }]);

      if (error) throw error;

      setIsOpen(false);
      setTargetBranchId('');
      setAmount('');
      setDescription('');
      loadTransactions();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Ledger Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Branch-specific transaction history and transfers.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold h-10 px-4 w-full md:w-auto shrink-0">
          <Send className="h-4 w-4" /> Initiate Branch Transfer
        </Button>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-blue-600"/> Branch Cash Transfer</DialogTitle>
            <DialogDescription>
              Transfer working capital between operational branches.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-medium text-slate-700">Target Destination Branch</Label>
              <Select onValueChange={(val) => val && setTargetBranchId(val)} value={targetBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select receiver branch..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KOT">Kotikawatta (KOT)</SelectItem>
                  <SelectItem value="MRG">Maharagama (MRG)</SelectItem>
                  <SelectItem value="BRL">Borella (BRL)</SelectItem>
                  <SelectItem value="WAT">Wattala (WAT)</SelectItem>
                  <SelectItem value="KIR">Kiribathgoda (KIR)</SelectItem>
                  <SelectItem value="HQ">Head Office (HQ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="font-medium text-slate-700">Transfer Capital Amount (Rs.)</Label>
              <Input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="500000" className="border-slate-300" />
            </div>
            <div className="grid gap-2">
              <Label className="font-medium text-slate-700">Audit Reference Log</Label>
              <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="E.g. Daily Vault Balancing" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleTransfer} className="bg-slate-900 hover:bg-slate-800 font-semibold text-white">Execute Transfer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ledger logs by TX ID..." className="pl-8 bg-white border-slate-200" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-800">TX Ref ID / Hash</TableHead>
              <TableHead className="font-bold text-slate-800">Direction / Type</TableHead>
              <TableHead className="font-bold text-slate-800">Date Executed</TableHead>
              <TableHead className="font-bold text-slate-800 max-w-xs">Audit Notes</TableHead>
              <TableHead className="text-right font-bold text-slate-800">Capital Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} className="h-64 text-center font-bold text-slate-400">Loading ledger state...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 mb-2 opacity-50" />
                    Ledger is currently empty for your branch Context.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50">
                    <TableCell className="font-black text-slate-900">{tx.id.substring(0,8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === 'TRANSFER' ? <ArrowRightLeft className="h-4 w-4 text-orange-500" /> : <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                        <span className="font-bold text-slate-700">
                          {tx.type} {tx.targetBranchId && <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-2">{tx.targetBranchId}</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{new Date(tx.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-slate-600 font-medium max-w-xs truncate">{tx.description}</TableCell>
                    <TableCell className={`text-right font-black ${tx.type === 'TRANSFER' ? 'text-rose-600' : 'text-slate-800'}`}>
                      {tx.type === 'TRANSFER' ? `- Rs. ${tx.amount.toLocaleString()}` : `Rs. ${tx.amount.toLocaleString()}`}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
