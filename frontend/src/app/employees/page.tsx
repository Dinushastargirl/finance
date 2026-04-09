'use client';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Briefcase, UserPlus, ShieldAlert, Trash2 } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"

export default function EmployeesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [branchId, setBranchId] = useState('');

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ email, password, firstName, branchId, role: 'TELLER' })
      });
      if (res.ok) {
        setIsOpen(false);
        fetchEmployees();
      }
    } catch(err) {
      console.error("Failed to create", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you heavily certain you want to purge this operative?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEmployees();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-emerald-50 text-emerald-900 border border-emerald-200 p-6 rounded-xl shadow-sm">
        <div className="flex gap-4 items-center">
          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center border-4 border-emerald-100">
            <ShieldAlert className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Staff Operations Directory</h1>
            <p className="font-medium text-emerald-700">Strictly Head Office Level 5 Clearances. Branch assignments.</p>
          </div>
        </div>
        
        <Button onClick={() => setIsOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 shadow-md border border-emerald-700">
          <UserPlus className="h-4 w-4" /> Enlist Teller
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-black text-xl"><Briefcase className="h-5 w-5 text-emerald-600"/> Commission Employee</DialogTitle>
              <DialogDescription className="font-bold text-slate-500">
                Grant branch access by generating cryptographic credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-bold">Access Email / UID</Label>
                <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="branch.new@rupasinghe.com" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Assigned Node Name</Label>
                <Input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="E.g. Maharagama Office" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold">Branch ID String</Label>
                  <Input value={branchId} onChange={e=>setBranchId(e.target.value)} placeholder="MRG" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-rose-600">Local Password</Label>
                  <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full h-12 text-lg">Spawn Account Authorization</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="font-bold text-slate-800">Assigned Branch (ID)</TableHead>
              <TableHead className="font-bold text-slate-800">Email Reference</TableHead>
              <TableHead className="font-bold text-slate-800">Role Authority</TableHead>
              <TableHead className="text-right font-bold text-slate-800">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                 <TableCell colSpan={4} className="h-40 text-center font-bold text-slate-400">Syncing Cryptographic Register...</TableCell>
              </TableRow>
            ) : employees.map((emp) => (
              <TableRow key={emp.id} className="hover:bg-slate-50">
                <TableCell className="font-black text-slate-800">
                  {emp.firstName} {emp.branchId && <span className="text-sm bg-blue-100 text-blue-800 ml-2 px-2 py-0.5 rounded-full">{emp.branchId}</span>}
                </TableCell>
                <TableCell className="font-medium text-slate-600">{emp.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${emp.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {emp.role}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {emp.role !== 'ADMIN' && (
                    <Button variant="ghost" onClick={() => handleDelete(emp.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 h-8">
                      <Trash2 className="h-4 w-4" /> &nbsp; Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
