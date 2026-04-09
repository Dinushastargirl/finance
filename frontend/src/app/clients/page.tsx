'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Plus, Search, UserPlus, Sparkles, Filter, MoreVertical, RefreshCcw, 
  Pencil, Trash2, ShieldCheck, UserCog 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function ClientsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [nic, setNic] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [branchId, setBranchId] = useState('');
  const [userId, setUserId] = useState('');
  const [editingClient, setEditingClient] = useState<any>(null);

  const loadClients = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setBranchId(user.branchId || 'HQ');
        setUserId(user.id || '');
      }

      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch(err) {
      console.error(err);
      toast.error("Failed to load customer directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSave = async () => {
    if (!nic || !firstName || !lastName) {
      toast.error("Missing Information", {
        description: "NIC, First Name, and Last Name are required."
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(editingClient ? "Updating customer profile..." : "Saving customer profile...");

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nic, 
          firstName, 
          lastName, 
          phone, 
          branchId, 
          createdByUserId: userId 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      toast.success(editingClient ? "Customer updated successfully!" : "Customer saved successfully!", { id: toastId });
      
      setIsOpen(false);
      setEditingClient(null);
      setNic(''); setFirstName(''); setLastName(''); setPhone('');
      await loadClients();
    } catch(err: any) {
      console.error(err);
      toast.error("Error saving customer", {
        description: err.message || "Please check your network connection.",
        id: toastId
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (client: any) => {
    setEditingClient(client);
    setNic(client.nationalId || '');
    setFirstName(client.firstName || '');
    setLastName(client.lastName || '');
    setPhone(client.phone || '');
    setIsOpen(true);
  };

  const handleDelete = async (client: any) => {
    if (!confirm(`Are you sure you want to remove ${client.firstName} ${client.lastName}?`)) return;

    const toastId = toast.loading("Deleting customer...");
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Customer removed successfully", { id: toastId });
      loadClients();
    } catch (err) {
      toast.error("Could not delete customer", { id: toastId });
    }
  };

  const filteredClients = clients.filter(client => 
    client.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.nationalId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass p-8 rounded-2xl border-white/40 shadow-2xl gap-6">
        <div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-0.5 font-black uppercase tracking-widest text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" /> Customer List
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">Our <span className="text-gradient">Customers</span></h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage all customer information for this branch.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 h-14 px-8 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 card-hover w-full md:w-auto shrink-0 transition-all">
          <UserPlus className="h-4 w-4" /> Add New Customer
        </Button>
      </div>

      {/* New Customer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] glass border-white/40 p-0 overflow-hidden rounded-[2rem]">
          <div className="h-2 bg-primary" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                 {editingClient ? <UserCog className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6 text-primary" />}
                 {editingClient ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                {editingClient ? "Update current customer information." : "Enter name and details to create a new customer profile."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nic" className="font-black text-[10px] uppercase tracking-widest text-slate-400">NIC Number</Label>
                <Input value={nic} onChange={e=>setNic(e.target.value)} id="nic" placeholder="e.g. 941234567V" className="h-12 bg-white/50 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName" className="font-black text-[10px] uppercase tracking-widest text-slate-400">First Name</Label>
                  <Input value={firstName} onChange={e=>setFirstName(e.target.value)} id="firstName" placeholder="Saman" className="h-12 bg-white/50 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Last Name</Label>
                  <Input value={lastName} onChange={e=>setLastName(e.target.value)} id="lastName" placeholder="Kumara" className="h-12 bg-white/50 rounded-xl" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="font-black text-[10px] uppercase tracking-widest text-slate-400">Phone Number</Label>
                <Input value={phone} onChange={e=>setPhone(e.target.value)} id="phone" placeholder="077 123 4567" className="h-12 bg-white/50 rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" className="font-bold text-slate-500 h-12 rounded-xl" onClick={() => { setIsOpen(false); setEditingClient(null); }}>Cancel</Button>
              <Button 
                disabled={isSaving}
                onClick={handleSave} 
                className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20 gap-2"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? "Saving..." : "Save Customer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Directory Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by Name or NIC..." 
            className="pl-12 h-14 bg-white/50 border-white/40 glass focus:ring-primary shadow-lg shadow-slate-200/50 rounded-2xl" 
          />
        </div>
        <Button variant="outline" className="h-14 px-6 border-white/40 glass font-black text-[10px] uppercase tracking-widest text-slate-500 gap-2 rounded-2xl">
           <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Table Section */}
      <div className="glass border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col bg-white/40">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">NIC Number</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Customer Name</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Joined Date</TableHead>
              <TableHead className="px-8 py-5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {loading ? (
               <TableRow><TableCell colSpan={5} className="h-64 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Initializing directory metadata...</TableCell></TableRow>
            ) : filteredClients.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-64 text-center">
                    <p className="text-slate-400 font-bold mb-4">No customer fingerprints detected.</p>
                    <Button variant="outline" onClick={() => setIsOpen(true)} className="border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest h-12 rounded-xl hover:bg-primary hover:text-white transition-all px-8">Generate First Entry</Button>
                 </TableCell>
               </TableRow>
            ) : (
              filteredClients.map((client) => (
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
                  <TableCell className="px-8 py-6 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary hover:bg-primary/10 transition-all h-10 w-10 rounded-xl">
                           <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 glass p-2 rounded-2xl border-white/40 shadow-2xl">
                        <DropdownMenuLabel className="px-4 py-2 font-black text-[9px] uppercase tracking-widest text-slate-400">Operations</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100/50" />
                        <DropdownMenuItem onClick={() => openEditDialog(client)} className="gap-3 px-4 py-3 rounded-xl font-bold text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                          <Pencil className="w-4 h-4" /> Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(client)} className="gap-3 px-4 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" /> Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
