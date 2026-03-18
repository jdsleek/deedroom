import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'

const coral = '#F0725C'
const teal = '#0D9488'

const features = [
  {
    title: 'Transaction Rooms',
    description: 'Create secure deal rooms for each transaction. Invite parties, share documents, and collaborate in one place.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Document Templates',
    description: 'Use pre-built templates for tenancy agreements, sale deeds, and more. Customize and reuse across deals.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'eSignatures',
    description: 'Collect legally binding e-signatures from all parties. Draw, type, or upload signatures with OTP verification.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: 'Audit Trail',
    description: 'Full activity log for every deal. Track views, downloads, and signatures with timestamps for compliance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Payments',
    description: 'Track deposits, rent, and fees within each deal. Record payment milestones and keep everyone aligned.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'KYC Verification',
    description: 'Verify identity with document uploads and optional BVN integration. Build trust before closing deals.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

export default async function HomePage() {
  const session = await auth()
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-warm-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: coral }}
            >
              <span className="font-display text-lg font-bold">S</span>
            </div>
            <span className="font-display text-xl font-bold text-warm-900">SignNest</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100 hover:text-warm-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: coral }}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="px-4 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-warm-900 sm:text-5xl lg:text-6xl">
              Close Deals. Collect Signatures. Build Trust.
            </h1>
            <p className="mt-6 text-lg text-warm-600 sm:text-xl max-w-2xl mx-auto">
              Secure transaction rooms for Nigerian real estate. Create deals, share documents, collect e-signatures, and produce executed PDFs with full audit trail.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                style={{ backgroundColor: coral }}
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border-2 border-warm-200 px-8 py-4 text-base font-semibold text-warm-800 transition-colors hover:bg-warm-50 hover:border-warm-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-warm-200 bg-surface-secondary/50 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl font-bold text-warm-900 text-center sm:text-4xl">
              Everything you need to close
            </h2>
            <p className="mt-4 text-center text-warm-600 max-w-2xl mx-auto">
              From deal creation to executed documents, SignNest streamlines Nigerian real estate transactions.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-warm-200 bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: teal }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-warm-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-warm-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl rounded-3xl px-6 py-16 text-center sm:px-12" style={{ backgroundColor: teal }}>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to streamline your deals?
            </h2>
            <p className="mt-4 text-white/90">
              Join SignNest and close transactions faster with secure e-signatures and full audit trails.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold transition-colors hover:bg-warm-50"
                style={{ color: teal }}
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-200 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-warm-600">
          SignNest © 2026
        </div>
      </footer>
    </div>
  )
}
