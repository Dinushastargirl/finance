'use client';

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, Search, FileText, Package, TrendingUp, AlertTriangle,
  Pencil, Trash2, RefreshCcw, Sparkles, Filter, UserCheck
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const BRANCHES = [
  { id: 'ALL', name: 'All Branches' },
  { id: 'BRL', name: 'Borella' },
  { id: 'DHW', name: 'Dehiwala' },
  { id: 'DMT', name: 'Dematagoda' },
  { id: 'HMG', name: 'Homagama' },
  { id: 'KDW', name: 'Kadawatha' },
  { id: 'KIR', name: 'Kiribathgoda' },
  { id: 'KOT', name: 'Kotikawatta' },
  { id: 'KTW', name: 'Kottawa' },
  { id: 'MRG', name: 'Maharagama' },
  { id: 'PND', name: 'Panadura' },
  { id: 'WAT', name: 'Wattala' },
  { id: 'HQ',  name: 'Head Office' },
];

export default function PawnesPage() {
  const [isOpen, setIsOpen]       = useState(false);
  const [pawns, setPawns]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [search, setSearch]       = useState('');
  const [editingPawn, setEditingPawn] = useState<any>(null);

  // User context
  const [branchId, setBranchId]       = useState('');
  const [userId, setUserId]           = useState('');
  const [userRole, setUserRole]       = useState('TELLER');

  // Admin branch filter
  const [filterBranch, setFilterBranch] = useState('ALL');

  // Form state
  const [clientId, setClientId]         = useState('');
  const [description, setDescription]   = useState('');
  const [appraisal, setAppraisal]       = useState('');
  const [amount, setAmount]             = useState('');

  // Client lookup map: { nationalId/id -> "First Last" }
  const [clientsMap, setClientsMap]     = useState<Record<string, string>>({});
  const [resolvedName, setResolvedName] = useState('');

  const loadUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setBranchId(u.branchId || '');
      setUserId(u.id || '');
      setUserRole(u.role || 'TELLER');
      return u;
    }
    return null;
  };

  // Build a map of { nationalId -> "First Last", id -> "First Last" } for fast lookups
  const loadClients = async (u?: any) => {
    try {
      const user = u || JSON.parse(localStorage.getItem('user') || '{}');
      const res = await fetch(`/api/clients?branchId=${user?.branchId || ''}&role=${user?.role || ''}`);
      if (res.ok) {
        const data: any[] = await res.json();
        const map: Record<string, string> = {};
        data.forEach(c => {
          const name = `${c.firstName || c.first_name || ''} ${c.lastName || c.last_name || ''}`.trim();
          if (c.nationalId || c.national_id) map[(c.nationalId || c.national_id).toLowerCase()] = name;
          if (c.id) map[c.id.toLowerCase()] = name;
        });
        setClientsMap(map);
      }
    } catch (e) { console.error('Failed to load clients map', e); }
  };

  const loadPawns = async (u?: any) => {
    try {
      const user = u || loadUser();
      const params = new URLSearchParams({
        branchId: user?.branchId || branchId,
        role: user?.role || userRole,
        filterBranch,
      });
      const res = await fetch(`/api/pawns?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPawns(data);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to load pawn tickets');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = loadUser();
    loadPawns(u);
    loadClients(u);
  }, []);

  // Reload when admin changes branch filter
  useEffect(() => {
    if (userRole === 'ADMIN') loadPawns();
  }, [filterBranch]);

  // Resolve customer name when NIC/ID is typed
  const handleClientIdChange = (val: string) => {
    setClientId(val);
    const name = clientsMap[val.toLowerCase().trim()];
    setResolvedName(name || '');
  };

  const resetForm = () => {
    setClientId(''); setDescription(''); setAppraisal(''); setAmount('');
    setEditingPawn(null); setResolvedName('');
  };

  const openAdd = () => { resetForm(); setIsOpen(true); };

  const openEdit = (pawn: any) => {
    setEditingPawn(pawn);
    const cid = pawn.client_id || '';
    setClientId(cid);
    setResolvedName(clientsMap[cid.toLowerCase()] || '');
    setDescription(pawn.description || '');
    setAppraisal(String(pawn.appraised_value || ''));
    setAmount(String(pawn.disbursed_amount || ''));
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!clientId || !description || !amount) {
      toast.error('Missing required fields', { description: 'Please fill in Customer ID, Description, and Disbursed Amount.' });
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading(editingPawn ? 'Updating pawn ticket...' : 'Creating pawn ticket...');

    try {
      const url    = editingPawn ? `/api/pawns/${editingPawn.id}` : '/api/pawns';
      const method = editingPawn ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          description,
          appraisedValue: appraisal,
          disbursedAmount: amount,
          branchId,
          createdByUserId: userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success(editingPawn ? 'Pawn ticket updated!' : 'Pawn ticket created!', { id: toastId });
      setIsOpen(false);
      resetForm();
      loadPawns();
    } catch (err: any) {
      toast.error('Error saving ticket', { description: err.message, id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (pawn: any) => {
    if (!confirm(`Delete pawn ticket for "${pawn.description}"?`)) return;
    const toastId = toast.loading('Deleting pawn ticket...');
    try {
      const res = await fetch(`/api/pawns/${pawn.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Pawn ticket deleted', { id: toastId });
      loadPawns();
    } catch (err) {
      toast.error('Could not delete ticket', { id: toastId });
    }
  };

  const totalDisbursed = pawns.reduce((s, p) => s + (p.disbursed_amount || 0), 0);
  const filtered = pawns.filter(p =>
    p.client_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center glass p-8 rounded-2xl border-white/40 shadow-2xl gap-6">
        <div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-3 px-3 py-0.5 font-black uppercase tracking-widest text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" /> Pawn Tickets
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
            Active <span className="text-gradient">Pawnes</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Record pawned collateral and assign capital to registered clients.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Admin Branch Filter */}
          {userRole === 'ADMIN' && (
            <Select value={filterBranch} onValueChange={(v) => v && setFilterBranch(v)}>
              <SelectTrigger className="h-14 w-48 bg-white/70 border-white/40 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg">
                <Filter className="w-3 h-3 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/40 rounded-2xl shadow-2xl">
                {BRANCHES.map(b => (
                  <SelectItem key={b.id} value={b.id} className="font-bold text-[11px] uppercase tracking-widest">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={openAdd}
            className="gap-2 bg-primary hover:bg-primary/90 h-14 px-8 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 card-hover w-full md:w-auto shrink-0 rounded-2xl"
          >
            <Plus className="h-4 w-4" /> Originate Pawn
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-[460px] glass border-white/40 p-0 overflow-hidden rounded-[2rem]">
          <div className="h-2 bg-primary" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                {editingPawn ? 'Edit Pawn Ticket' : 'Originate New Pawn'}
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                {editingPawn ? 'Update the pawn ticket details below.' : 'Record a new pawned item and process the principal disbursement.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Customer ID or NIC</Label>
                <Input
                  value={clientId}
                  onChange={e => handleClientIdChange(e.target.value)}
                  placeholder="Search customer database..."
                  className="h-12 bg-white/50 rounded-xl"
                />
                {resolvedName && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-black text-sm">{resolvedName}</span>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Pawn Item Description</Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="E.g., 22k Gold Chain, 18g"
                  className="h-12 bg-white/50 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Appraised Value (Rs.)</Label>
                  <Input
                    value={appraisal}
                    onChange={e => setAppraisal(e.target.value)}
                    type="number"
                    placeholder="100000"
                    className="h-12 bg-white/50 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Disbursed Amount (Rs.)</Label>
                  <Input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    type="number"
                    placeholder="85000"
                    className="h-12 bg-blue-50 border-blue-300 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" className="font-bold text-slate-500 h-12 rounded-xl" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                disabled={isSaving}
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20 gap-2"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : (editingPawn ? 'Update Ticket' : 'Finalize & Disburse')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Active Pawn Items',  value: loading ? '—' : pawns.length.toString(),                       icon: Package,       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
          { label: 'Capital Disbursed',  value: loading ? '—' : `Rs. ${totalDisbursed.toLocaleString()}`,      icon: TrendingUp,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Items in Arrears',   value: '0',                                                            icon: AlertTriangle, color: 'text-rose-600',    bg: 'bg-rose-50' },
        ].map(s => (
          <Card key={s.label} className="glass border-white/50 shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-8 flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} shrink-0`}>
                <s.icon className={`h-7 w-7 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-3xl font-black tracking-tighter leading-none ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by Ticket ID, Client, or Description..."
          className="pl-12 h-14 bg-white/50 border-white/40 glass focus:ring-primary shadow-lg rounded-2xl"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="glass border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white/40">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Ticket #</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Customer ID</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Item Description</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Appraised</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Disbursed</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
              <TableHead className="px-8 py-5" />
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {loading ? (
              <TableRow><TableCell colSpan={8} className="h-64 text-center font-black text-slate-300 animate-pulse tracking-widest uppercase">Loading pawn registry...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <FileText className="h-12 w-12 text-slate-200" />
                    <p className="text-slate-400 font-bold">{search ? 'No matching pawn items found.' : "No active pawn items. Click 'Originate Pawn' to begin."}</p>
                    {!search && (
                      <Button variant="outline" onClick={openAdd} className="border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest h-12 rounded-xl hover:bg-primary hover:text-white transition-all px-8">
                        Create First Ticket
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(pawn => (
                <TableRow key={pawn.id} className="group hover:bg-primary/5 transition-all duration-300">
                  <TableCell className="px-8 py-5 font-black text-slate-500 text-[11px] tracking-widest">
                    #{pawn.id?.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm">
                        {pawn.client_id || '—'}
                      </span>
                      {clientsMap[pawn.client_id?.toLowerCase()] && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3" />
                          {clientsMap[pawn.client_id?.toLowerCase()]}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 font-bold text-slate-700 max-w-[200px] truncate">
                    {pawn.description}
                  </TableCell>
                  <TableCell className="px-8 py-5 font-bold text-amber-700">
                    Rs. {(pawn.appraised_value || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-8 py-5 font-black text-blue-700 text-lg tracking-tighter">
                    Rs. {(pawn.disbursed_amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[9px] uppercase tracking-widest px-3">
                      {pawn.status || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    {pawn.created_at ? new Date(pawn.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(pawn)}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pawn)}
                        className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
