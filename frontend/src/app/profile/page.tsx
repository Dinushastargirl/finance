'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCircle, 
  Pencil, 
  Camera, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      
      const parsedUser = JSON.parse(storedUser);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', parsedUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          email: data.email || ''
        });
        
        // Sync back to localStorage to keep things updated
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...data }));
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUpdating(true);
    const toastId = toast.loading('Uploading photo...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          throw new Error('Storage bucket "avatars" not found. Please create it in Supabase.');
        }
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Update local state
      setUser({ ...user, avatar_url: publicUrl });
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar_url: publicUrl }));

      toast.success('Profile picture updated successfully!', { id: toastId });
      
      // Force sidebar refresh (optional but recommended)
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    const toastId = toast.loading('Saving profile changes...');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ 
        ...user, 
        first_name: formData.first_name, 
        last_name: formData.last_name, 
        phone: formData.phone 
      });

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ 
        ...storedUser, 
        firstName: formData.first_name, // keep compatibility with existing code
        lastName: formData.last_name,
        firstName_db: formData.first_name,
        lastName_db: formData.last_name,
        phone: formData.phone 
      }));

      toast.success('Profile updated successfully!', { id: toastId });
      setIsEditMode(false);
      
      // Force sidebar refresh
      window.dispatchEvent(new Event('storage'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to save profile changes', { id: toastId });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Profile...</p>
      </div>
    );
  }

  const initials = `${(user?.first_name || 'U')[0]}${(user?.last_name || '?')[0]}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" richColors />
      
      {/* Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Avatar Section */}
            <div className="relative">
              <div className="h-32 w-32 rounded-[2.5rem] bg-slate-900 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-500 ring-4 ring-primary/5">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-white tracking-tighter">{initials}</span>
                )}
                {updating && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={updating}
                className="absolute -bottom-2 -right-2 bg-primary hover:bg-primary/90 text-white rounded-2xl p-3 shadow-xl shadow-primary/40 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Complete Your Profile'}
                </h1>
                <Badge className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-0",
                  user?.role === 'ADMIN' ? "bg-purple-100 text-purple-700 shadow-sm" : "bg-blue-100 text-blue-700 shadow-sm"
                )}>
                  {user?.role || 'Staff'}
                </Badge>
              </div>
              
              <div className="flex flex-col gap-1 text-slate-500 font-bold text-sm">
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4 text-primary" />
                  {user?.email}
                </p>
                <p className="flex items-center gap-2 justify-center md:justify-start">
                  <Building2 className="h-4 w-4 text-primary" />
                  {user?.branch_name || 'All Branches'} ({user?.branch_id || 'HQ'})
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!isEditMode ? (
              <Button 
                onClick={() => setIsEditMode(true)}
                className="rounded-2xl px-6 h-12 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl transition-all active:scale-95"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  className="rounded-2xl px-6 h-12 font-black border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updating}
                  className="rounded-2xl px-8 h-12 gap-2 bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight uppercase text-slate-900">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription className="font-bold text-slate-400">Keep your contact details up to date for better communication.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</Label>
                  <div className="relative group">
                    <Input 
                      disabled={!isEditMode || updating}
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="rounded-2xl h-14 bg-slate-50 border-slate-100 font-bold focus:bg-white transition-all group-hover:border-primary/30"
                      placeholder="Enter your first name"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</Label>
                  <div className="relative group">
                    <Input 
                      disabled={!isEditMode || updating}
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="rounded-2xl h-14 bg-slate-50 border-slate-100 font-bold focus:bg-white transition-all group-hover:border-primary/30"
                      placeholder="Enter your last name"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</Label>
                  <div className="relative group">
                    <Input 
                      disabled={!isEditMode || updating}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-2xl h-14 bg-slate-50 border-slate-100 font-bold focus:bg-white transition-all group-hover:border-primary/30"
                      placeholder="07X XXX XXXX"
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email (Read-only)</Label>
                  <div className="relative group opacity-60 cursor-not-allowed">
                    <Input 
                      disabled
                      value={formData.email}
                      className="rounded-2xl h-14 bg-slate-50 border-slate-100 font-bold"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Stats */}
        <div className="space-y-8">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="h-20 w-20 rounded-[1.5rem] bg-primary/10 flex items-center justify-center animate-bounce duration-[3000ms]">
                <AlertCircle className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Need Help?</h3>
                <p className="text-slate-400 font-bold text-sm px-4">
                  For account issues, branch permissions, or technical support, contact our IT department.
                </p>
              </div>
              <Button 
                onClick={() => {
                  toast.info(
                    <div className="flex flex-col gap-1">
                      <p className="font-black text-slate-900">Vork.Global Support</p>
                      <p className="text-primary font-bold text-lg">0775088850</p>
                    </div>,
                    { duration: 10000 }
                  );
                }}
                variant="outline" 
                className="w-full rounded-2xl h-14 font-black border-primary/20 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 group shadow-lg shadow-primary/5"
              >
                Contact IT Support
                <Phone className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
