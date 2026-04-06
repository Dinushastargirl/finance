import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, LogIn, LogOut } from "lucide-react"

export default function SavingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Savings Accounts</h1>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4" /> Open Account
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search savings accounts..." className="pl-8" />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account No.</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">SV-99214</TableCell>
              <TableCell>Carol White</TableCell>
              <TableCell>Fixed Deposit</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">Active</span>
              </TableCell>
              <TableCell className="text-right font-bold">$12,300.00</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" title="Deposit"><LogIn className="h-4 w-4 text-emerald-500" /></Button>
                <Button variant="ghost" size="icon" title="Withdraw"><LogOut className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
             <TableRow>
              <TableCell className="font-medium">SV-99215</TableCell>
              <TableCell>Alice Johnson</TableCell>
              <TableCell>Recurring Savings</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">Active</span>
              </TableCell>
              <TableCell className="text-right font-bold">$4,500.00</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" title="Deposit"><LogIn className="h-4 w-4 text-emerald-500" /></Button>
                <Button variant="ghost" size="icon" title="Withdraw"><LogOut className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
