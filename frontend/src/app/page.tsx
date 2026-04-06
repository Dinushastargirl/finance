'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Banknote, Package, AlertCircle, Database, Wallet, ShieldCheck, Lock, ArrowRight, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [vault, setVault] = useState<any>(null);
  const [eod, setEod] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    loadBranchData();
  }, []);

  const loadBranchData = async () => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      const token = localStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [vRes, eRes] = await Promise.all([
        fetch(`http://localhost:8080/vault/${u.branchId}`, { headers }),
        fetch(`http://localhost:8080/eod/status`, { headers })
      ]);

      if (vRes.ok) setVault(await vRes.json());
      if (eRes.ok) setEod(await eRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isClosed = eod?.status === 'CLOSED';

  return (
    <div className="space-y-8">
      {/* Header with EOD status */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Today's Overview</h1>
          <p className="text-slate-500 font-bold">{user?.branchName} Branch — {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-4 items-center">
          {isClosed ? (
            <div className="bg-rose-100 text-rose-800 px-4 py-2 rounded-lg font-black flex items-center gap-2 border border-rose-200">
              <Lock className="h-4 w-4" /> DAY CLOSED (FROZEN)
            </div>
          ) : (
            <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-black flex items-center gap-2 border border-emerald-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> BRANCH OPEN
            </div>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/dashboard/executive">
              <Button className="bg-slate-900 hover:bg-slate-800 font-bold gap-2">
                <ShieldCheck className="h-4 w-4" /> HQ Executive View
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Real-time Vault Card */}
        <Card className="hover:shadow-lg transition-all bg-white border-slate-200 border-b-4 border-b-emerald-500 overflow-hidden relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Money-on-Hand (Vault)</CardTitle>
            <Wallet className="h-6 w-6 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              Rs. {vault?.balance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Live Branch Balance</p>
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Landmark className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Today's Transactions</CardTitle>
            <Banknote className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{eod?.snapshot?.transactionCount || '0'}</div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Volume since opening</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Active Pawn Items</CardTitle>
            <Package className="h-6 w-6 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">24</div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">In-Branch Storage</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow bg-white border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-wider">Due Payments</CardTitle>
            <AlertCircle className="h-6 w-6 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600 tracking-tighter">0</div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Portfolio at risk</p>
          </CardContent>
        </Card>
      </div>

      {!isClosed && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="bg-emerald-600 p-3 rounded-full text-white">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-slate-800">Operational Discipline Required</p>
              <p className="text-sm text-slate-600 font-medium">Please ensure the vault balance matches your physical till before EOD closing.</p>
            </div>
          </div>
          <Link href="/operations/eod">
            <Button className="bg-emerald-700 hover:bg-emerald-800 font-bold gap-2">
              Process EOD Close <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-7 bg-white border-slate-200 shadow-sm min-h-[300px]">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-bold text-slate-800">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pt-16 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <Database className="h-16 w-16 opacity-30" />
            <p className="font-medium text-lg">No transactions recorded yet today.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


