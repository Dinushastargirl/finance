'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid branch credentials');
      }

      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/'; 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <Shield className="h-16 w-16 text-blue-600 mb-4" />
          <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">Rupasinghe Pawning</h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-bold">Teller & Admin Secure Portal</p>
        </div>

        <Card className="mt-8 bg-white border-slate-200 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-100 border-b border-slate-200 pb-6">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription className="font-medium text-slate-600">Enter your branch email and assigned password.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <Label className="block text-sm font-bold text-slate-700">Email Address</Label>
                <div className="mt-2">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="branch.brl@rupasinghe.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-bold text-slate-700">Password</Label>
                <div className="mt-2">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md font-bold text-sm">
                  {error}
                </div>
              )}

              <div>
                <Button type="submit" className="w-full font-bold bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                  Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
