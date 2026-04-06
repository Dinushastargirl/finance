'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, UserPlus } from "lucide-react"

export default function ClientsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [nic, setNic] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setClients(await res.json());
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('http://localhost:8080/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nationalId: nic, firstName, lastName, phone })
      });
      if (res.ok) {
        setIsOpen(false);
        setNic(''); setFirstName(''); setLastName(''); setPhone('');
        loadClients();
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Clients Management</h1>
          <p className="text-slate-500 font-medium">Record and track branch customer interactions.</p>
        </div>
        
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 h-10 px-4 text-white">
          <Plus className="h-4 w-4" /> New Customer
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-blue-600"/> Register Customer</DialogTitle>
              <DialogDescription>
                Add a new customer profile to this branch.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nic" className="font-bold">National Identity Card (NIC)</Label>
                <Input value={nic} onChange={e=>setNic(e.target.value)} id="nic" placeholder="e.g. 941234567V" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="font-bold">First Name</Label>
                  <Input value={firstName} onChange={e=>setFirstName(e.target.value)} id="firstName" placeholder="Saman" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="font-bold">Last Name</Label>
                  <Input value={lastName} onChange={e=>setLastName(e.target.value)} id="lastName" placeholder="Kumara" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                <Input value={phone} onChange={e=>setPhone(e.target.value)} id="phone" placeholder="077 123 4567" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Save Customer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients by Name or NIC..." className="pl-8 bg-white border-slate-200" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold">Customer NIC</TableHead>
              <TableHead className="font-bold">Full Name</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Registered</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="h-64 text-center font-bold text-slate-400">Loading directory...</TableCell></TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center text-slate-400 font-medium">
                  No customers found. Click "New Customer" to begin recording.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-black text-slate-900">{client.nationalId || 'N/A'}</TableCell>
                  <TableCell className="font-bold text-slate-700">{client.firstName} {client.lastName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {client.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
