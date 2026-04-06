'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function LoansPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [appraisal, setAppraisal] = useState('');
  const [amount, setAmount] = useState('');

  const loadLoans = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out everything except Pawn originations for this specific table
        setLoans(data.filter((tx: any) => tx.type === 'PAWN'));
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleDisburse = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          clientId: clientId || 'UNKNOWN', 
          type: 'PAWN', 
          amount: parseFloat(amount) || 0, 
          description: description + ` (Appraisal: Rs. ${appraisal})` 
        })
      });
      if (res.ok) {
        setIsOpen(false);
        setClientId(''); setDescription(''); setAppraisal(''); setAmount('');
        loadLoans();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Active Pawning Items</h1>
          <p className="text-slate-500 font-medium">Record pawned collateral and assign capital to registered clients.</p>
        </div>
        
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4">
          <Plus className="h-5 w-5" /> Originate Pawn Loan
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Originate New Pawn</DialogTitle>
              <DialogDescription>
                Record a new pawned item and process the principal disbursement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="customer" className="font-bold">Customer ID or NIC</Label>
                <Input value={clientId} onChange={e=>setClientId(e.target.value)} id="customer" placeholder="Search customer database..." />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="item" className="font-bold">Pawn Item Description</Label>
                <Input value={description} onChange={e=>setDescription(e.target.value)} id="item" placeholder="E.g., 22k Gold Chain, 18g" />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="appraisal" className="font-bold">Appraised Item Value (Rs.)</Label>
                <Input value={appraisal} onChange={e=>setAppraisal(e.target.value)} id="appraisal" type="number" placeholder="100000" />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="amount" className="font-bold text-emerald-700">Disbursed Principal Amount (Rs.)</Label>
                <Input value={amount} onChange={e=>setAmount(e.target.value)} id="amount" type="number" placeholder="85000" className="border-emerald-500 bg-emerald-50" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDisburse} className="bg-emerald-600 hover:bg-emerald-700 font-bold w-full text-white">Finalize & Disburse Funds</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">Active Network Appraisals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">-</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">Capital Disbursed (Branch Base)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">-</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500">Items in Arrears</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600">-</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input placeholder="Search by Ticket ID or Customer NIC..." className="pl-10 py-6 bg-white border-slate-200" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm min-h-[300px]">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Ticket ID / Hash</TableHead>
              <TableHead className="font-bold">Customer ID</TableHead>
              <TableHead className="font-bold">Pawn Details</TableHead>
              <TableHead className="font-bold text-blue-700">Principal</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="h-40 text-center font-bold text-slate-400">Loading pawning registry...</TableCell></TableRow>
            ) : loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center font-bold text-slate-400">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No Active pawn items bound to your branch scope. Click 'Originate Pawn Loan' to begin.
                </TableCell>
              </TableRow>
            ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-slate-50">
                    <TableCell className="font-black text-slate-900">{loan.id.substring(0,8).toUpperCase()}</TableCell>
                    <TableCell className="text-slate-800 font-bold">{loan.clientId}</TableCell>
                    <TableCell className="text-slate-600 font-medium max-w-xs truncate">{loan.description}</TableCell>
                    <TableCell className="font-black text-blue-700">Rs. {loan.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">Active</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="font-bold border-slate-300 text-slate-600"><FileText className="h-4 w-4 mr-2"/>Inspect</Button>
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
