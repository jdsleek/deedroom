'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
        body: JSON.stringify({ fullName, email, phone: phone || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');
      addToast({ type: 'success', message: 'Account created. Sign in to continue.' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      addToast({ type: 'error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-navy-600">DeedRoom</h1>
        <p className="text-navy-400 mt-1">Create your account</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="w-5 h-5" /> : 'Create Account'}
          </Button>
        </form>
        <p className="text-sm text-navy-400 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-500 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
