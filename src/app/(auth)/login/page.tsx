'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, useToast } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const { toasts, addToast, removeToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: redirectTo,
      });
      if (res?.error) {
        let msg = res.error;
        if (res.error === 'CredentialsSignin') msg = 'Invalid email or password.';
        else if (res.error.toLowerCase().includes('configuration') || res.error === 'Configuration') {
          msg = 'Auth not configured. Add AUTH_SECRET to .env.local (run: openssl rand -base64 32)';
        }
        throw new Error(msg);
      }
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
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-500 text-white shadow-lg">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span className="font-display text-2xl font-bold text-white">SignNest</span>
        </div>
        <p className="font-sans text-white/70 text-base">
          Close deals. Collect signatures. Build trust.
        </p>
      </div>
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Spinner className="w-5 h-5" /> : 'Sign In'}
          </Button>
        </form>
        <p className="font-sans text-sm text-warm-600 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-coral-500 hover:text-coral-600 transition-colors">
            Register
          </Link>
        </p>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-warm-500 font-sans">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
