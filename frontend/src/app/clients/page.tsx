'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, UserPlus, Sparkles, Filter, MoreVertical } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

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
      const { data, error } = await supabase.from('client').select('*').order('createdAt', { ascending: false });
      if (error) {
        throw error;
      }
      if (data) {
        setClients(data);
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
      const { error } = await supabase.from('client').insert([{
        nationalId: nic,
        firstName,
        lastName,
        phone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }]);
      if (error) {
        throw error;
      }
      setIsOpen(false);
      setNic(''); setFirstName(''); setLastName(''); setPhone('');
      loadClients();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass p-8 rounded-2xl border-white/40 shadow-2xl gap-6">
        <div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-0.5 font-black uppercase tracking-widest text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" /> CRM Directory
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">Clients <span className="text-gradient">Portfolio</span></h1>
          <p className="text-slate-500 font-medium tracking-tight">Enterprise-grade record keeping for all branch customer interactions.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 h-14 px-8 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 card-hover w-full md:w-auto shrink-0 transition-all">
          <UserPlus className="h-4 w-4" /> Onboard New Customer
        </Button>
      </div>

      {/* New Customer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] glass border-white/40 p-0 overflow-hidden">
          <div className="h-2 bg-primary" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                 Register Entity
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Generate a fresh customer profile protocol. All fields required for KYC.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nic" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Identity Manifest (NIC)</Label>
                <Input value={nic} onChange={e=>setNic(e.target.value)} id="nic" placeholder="e.g. 941234567V" className="h-12 bg-white/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Legal First Name</Label>
                  <Input value={firstName} onChange={e=>setFirstName(e.target.value)} id="firstName" placeholder="Saman" className="h-12 bg-white/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Legal Last Name</Label>
                  <Input value={lastName} onChange={e=>setLastName(e.target.value)} id="lastName" placeholder="Kumara" className="h-12 bg-white/50" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Communication Node</Label>
                <Input value={phone} onChange={e=>setPhone(e.target.value)} id="phone" placeholder="077 123 4567" className="h-12 bg-white/50" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" className="font-bold text-slate-500" onClick={() => setIsOpen(false)}>Abort</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white font-black px-6 shadow-lg shadow-primary/20">Authorize & Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Directory Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search records by Name or NIC..." className="pl-12 h-14 bg-white/50 border-white/40 glass focus:ring-primary shadow-lg shadow-slate-200/50" />
        </div>
        <Button variant="outline" className="h-14 px-6 border-white/40 glass font-black text-[10px] uppercase tracking-widest text-slate-500 gap-2">
           <Filter className="w-4 h-4" /> Filter Protocols
        </Button>
      </div>

      <div className="glass border-white/40 rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col bg-white/40">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Unique Identity</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Entity Representation</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Creation Date</TableHead>
              <TableHead className="px-8 py-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {loading ? (
               <TableRow><TableCell colSpan={5} className="h-64 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Initializing directory metadata...</TableCell></TableRow>
            ) : clients.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-64 text-center">
                    <p className="text-slate-400 font-bold mb-4">No customer fingerprints detected.</p>
                    <Button variant="outline" onClick={() => setIsOpen(true)} className="border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest">Generate First Entry</Button>
                 </TableCell>
               </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="group hover:bg-primary/5 transition-all duration-300">
                  <TableCell className="px-8 py-6 font-black text-slate-900 group-hover:text-primary transition-colors underline decoration-primary/10 underline-offset-4">{client.nationalId || 'N/A'}</TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-bold text-slate-800 leading-none mb-1">{client.firstName} {client.lastName}</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[9px] uppercase tracking-widest px-3">
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-slate-500 font-bold text-xs uppercase tracking-widest">{new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-slate-600 transition-colors">
                       <MoreVertical className="w-4 h-4" />
                    </Button>
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
