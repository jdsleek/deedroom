'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { SignNestLogo } from '@/components/brand/SignNestLogo'

const teal = '#0D9488'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-block mb-12">
          <SignNestLogo size="xl" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-warm-900">
          Something went wrong
        </h1>
        <p className="mt-4 text-warm-600">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: teal }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border-2 border-warm-200 px-6 py-3 text-base font-semibold text-warm-800 transition-colors hover:bg-warm-50 hover:border-warm-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
