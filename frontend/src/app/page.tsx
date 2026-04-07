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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Today's Overview</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">{user?.branchName} Branch — {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {isClosed ? (
            <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-rose-200">
              <Lock className="h-4 w-4" /> Day Closed (Frozen)
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 border border-emerald-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Branch Open
            </div>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/dashboard/executive" className="w-full md:w-auto">
              <Button variant="outline" className="font-semibold gap-2 w-full md:w-auto border-slate-300">
                <ShieldCheck className="h-4 w-4" /> HQ Executive View
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Real-time Vault Card */}
        <Card className="bg-white border-slate-200 overflow-hidden relative shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Money-on-Hand (Vault)</CardTitle>
            <Wallet className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              Rs. {vault?.balance?.toLocaleString() || '0'}
            </div>
            <p className="text-xs font-medium text-slate-400 mt-1">Live Branch Balance</p>
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Landmark className="h-16 w-16" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Transactions</CardTitle>
            <Banknote className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{eod?.snapshot?.transactionCount || '0'}</div>
            <p className="text-xs font-medium text-slate-400 mt-1">Volume since opening</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Pawn Items</CardTitle>
            <Package className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">24</div>
            <p className="text-xs font-medium text-slate-400 mt-1">In-Branch Storage</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Payments</CardTitle>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 tracking-tight">0</div>
            <p className="text-xs font-medium text-slate-400 mt-1">Portfolio at risk</p>
          </CardContent>
        </Card>
      </div>

      {!isClosed && (
        <div className="bg-white border-l-4 border-l-emerald-500 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="bg-emerald-50 p-2 rounded-full text-emerald-600 shrink-0">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Operational Discipline Required</p>
              <p className="text-sm text-slate-500 mt-0.5">Please ensure the vault balance matches your physical till before EOD closing.</p>
            </div>
          </div>
          <Link href="/operations/eod" className="w-full md:w-auto mt-2 md:mt-0">
            <Button className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              Process EOD Close <ArrowRight className="h-4 w-4 ml-2" />
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


