'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserCircle, Pencil, Lock, Camera, Building2, Mail, Phone, User } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');

  // Password form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError]     = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFirstName(parsed.firstName || '');
      setLastName(parsed.lastName || '');
      setPhone(parsed.phone || '');
      setEmail(parsed.email || '');
    }
    const avatar = localStorage.getItem('avatar');
    if (avatar) setAvatarPreview(avatar);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      localStorage.setItem('avatar', dataUrl); // persist avatar locally
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userId = user?.id;
      const res = await fetch(`http://localhost:8080/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ firstName, lastName, phone, email })
      });
      if (res.ok) {
        const updated = { ...user, firstName, lastName, phone, email };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setIsEditOpen(false);
      }
    } catch (err) {
      // Optimistic update even if backend fails (in-memory mode)
      const updated = { ...user, firstName, lastName, phone, email };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setIsEditOpen(false);
    }
  };

  const handleSavePassword = async () => {
    setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError("New passwords do not match!"); return; }
    if (newPwd.length < 6) { setPwdError("Password must be at least 6 characters."); return; }
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`http://localhost:8080/users/${user?.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
    } catch(_) {}
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setIsPasswordOpen(false);
  };

  const initials = user ? `${(user.firstName || 'U')[0]}${(user.lastName || '?')[0]}`.toUpperCase() : '??';

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium">Manage your account details and security credentials.</p>
        </div>
        <Button onClick={() => setIsEditOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-5">
          <Pencil className="h-4 w-4" /> Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover gradient */}
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="px-8 pb-8 -mt-12">
          {/* Avatar */}
          <div className="relative inline-block">
            <div className="h-24 w-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-blue-600">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-2xl font-black text-slate-800">{user?.firstName} {user?.lastName}</h2>
            <p className="text-slate-500 font-bold text-sm flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {user?.role === 'ADMIN' ? 'Head Office — Super Administrator' : `${user?.branchId} Branch — Teller`}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="font-bold text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400"/>{user?.email || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
              <p className="font-bold text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400"/>{user?.phone || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Branch ID</p>
              <p className="font-bold text-slate-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400"/>{user?.branchId || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</p>
              <p className="font-bold text-slate-700 flex items-center gap-2"><User className="h-4 w-4 text-slate-400"/>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black border ${user?.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {user?.role}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button onClick={() => setIsPasswordOpen(true)} variant="outline" className="gap-2 font-bold border-slate-300 text-slate-700 hover:bg-slate-50">
              <Lock className="h-4 w-4" /> Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black"><Pencil className="h-5 w-5 text-blue-600"/>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal details. Changes are saved immediately.</DialogDescription>
          </DialogHeader>

          {/* Avatar picker inside modal */}
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-slate-200 shadow overflow-hidden flex items-center justify-center">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-blue-600">{initials}</span>}
              </div>
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium">Click the camera icon to upload a new photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">First Name</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Last Name</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Email Address</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="077 123 4567" />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Dialog ── */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black"><Lock className="h-5 w-5 text-amber-600"/>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="font-bold">Current Password</Label>
              <Input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">New Password</Label>
              <Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Confirm New Password</Label>
              <Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {pwdError && <p className="text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg">{pwdError}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePassword} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
