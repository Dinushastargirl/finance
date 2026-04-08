'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function LoansPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [appraisal, setAppraisal] = useState('');
  const [amount, setAmount] = useState('');

  const loadLoans = async () => {
    try {
      const { data, error } = await supabase.from('transaction').select('*').eq('type', 'PAWN').order('timestamp', { ascending: false });
      if (error) throw error;
      if (data) {
        setLoans(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLoans(); }, []);

  const handleDisburse = async () => {
    try {
      const { error } = await supabase.from('transaction').insert([{
        clientId: clientId || 'UNKNOWN',
        type: 'PAWN',
        amount: parseFloat(amount) || 0,
        description: description + ` (Appraisal: Rs. ${appraisal})`,
        timestamp: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      setIsOpen(false);
      setClientId(''); setDescription(''); setAppraisal(''); setAmount('');
      loadLoans();
    } catch(err) {
      console.error(err);
    }
  };

  const totalDisbursed = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const filtered = loans.filter(l =>
    l.id?.toLowerCase().includes(search.toLowerCase()) ||
    l.clientId?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Active Pawning Items</h1>
          <p className="text-sm text-slate-500 mt-1">Record pawned collateral and assign capital to registered clients.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5 w-full md:w-auto shrink-0">
          <Plus className="h-4 w-4" /> Originate Pawn Loan
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Originate New Pawn</DialogTitle>
            <DialogDescription>
              Record a new pawned item and process the principal disbursement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="customer" className="font-medium text-slate-700">Customer ID or NIC</Label>
              <Input value={clientId} onChange={e=>setClientId(e.target.value)} id="customer" placeholder="Search customer database..." />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="item" className="font-medium text-slate-700">Pawn Item Description</Label>
              <Input value={description} onChange={e=>setDescription(e.target.value)} id="item" placeholder="E.g., 22k Gold Chain, 18g" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="appraisal" className="font-medium text-slate-700">Appraised Item Value (Rs.)</Label>
              <Input value={appraisal} onChange={e=>setAppraisal(e.target.value)} id="appraisal" type="number" placeholder="100000" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount" className="font-medium text-slate-700">Disbursed Principal Amount (Rs.)</Label>
              <Input value={amount} onChange={e=>setAmount(e.target.value)} id="amount" type="number" placeholder="85000" className="border-blue-400 bg-blue-50 focus:ring-blue-500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleDisburse} className="bg-blue-600 hover:bg-blue-700 font-semibold text-white">Finalize &amp; Disburse</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-indigo-500" /> Active Pawn Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{loading ? '—' : loans.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Capital Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : `Rs. ${totalDisbursed.toLocaleString()}`}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Items in Arrears
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by Ticket ID, Client, or Description..."
          className="pl-10 bg-white border-slate-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Pawn Cards Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="bg-white border-slate-200 animate-pulse">
              <CardContent className="p-6 h-40" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <FileText className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">{search ? 'No matching pawn items found.' : "No active pawn items. Click 'Originate Pawn Loan' to begin."}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loan) => {
            const appraisalMatch = loan.description?.match(/Appraisal: Rs\. ([\d.]+)/);
            const appraisalVal = appraisalMatch ? parseFloat(appraisalMatch[1]) : null;
            const itemDesc = loan.description?.replace(/ \(Appraisal:.*\)/, '') || 'Pawn Item';

            return (
              <Card key={loan.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      #{loan.id?.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Item Name */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pawn Item</p>
                    <p className="font-semibold text-slate-800 leading-tight">{itemDesc}</p>
                  </div>

                  {/* Financial Data — Key Hierarchical Info */}
                  <div className="grid grid-cols-2 gap-3">
                    {appraisalVal && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Est. Value</p>
                        <p className="text-sm font-bold text-amber-800 mt-0.5">Rs. {appraisalVal.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Loan Amount</p>
                      <p className="text-sm font-bold text-blue-800 mt-0.5">Rs. {loan.amount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Client */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Client: <span className="text-slate-600 font-medium">{loan.clientId || '—'}</span></span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50">
                      <FileText className="h-3.5 w-3.5 mr-1.5" /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
