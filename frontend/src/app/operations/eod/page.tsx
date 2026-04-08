'use client';

import { useState } from "react";
import { CheckCircle2, AlertCircle, Clock, Save, Lock, DivideCircle as Divider, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EndOfDayPage() {
  const [step, setStep] = useState(1);
  const [cashCount, setCashCount] = useState<any>({
    "5000": 0, "1000": 0, "500": 0, "100": 0, "50": 0, "20": 0
  });
  
  // Hardcoded for demo/UI matching purposes
  const systemExpected = 458900; 

  const calculateTotal = () => {
    return Object.entries(cashCount).reduce((sum, [denom, count]: any) => {
      return sum + (parseInt(denom) * (parseInt(count) || 0));
    }, 0);
  };

  const actualTotal = calculateTotal();
  const difference = actualTotal - systemExpected;
  const isBalanced = difference === 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">End of Day Reconciliation</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Perform mandated physical cash counting and lock the branch ledger for {new Date().toLocaleDateString()}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Physical Cash Count */}
          <div className={`bg-white rounded-xl border ${step === 1 ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-200 opacity-50'} overflow-hidden`}>
             <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-4 items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                <div>
                   <h2 className="font-bold text-slate-800">Physical Vault Count</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Declare all physical denominations</p>
                </div>
             </div>
             
             {step === 1 && (
               <div className="p-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                     {[5000, 1000, 500, 100, 50, 20].map((denom) => (
                       <div key={denom} className="flex justify-between items-center gap-4">
                          <span className="font-black text-slate-700 w-16 text-right">Rs. {denom}</span>
                          <span className="text-slate-300 font-black">X</span>
                          <Input 
                            type="number" 
                            className="w-24 text-center font-bold" 
                            value={cashCount[denom]} 
                            onChange={e => setCashCount({...cashCount, [denom]: e.target.value})} 
                          />
                          <span className="font-black text-emerald-600 w-24 text-right">
                             = Rs. {(denom * (cashCount[denom] || 0)).toLocaleString()}
                          </span>
                       </div>
                     ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Counted</p>
                        <p className="text-3xl font-black text-slate-900">Rs. {actualTotal.toLocaleString()}</p>
                     </div>
                     <Button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8">Link to System Ledger</Button>
                  </div>
               </div>
             )}
          </div>

          {/* Step 2: System Reconciliation */}
          <div className={`bg-white rounded-xl border ${step === 2 ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 opacity-50'} overflow-hidden`}>
             <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-4 items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                <div>
                   <h2 className="font-bold text-slate-800">System Reconciliation</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Match physical count with digital ledger</p>
                </div>
             </div>
             
             {step === 2 && (
               <div className="p-6">
                 <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Expected By Ledger</p>
                       <p className="text-2xl font-black text-slate-800">Rs. {systemExpected.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Physical Reality</p>
                       <p className="text-2xl font-black text-blue-600">Rs. {actualTotal.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className={`mt-6 p-6 rounded-xl flex items-center gap-4 border ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {isBalanced ? <CheckCircle2 className="w-8 h-8"/> : <ShieldAlert className="w-8 h-8 text-rose-600" />}
                    <div>
                       <h3 className="font-black text-lg">{isBalanced ? "Perfectly Balanced Vault" : "Discrepancy Detected!"}</h3>
                       <p className="font-medium text-sm mt-1">
                         {isBalanced 
                           ? "Your physical cash matches the digital ledger identically." 
                           : `Variance of Rs. ${Math.abs(difference).toLocaleString()}. You must authorize an override to close the branch.`
                         }
                       </p>
                    </div>
                 </div>

                 <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)} className="font-bold">Back to Recount</Button>
                    <Button onClick={() => setStep(3)} className={`${isBalanced ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} font-bold px-8`}>
                       {isBalanced ? "Proceed to Lock" : "Force Override & Proceed"}
                    </Button>
                 </div>
               </div>
             )}
          </div>

          {/* Step 3: Final Freeze */}
          <div className={`bg-white rounded-xl border ${step === 3 ? 'border-slate-800 shadow-xl shadow-slate-900/10' : 'border-slate-200 opacity-50'} overflow-hidden`}>
             <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex gap-4 items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step === 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                <div>
                   <h2 className="font-bold text-slate-800">Final System Freeze</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Irreversible daily closure</p>
                </div>
             </div>
             {step === 3 && (
                <div className="p-8 text-center space-y-6">
                   <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                      <Lock className="w-10 h-10 text-amber-600" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Lock Branch Operations</h3>
                      <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                        Executing this command will forever archive today's ledger and prevent any further transactions until tomorrow.
                      </p>
                   </div>
                   <Button className="w-full bg-slate-900 hover:bg-slate-800 font-bold h-12 text-lg shadow-lg shadow-slate-900/20" onClick={() => alert('Branch successfully archived and closed for the day.')}>
                      AUTHORIZE END-OF-DAY ARCHIVE
                   </Button>
                   <Button variant="link" onClick={() => setStep(2)} className="font-bold text-slate-400">Cancel & Return</Button>
                </div>
             )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-900/20">
             <h3 className="font-black text-lg mb-2">EOD Timeline</h3>
             <div className="flex flex-col gap-4 mt-6">
                <div className="flex gap-4">
                   <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-400"/></div>
                   <div><p className="font-bold">Pending Transfers</p><p className="text-xs font-bold uppercase tracking-widest text-slate-400">All cleared</p></div>
                </div>
                <div className="flex gap-4 border-t border-slate-800 pt-4">
                   <div className="mt-1"><AlertCircle className="w-5 h-5 text-amber-400"/></div>
                   <div><p className="font-bold">Journal Balance</p><p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Awaiting execution</p></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
