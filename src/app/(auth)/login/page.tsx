'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SignNestLogo } from '@/components/brand/SignNestLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ToastContainer, useToast } from '@/components/ui/Toast';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const errorParam = searchParams.get('error');
  const { toasts, addToast, removeToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then(r => r.json())
      .then(d => setCsrfToken(d.csrfToken))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (errorParam === 'CredentialsSignin') {
      addToast({ type: 'error', message: 'Invalid email or password.' });
    } else if (errorParam === 'Configuration') {
      addToast({ type: 'error', message: 'Server configuration error. Please try again later.' });
    } else if (errorParam) {
      addToast({ type: 'error', message: 'Sign in failed. Please try again.' });
    }
  }, [errorParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }
    if (!csrfToken) {
      addToast({ type: 'error', message: 'Loading... please try again in a moment.' });
      return;
    }
    setLoading(true);
    formRef.current?.submit();
  };

  return (
    <>
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <SignNestLogo size="xl" priority className="mx-auto max-w-[240px]" />
        </div>
        <p className="font-sans text-white/70 text-base">
          Close property deals. Collect signatures. Build trust.
        </p>
      </div>
      <div className="rounded-2xl border border-warm-200 bg-white p-6 sm:p-8 shadow-sm">
        <form
          ref={formRef}
          method="POST"
          action="/api/auth/callback/credentials"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={redirectTo} />
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
