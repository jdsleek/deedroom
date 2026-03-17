'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const { toasts, addToast, removeToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      });
      if (res?.error) throw new Error(res.error);
      if (res?.ok) {
        router.push(redirectTo);
        router.refresh();
      }
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
        <p className="text-navy-400 mt-1">Sign in to your account</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="w-5 h-5" /> : 'Sign In'}
          </Button>
        </form>
        <p className="text-sm text-navy-400 mt-4 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-gold-500 hover:underline">
            Register
          </Link>
        </p>
      </Card>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
