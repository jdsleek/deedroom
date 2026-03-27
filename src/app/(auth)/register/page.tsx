'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignNestLogo } from '@/components/brand/SignNestLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('realtor');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone: phone || undefined, role, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      addToast({ type: 'success', message: 'Account created. Sign in to continue.' });
      window.location.href = '/login';
    } catch (err) {
      addToast({ type: 'error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <SignNestLogo size="hero" priority />
        </div>
        <p className="font-sans text-white/70 text-base">
          Close property deals. Collect signatures. Build trust.
        </p>
      </div>
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
          />
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm text-warm-900 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-colors"
            >
              <option value="realtor">Realtor / Agent</option>
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
              <option value="buyer">Buyer</option>
              <option value="developer">Developer</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
          />
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Spinner className="w-5 h-5" /> : 'Create Account'}
          </Button>
        </form>
        <p className="font-sans text-sm text-warm-600 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-coral-500 hover:text-coral-600 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
