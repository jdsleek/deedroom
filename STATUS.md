# SignNest — Project Status

**Last updated:** March 17, 2026

## Architecture Overview

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL (Railway-hosted) via Prisma ORM
- **Auth:** NextAuth.js v5 (Credentials provider, JWT sessions)
- **Payments:** Paystack (test mode)
- **Email:** Brevo (configured, not yet sending in production)
- **SMS/WhatsApp OTP:** Termii (configured, falls back to mock OTP in dev)
- **Mobile:** Capacitor (Android + iOS) — loads live server URL
- **Hosting:** Railway (web service + managed Postgres)
- **Live URL:** https://signest.up.railway.app

---

## Feature Status

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Deal / Transaction Room** | DONE | Create deal (Rent/Sale), add property & parties, invite via link, full timeline (Draft → Sent → Viewed → Signing → Completed) |
| 2 | **Document Sending + Templates** | DONE | PDF/DOCX upload with drag-drop, 5 built-in templates (tenancy agreement, offer to lease, inspection checklist, payment schedule, sales offer letter), downloadable |
| 3 | **eSignature Workflow** | DONE | Place signature/date/initial fields per party, configurable required fields, OTP verification (Termii), auto-generate executed PDF with stamps, sign order enforcement |
| 4 | **Secure Storage + Sharing** | DONE | Folder per deal, permissions (view-only/download enforced in API), draft watermarking, shareable expiring links (HMAC-signed URLs with 1h/24h/7d expiry) |
| 5 | **Audit Trail + Evidence Pack** | DONE | Full log (view, download, sign, IP, device, timestamps), evidence PDF export with pagination fix for long logs |
| 6 | **Payments + Receipts** | DONE | Paystack integration (test mode), payment initialization, webhook verification, downloadable PDF receipts |
| 7 | **KYC + Verification** | DONE | ID upload + selfie, profile roles, admin KYC review (approve/reject), flagged accounts |
| 8 | **Admin Dashboard** | DONE | Platform stats, KYC review queue, user management (flag/unflag), deal oversight, dispute management |
| 9 | **In-App Notifications** | DONE | Database-backed notifications, dedicated /notifications page, Topbar bell dropdown, mark all read, polling every 30s |
| 10 | **Real-Time Updates** | DONE | Auto-refresh polling on all key pages: deals (30s), deal detail (15s), documents (20s), signatures (10s), payments (20s), notifications (30s) |
| 11 | **Mobile App (Capacitor)** | DONE | Android + iOS projects initialized, live server mode, offline fallback, safe area handling, status bar/splash screen/keyboard plugins |
| 12 | **PWA** | DONE | Manifest, service worker (offline navigation fallback), app icons |

---

## API Routes (36 endpoints)

### Authentication
- `POST /api/auth/register` — User registration
- `GET/POST /api/auth/[...nextauth]` — NextAuth.js handlers (login, session, etc.)

### Deals
- `GET/POST /api/deals` — List deals / Create deal
- `GET/PATCH /api/deals/[id]` — Get deal / Update deal
- `POST /api/deals/[id]/complete` — Mark deal as completed

### Parties
- `GET/POST /api/parties` — List parties / Add party to deal
- `GET/PATCH /api/parties/[id]` — Get party / Update party (sign order, required fields)
- `POST /api/parties/[id]/decline` — Decline invitation

### Documents
- `GET/POST /api/documents` — List documents / Upload document
- `GET/PATCH/DELETE /api/documents/[id]` — Get/update/delete document
- `GET /api/documents/[id]/file` — Download document file (permission-enforced)
- `POST /api/documents/[id]/seal` — Seal document (finalize)
- `POST /api/documents/[id]/review` — Lawyer marks document as reviewed
- `POST /api/documents/[id]/share` — Generate expiring share link

### Shared Links
- `GET /api/shared/[token]` — Access document via expiring share link

### Signatures
- `POST /api/signatures/request` — Create signature request (sign order enforced)
- `POST /api/signatures/otp` — Request OTP for signing
- `POST /api/signatures/verify` — Verify OTP and apply signature

### Payments
- `GET/POST /api/payments` — List payments / Create payment
- `GET /api/payments/[id]` — Get payment details
- `GET /api/payments/[id]/receipt` — Download payment receipt PDF
- `POST /api/payments/initialize` — Initialize Paystack payment
- `POST /api/payments/verify` — Verify Paystack payment callback

### Audit
- `GET /api/audit/[dealId]` — Get audit log for deal
- `GET /api/audit/[dealId]/evidence` — Download evidence pack PDF

### Profile & KYC
- `GET/PATCH /api/profile` — Get/update user profile
- `GET/POST /api/kyc` — Get KYC status / Submit KYC documents

### Notifications
- `GET/PATCH /api/notifications` — Get notifications / Mark as read

### Templates
- `GET /api/templates` — List available document templates

### Invites
- `GET /api/invites/[token]` — Accept deal invitation

### Disputes
- `GET/POST /api/disputes` — List/create disputes

### Admin
- `GET /api/admin/stats` — Platform statistics
- `GET/PATCH /api/admin/kyc/[userId]` — Review KYC submissions
- `GET/PATCH /api/admin/users` — User management
- `GET /api/admin/deals` — All deals (admin view)
- `GET/PATCH /api/admin/disputes` — Manage disputes

---

## Test Accounts

All test accounts use password: `password123`

| Email | Role | Name |
|-------|------|------|
| test@signnest.local | Realtor | Dev User |
| landlord@signnest.local | Landlord | Mrs Adebayo |
| tenant@signnest.local | Tenant | Chinedu Okafor |
| lawyer@signnest.local | Lawyer | Barrister Eze |
| admin@signnest.local | Admin | Admin User |

---

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set by Railway) |
| `AUTH_SECRET` | NextAuth.js secret key |
| `NEXTAUTH_URL` | Full app URL (e.g., `https://signest.up.railway.app`) |
| `NEXT_PUBLIC_APP_URL` | Same as NEXTAUTH_URL |

### Payments (Paystack)
| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack secret key (test mode: `sk_test_...`) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |

### SMS/OTP (Termii)
| Variable | Description |
|----------|-------------|
| `TERMII_API_KEY` | Termii API key |
| `TERMII_SENDER_ID` | Termii sender ID |

### Email (Brevo)
| Variable | Description |
|----------|-------------|
| `BREVO_API_KEY` | Brevo (Sendinblue) API key |
| `BREVO_SENDER_EMAIL` | Verified sender email |

### Other
| Variable | Description |
|----------|-------------|
| `PDF_SEAL_SALT` | Salt for HMAC-signed share links |
| `RAILWAY_TOKEN` | Railway API token (for CLI deployments) |

---

## Capacitor Mobile App

### Architecture
The native app is a thin shell that loads the live SignNest server. This is required because the app uses server-side features (Prisma, NextAuth, file uploads) that cannot run in a static export.

### Build Commands
```bash
# Sync web assets and plugins to native projects
npm run cap:sync

# Build and open Android Studio
npm run cap:android

# Build and open Xcode
npm run cap:ios

# Local development (points Capacitor to localhost)
npm run mobile:dev
```

### Installed Plugins
- `@capacitor/status-bar` — Dark navy status bar
- `@capacitor/splash-screen` — Branded launch screen
- `@capacitor/keyboard` — Input handling for mobile keyboards
- `@capacitor/app` — Back button and deep link handling
- `@capacitor/haptics` — Tactile feedback
- `@capacitor/push-notifications` — Push notification support (Firebase config needed for production)

### Configuration
- **App ID:** `com.signnest.app`
- **Server URL:** `https://signest.up.railway.app` (overridable via `CAPACITOR_SERVER_URL`)
- **Offline fallback:** `out/index.html` — loading spinner with retry

---

## Deployment

### Railway
1. Push to `main` branch on GitHub
2. Railway auto-deploys from GitHub
3. Build command: `prisma generate && next build`
4. Start command: `next start`

### Database
```bash
# Push schema changes
npx prisma db push

# Seed test data
npx tsx prisma/seed.ts

# Open Prisma Studio
npx prisma studio
```

---

## What Remains for Production Launch

| Item | Priority | Notes |
|------|----------|-------|
| Real Termii API keys | High | Replace test/mock OTP with live SMS delivery |
| Real Brevo API keys | High | Enable transactional emails (invites, receipts, notifications) |
| Real Paystack keys | High | Switch from test to live payment processing |
| Custom domain | Medium | Replace `signest.up.railway.app` with a branded domain |
| App Store submission | Medium | Build release APK/IPA, create store listings, submit for review |
| Firebase Cloud Messaging | Medium | Configure push notifications for native apps |
| Cloud file storage | Medium | Migrate from local `/uploads` to S3/Cloudflare R2 for production |
| Rate limiting | Low | Add API rate limiting for production security |
| E2E tests | Low | Automated test suite for critical flows |
| Email templates | Low | HTML email templates for professional communication |
