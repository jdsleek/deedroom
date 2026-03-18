import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download SignNest — The Real Estate Deal Closer',
  description: 'Download the SignNest app for Android or install on iPhone. Close property deals faster with secure transaction rooms, e-signatures, and audit trails.',
}

const APK_URL = 'https://github.com/jdsleek/deedroom/releases/download/v1.0.0/SignNest-debug.apk'
const WEB_URL = 'https://web-production-f3e46.up.railway.app'

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#0F1923] text-white overflow-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#2E7D32]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1B5E20]/15 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E7D32] shadow-lg shadow-[#2E7D32]/30">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold tracking-tight">SignNest</span>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="px-6 pt-12 pb-20 sm:pt-20 sm:pb-32">
          <div className="mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left — Copy */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#2E7D32]/15 border border-[#2E7D32]/30 px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                  <span className="text-[#4CAF50] text-sm font-medium">v1.0.0 — Now Available</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight">
                  Close Deals.<br />
                  <span className="text-[#4CAF50]">Collect Signatures.</span><br />
                  Build Trust.
                </h1>

                <p className="mt-6 text-lg text-white/60 leading-relaxed max-w-md">
                  The all-in-one platform for real estate professionals. Secure transaction rooms, legally binding e-signatures, and full audit trails — in your pocket.
                </p>

                {/* Download buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href={APK_URL}
                    className="group flex items-center gap-4 rounded-2xl bg-[#2E7D32] px-6 py-4 font-semibold text-white shadow-xl shadow-[#2E7D32]/25 hover:bg-[#1B5E20] hover:shadow-[#2E7D32]/40 transition-all"
                  >
                    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 2.232a.5.5 0 0 0-.706-.058l-1.594 1.38a6.5 6.5 0 0 0-6.446 0L7.183 2.174a.5.5 0 1 0-.647.763l1.326 1.148A6.5 6.5 0 0 0 5.5 9H18.5a6.5 6.5 0 0 0-2.362-4.915l1.326-1.148a.5.5 0 0 0 .059-.705zM9 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                      <path d="M5.5 10v7a2.5 2.5 0 0 0 2.5 2.5h.5V22a1.5 1.5 0 0 0 3 0v-2.5h1V22a1.5 1.5 0 0 0 3 0v-2.5h.5a2.5 2.5 0 0 0 2.5-2.5v-7h-13zM3.5 10A1.5 1.5 0 0 0 2 11.5v5a1.5 1.5 0 0 0 3 0v-5A1.5 1.5 0 0 0 3.5 10zm17 0a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 3 0v-5a1.5 1.5 0 0 0-1.5-1.5z"/>
                    </svg>
                    <div>
                      <div className="text-xs text-white/70 font-normal">Download for</div>
                      <div className="text-lg leading-tight">Android</div>
                    </div>
                    <svg className="w-5 h-5 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>

                  <a
                    href={WEB_URL}
                    className="group flex items-center gap-4 rounded-2xl border-2 border-white/15 bg-white/5 px-6 py-4 font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all"
                  >
                    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div>
                      <div className="text-xs text-white/50 font-normal">Open on</div>
                      <div className="text-lg leading-tight">iPhone / Web</div>
                    </div>
                    <svg className="w-5 h-5 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <p className="mt-4 text-xs text-white/30">
                  Android: Tap the downloaded APK to install. iPhone: Open the web app and tap &quot;Add to Home Screen&quot;.
                </p>
              </div>

              {/* Right — Phone mockup */}
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  {/* Glow behind phone */}
                  <div className="absolute inset-0 bg-[#2E7D32]/20 blur-[60px] rounded-full scale-75" />
                  {/* Phone frame */}
                  <div className="relative w-[280px] rounded-[40px] border-[6px] border-white/10 bg-[#1B2838] shadow-2xl overflow-hidden">
                    {/* Notch */}
                    <div className="mx-auto mt-2 w-24 h-6 bg-black rounded-full" />
                    {/* Screen content */}
                    <div className="px-5 pt-6 pb-8">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                          </svg>
                        </div>
                        <span className="font-display font-bold text-sm">SignNest</span>
                      </div>
                      {/* Mini deal cards */}
                      <div className="space-y-3">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold">Lekki Apartment</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E7D32]/20 text-[#4CAF50]">Signing</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-white/10" />
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold">VI Office Space</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Viewing</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-white/10" />
                            <div className="h-1 flex-1 rounded bg-white/10" />
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold">Ikoyi Duplex Sale</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Completed</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                            <div className="h-1 flex-1 rounded bg-[#2E7D32]" />
                          </div>
                        </div>
                      </div>
                      {/* Bottom nav preview */}
                      <div className="mt-6 flex justify-around">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-5 h-5 rounded bg-[#2E7D32]/30" />
                          <span className="text-[8px] text-[#4CAF50]">Home</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-5 h-5 rounded bg-white/10" />
                          <span className="text-[8px] text-white/30">Deals</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-5 h-5 rounded bg-white/10" />
                          <span className="text-[8px] text-white/30">Alerts</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-5 h-5 rounded bg-white/10" />
                          <span className="text-[8px] text-white/30">Profile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features grid */}
            <div className="mt-24 sm:mt-32">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-4">
                Everything in <span className="text-[#4CAF50]">one app</span>
              </h2>
              <p className="text-center text-white/40 mb-12 max-w-lg mx-auto">
                From deal creation to executed documents — streamline every step of your real estate transactions.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: '📋', title: 'Transaction Rooms', desc: 'Secure deal rooms for each property' },
                  { icon: '✍️', title: 'eSignatures', desc: 'OTP-verified, legally binding' },
                  { icon: '📄', title: 'Doc Templates', desc: 'Pre-built tenancy & sale agreements' },
                  { icon: '🔍', title: 'Audit Trail', desc: 'Full log with evidence PDF export' },
                  { icon: '💰', title: 'Payments', desc: 'Paystack-integrated tracking' },
                  { icon: '🔗', title: 'Share Links', desc: 'Expiring document links' },
                  { icon: '🛡️', title: 'KYC Verification', desc: 'ID + selfie identity checks' },
                  { icon: '🔔', title: 'Real-Time', desc: 'Live updates across all pages' },
                ].map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 hover:bg-white/[0.06] transition-colors">
                    <span className="text-2xl">{f.icon}</span>
                    <h3 className="mt-3 font-display font-semibold text-sm">{f.title}</h3>
                    <p className="mt-1 text-xs text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-24 text-center">
              <a
                href={APK_URL}
                className="inline-flex items-center gap-3 rounded-2xl bg-[#2E7D32] px-10 py-5 text-lg font-bold shadow-xl shadow-[#2E7D32]/25 hover:bg-[#1B5E20] transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download SignNest
              </a>
              <p className="mt-4 text-sm text-white/30">
                5.4 MB &middot; Android 8.0+ &middot; v1.0.0
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-6 py-8">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#2E7D32] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-sm font-semibold">SignNest</span>
            </div>
            <p className="text-xs text-white/30">&copy; 2026 SignNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
