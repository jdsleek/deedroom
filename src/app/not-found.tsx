import Link from 'next/link'

const coral = '#F0725C'
const teal = '#0D9488'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: coral }}
          >
            <span className="font-display text-xl font-bold">S</span>
          </div>
          <span className="font-display text-2xl font-bold text-warm-900">SignNest</span>
        </Link>
        <h1 className="font-display text-6xl font-bold text-warm-900">404</h1>
        <p className="mt-4 font-display text-xl font-semibold text-warm-800">
          Page not found
        </p>
        <p className="mt-2 text-warm-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: teal }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
