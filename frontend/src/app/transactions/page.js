'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TransactionsPage;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
function TransactionsPage() {
    var _this = this;
    var _a = (0, react_1.useState)(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = (0, react_1.useState)([]), transactions = _b[0], setTransactions = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    // Transfer State
    var _d = (0, react_1.useState)(''), targetBranchId = _d[0], setTargetBranchId = _d[1];
    var _e = (0, react_1.useState)(''), amount = _e[0], setAmount = _e[1];
    var _f = (0, react_1.useState)(''), description = _f[0], setDescription = _f[1];
    var loadTransactions = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, 5, 6]);
                    token = localStorage.getItem('auth_token');
                    return [4 /*yield*/, fetch('http://localhost:8080/transactions', {
                            headers: { 'Authorization': "Bearer ".concat(token) }
                        })];
                case 1:
                    res = _b.sent();
                    if (!res.ok) return [3 /*break*/, 3];
                    _a = setTransactions;
                    return [4 /*yield*/, res.json()];
                case 2:
                    _a.apply(void 0, [_b.sent()]);
                    _b.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    err_1 = _b.sent();
                    console.error(err_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadTransactions();
    }, []);
    var handleTransfer = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, res, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    token = localStorage.getItem('auth_token');
                    return [4 /*yield*/, fetch('http://localhost:8080/transactions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(token)
                            },
                            body: JSON.stringify({
                                clientId: 'INTERNAL_TRANSFER',
                                type: 'TRANSFER',
                                targetBranchId: targetBranchId || 'UNKNOWN',
                                amount: parseFloat(amount) || 0,
                                description: description || 'Routine Branch Balancing'
                            })
                        })];
                case 1:
                    res = _a.sent();
                    if (res.ok) {
                        setIsOpen(false);
                        setTargetBranchId('');
                        setAmount('');
                        setDescription('');
                        loadTransactions();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error(err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ledger Operations</h1>
          <p className="text-slate-500 font-medium">Branch-specific transaction history and transfers.</p>
        </div>
        
        <button_1.Button onClick={function () { return setIsOpen(true); }} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-4">
          <lucide_react_1.Send className="h-4 w-4"/> Initiate Branch Transfer
        </button_1.Button>
        
        <dialog_1.Dialog open={isOpen} onOpenChange={setIsOpen}>
          <dialog_1.DialogContent className="sm:max-w-[425px]">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="flex items-center gap-2"><lucide_react_1.Send className="h-5 w-5 text-blue-600"/> Branch Cash Transfer</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Transfer working capital between operational branches.
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label_1.Label className="font-bold">Target Destination Branch</label_1.Label>
                <select_1.Select onValueChange={function (val) { return setTargetBranchId(val || ''); }} value={targetBranchId}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select receiver branch..."/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="KOT">Kotikawatta (KOT)</select_1.SelectItem>
                    <select_1.SelectItem value="MRG">Maharagama (MRG)</select_1.SelectItem>
                    <select_1.SelectItem value="BRL">Borella (BRL)</select_1.SelectItem>
                    <select_1.SelectItem value="WAT">Wattala (WAT)</select_1.SelectItem>
                    <select_1.SelectItem value="KIR">Kiribathgoda (KIR)</select_1.SelectItem>
                    <select_1.SelectItem value="HQ">Head Office (HQ)</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              <div className="grid gap-2">
                <label_1.Label className="font-bold text-rose-600">Transfer Capital Amount (Rs.)</label_1.Label>
                <input_1.Input value={amount} onChange={function (e) { return setAmount(e.target.value); }} type="number" placeholder="500000" className="border-rose-300 bg-rose-50"/>
              </div>
              <div className="grid gap-2">
                <label_1.Label className="font-bold">Audit Reference Log</label_1.Label>
                <input_1.Input value={description} onChange={function (e) { return setDescription(e.target.value); }} placeholder="E.g. Daily Vault Balancing"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button_1.Button onClick={handleTransfer} className="bg-slate-900 hover:bg-slate-800 font-bold w-full text-white">Execute Secure Transfer</button_1.Button>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <lucide_react_1.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder="Search ledger logs by TX ID..." className="pl-8 bg-white border-slate-200"/>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <table_1.Table>
          <table_1.TableHeader className="bg-slate-50">
            <table_1.TableRow>
              <table_1.TableHead className="font-bold text-slate-800">TX Ref ID / Hash</table_1.TableHead>
              <table_1.TableHead className="font-bold text-slate-800">Direction / Type</table_1.TableHead>
              <table_1.TableHead className="font-bold text-slate-800">Date Executed</table_1.TableHead>
              <table_1.TableHead className="font-bold text-slate-800 max-w-xs">Audit Notes</table_1.TableHead>
              <table_1.TableHead className="text-right font-bold text-slate-800">Capital Value</table_1.TableHead>
            </table_1.TableRow>
          </table_1.TableHeader>
          <table_1.TableBody>
            {loading ? (<table_1.TableRow><table_1.TableCell colSpan={5} className="h-64 text-center font-bold text-slate-400">Loading ledger state...</table_1.TableCell></table_1.TableRow>) : transactions.length === 0 ? (<table_1.TableRow>
                <table_1.TableCell colSpan={5} className="h-64 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center">
                    <lucide_react_1.FileText className="h-10 w-10 mb-2 opacity-50"/>
                    Ledger is currently empty for your branch Context.
                  </div>
                </table_1.TableCell>
              </table_1.TableRow>) : (transactions.map(function (tx) { return (<table_1.TableRow key={tx.id} className="hover:bg-slate-50">
                    <table_1.TableCell className="font-black text-slate-900">{tx.id.substring(0, 8).toUpperCase()}</table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === 'TRANSFER' ? <lucide_react_1.ArrowRightLeft className="h-4 w-4 text-orange-500"/> : <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                        <span className="font-bold text-slate-700">
                          {tx.type} {tx.targetBranchId && <span className="text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-2">{tx.targetBranchId}</span>}
                        </span>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell className="text-slate-600 font-medium">{new Date(tx.timestamp).toLocaleString()}</table_1.TableCell>
                    <table_1.TableCell className="text-slate-600 font-medium max-w-xs truncate">{tx.description}</table_1.TableCell>
                    <table_1.TableCell className={"text-right font-black ".concat(tx.type === 'TRANSFER' ? 'text-rose-600' : 'text-slate-800')}>
                      {tx.type === 'TRANSFER' ? "- Rs. ".concat(tx.amount.toLocaleString()) : "Rs. ".concat(tx.amount.toLocaleString())}
                    </table_1.TableCell>
                  </table_1.TableRow>); }))}
          </table_1.TableBody>
        </table_1.Table>
      </div>
    </div>);
}
