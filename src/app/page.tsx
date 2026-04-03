import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { SignNestLogo } from '@/components/brand/SignNestLogo'

export default async function HomePage() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.error('[HomePage] auth() failed, rendering unauthenticated:', error)
  }
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero — brand black (matches approved logo) */}
      <section className="bg-black text-white px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-md text-center">
          <div className="flex justify-center mb-8">
            <SignNestLogo size="hero" priority />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Welcome to SignNest
          </h1>
          <p className="mt-3 text-white/70 text-base sm:text-lg">
            Close Property Deals Faster
          </p>

          <div className="mt-10 space-y-3">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 text-left">
              <span className="text-xl">🏢</span>
              <span className="text-navy-500 font-medium text-[15px]">I&apos;m an Agent or Realtor</span>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 text-left">
              <span className="text-xl">🏠</span>
              <span className="text-navy-500 font-medium text-[15px]">I&apos;m a Landlord / Developer</span>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 text-left">
              <span className="text-xl">🔑</span>
              <span className="text-navy-500 font-medium text-[15px]">I&apos;m a Renter / Buyer</span>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 text-left">
              <span className="text-xl">⚖️</span>
              <span className="text-navy-500 font-medium text-[15px]">I&apos;m a Lawyer</span>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full rounded-xl bg-coral-500 px-8 py-4 mt-8 text-base font-semibold text-white shadow-lg transition-all hover:bg-coral-600 hover:shadow-xl"
          >
            Get Started
          </Link>

          <p className="mt-4 text-white/60 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-coral-400 hover:text-coral-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy-500 text-center">
            Everything you need to close deals
          </h2>
          <p className="mt-4 text-center text-warm-600 max-w-2xl mx-auto">
            From deal creation to executed documents, SignNest streamlines real estate transactions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Transaction Rooms', desc: 'Create secure deal rooms for each transaction. Invite parties and collaborate.', icon: '📋' },
              { title: 'Document Templates', desc: 'Pre-built templates for tenancy agreements, sale deeds, and more.', icon: '📄' },
              { title: 'eSignatures', desc: 'Collect legally binding e-signatures with OTP verification.', icon: '✍️' },
              { title: 'Audit Trail', desc: 'Full activity log for every deal. Track views, downloads, and signatures.', icon: '🔍' },
              { title: 'Payments', desc: 'Track deposits, rent, and fees within each deal room.', icon: '💰' },
              { title: 'KYC Verification', desc: 'Verify identity with document uploads. Build trust before closing.', icon: '🛡️' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-warm-200 bg-warm-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-50 text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-500">{f.title}</h3>
                <p className="mt-2 text-sm text-warm-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-2xl font-bold text-white">
            Ready to streamline your deals?
          </h2>
          <p className="mt-3 text-white/70">
            Join SignNest and close transactions faster.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-coral-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-coral-600"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-white/50">
          SignNest &copy; 2026
        </div>
      </footer>
    </div>
  )
}
