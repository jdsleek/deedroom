# SignNest

**Close property deals. Collect signatures. Build trust.**

SignNest is a secure transaction room platform for Nigerian real estate deals. Create deal rooms, invite parties, share documents, collect eSignatures via OTP, and produce sealed executed PDFs with a full audit trail.

## Overview

SignNest streamlines real estate transactions by providing a centralized space for agents, landlords, tenants, buyers, and lawyers to collaborate. Parties can view documents, sign with OTP verification, track payments, and export evidence packs for legal compliance.

## Features

### Deal Management
- Create rent and sale deals with full property details
- Draft, send, viewing, and completed status workflow
- Property address, type, description, and financial terms (rent, sale price, fees)
- Deal timeline and status badges

### Parties and Invitations
- Invite parties by role (landlord, tenant, buyer, realtor, lawyer, developer)
- Email and SMS/WhatsApp invites via Termii and Brevo
- Token-based invite links for unauthenticated access
- Party decline with reason tracking
- Sign order support for sequential signatures

### Documents
- Upload PDFs with categories (lease, sale deed, ID, other)
- View-only or download permissions
- Draft watermarks on unsigned documents
- Document templates for common agreements (lease, sale deed)
- Seal executed PDFs with signatures and audit metadata

### Signatures
- OTP verification via Termii before signing
- Signature pad capture with IP and user agent logging
- Per-document, per-party signature requests
- Signature status tracking across all parties

### Payments
- Record payments (bank transfer, cash, Paystack placeholder)
- Payment status (pending, paid, failed, refunded)
- Receipt generation
- Naira amounts in kobo precision

### Audit and Compliance
- Full audit log (party viewed, document uploaded, signed, deal completed)
- Export evidence pack as PDF for legal use
- Actor identification (name, phone, IP, user agent)

### User and Profile
- Email/password registration and login via NextAuth
- Profile with full name, phone, role, company
- KYC status and data (pending, approved, rejected)
- Role-based access control (RBAC)

### Admin
- Admin dashboard with user and deal stats
- User management (list, approve, suspend)
- Deal overview
- KYC review

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth v5 (credentials provider)
- **Styling**: Tailwind CSS 4
- **Mobile**: Capacitor (iOS and Android)
- **Email**: Brevo (transactional)
- **SMS/OTP**: Termii
- **Payments**: Paystack (planned)
- **PDF**: pdf-lib (watermarks, sealing, evidence export)

## Getting Started

### Prerequisites

- Node.js 18 or later
- PostgreSQL (local or Railway)
- npm

### Clone and Install

```bash
cd deedroom
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure all variables:

```bash
cp .env.example .env.local
```

Generate secrets:

```bash
openssl rand -base64 32
```

Use the output for `AUTH_SECRET` and `NEXTAUTH_SECRET`.

### Database Setup

```bash
npm run db:migrate
```

This runs `prisma migrate dev` to create and apply migrations.

### Seed Data

```bash
npm run db:seed
```

Creates a test user: `test@signnest.ng` / `password123`.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register or log in with the seeded account.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (local or Railway) |
| `AUTH_SECRET` | Yes | NextAuth secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | Yes | Alias for `AUTH_SECRET` |
| `NEXTAUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL for links |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (default: SignNest) |
| `TERMII_API_KEY` | No | Termii API key for OTP and SMS |
| `TERMII_SENDER_ID` | No | Termii sender ID (e.g. SignNest) |
| `TERMII_WHATSAPP_SENDER_ID` | No | Termii WhatsApp sender ID |
| `BREVO_API_KEY` | No | Brevo API key for transactional email |
| `BREVO_SENDER_NAME` | No | Email sender name |
| `BREVO_SENDER_EMAIL` | No | Email sender address |
| `PDF_SEAL_SALT` | No | Salt for PDF sealing (use `openssl rand -base64 32`) |
| `OTP_EXPIRY_MINUTES` | No | OTP validity in minutes (default: 10) |

## API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth/register` | POST | Register new user with email, password, profile |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth session and sign-in handlers |
| `/api/deals` | GET, POST | List deals (filtered), create deal |
| `/api/deals/[id]` | GET, PATCH, DELETE | Get, update, or delete deal |
| `/api/deals/[id]/complete` | POST | Mark deal as completed |
| `/api/parties` | POST | Add party to deal |
| `/api/parties/[id]` | PATCH | Update party |
| `/api/parties/[id]/decline` | POST | Decline invite with reason |
| `/api/documents` | POST | Upload document |
| `/api/documents/[id]` | GET, DELETE | Get document metadata, delete document |
| `/api/documents/[id]/file` | GET | Stream document file |
| `/api/documents/[id]/seal` | POST | Seal executed PDF with signatures |
| `/api/signatures/request` | POST | Create signature request |
| `/api/signatures/otp` | POST | Send OTP for signature |
| `/api/signatures/verify` | POST | Verify OTP and sign |
| `/api/audit/[dealId]` | GET | Get audit logs for deal |
| `/api/audit/[dealId]/evidence` | POST | Export evidence pack PDF |
| `/api/payments` | GET, POST | List payments, create payment |
| `/api/payments/[id]` | PATCH, DELETE | Update or delete payment |
| `/api/payments/[id]/receipt` | GET | Get payment receipt |
| `/api/profile` | GET, PATCH | Get or update profile |
| `/api/kyc` | GET, PATCH | Get or update KYC status and data |
| `/api/templates` | GET, POST | List templates, generate document from template |
| `/api/invites/[token]` | GET | Get invite details by token |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/users` | GET, PATCH | List users, update user (approve/suspend) |
| `/api/admin/deals` | GET | List all deals (admin) |

## Mobile App

SignNest uses Capacitor for iOS and Android builds. The web app is served from the `out` directory (static export) or from a live dev server during development.

### Development with Live Reload

1. Start the Next.js dev server:

```bash
npm run dev
```

2. Sync Capacitor with the dev server URL:

```bash
npm run mobile:dev
```

3. Open the native project:

```bash
npm run cap:open:ios
# or
npm run cap:open:android
```

The app will load from `http://localhost:3000` with live reload. Ensure your device or simulator can reach your machine (e.g. same network, or use your machine's IP in `CAPACITOR_SERVER_URL`).

### Building for iOS

1. Build the Next.js app (ensure static export outputs to `out`).
2. Sync and open:

```bash
npm run build
npm run cap:sync
npm run cap:open:ios
```

3. Build and run from Xcode.

### Building for Android

1. Build the Next.js app.
2. Sync and open:

```bash
npm run build
npm run cap:sync
npm run cap:open:android
```

3. Build and run from Android Studio.

### Capacitor Scripts

| Script | Description |
|--------|-------------|
| `cap:sync` | Copy web assets to native projects |
| `cap:open:ios` | Open iOS project in Xcode |
| `cap:open:android` | Open Android project in Android Studio |
| `mobile:dev` | Sync with `CAPACITOR_SERVER_URL=http://localhost:3000` for live reload |

## Project Structure

```
deedroom/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Seed script
├── src/
│   ├── app/
│   │   ├── (auth)/      # Login, register
│   │   ├── (dashboard)/ # Dashboard, deals, settings, KYC
│   │   ├── (admin)/     # Admin pages
│   │   ├── invite/      # Invite landing and auth
│   │   └── api/         # API routes
│   ├── components/      # UI components
│   ├── lib/             # DB, auth, storage, termii, pdf, email
│   └── types/           # TypeScript types
├── capacitor.config.ts
├── next.config.ts
└── package.json
```

## Deployment

### Railway

1. Create a project at [railway.app](https://railway.app).
2. Add a dedicated PostgreSQL database (do not share with other apps).
3. Connect your repository and deploy.

4. Add environment variables in Railway (Settings → Variables):

   - `DATABASE_URL` — from your PostgreSQL service
   - `AUTH_SECRET` or `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your app URL (e.g. `https://signest.up.railway.app`)
   - `NEXT_PUBLIC_APP_URL` — same as `NEXTAUTH_URL`
   - Optional: `TERMII_*`, `BREVO_*`, `PDF_SEAL_SALT`, `OTP_EXPIRY_MINUTES`

5. One-time schema setup: run `npx prisma db push` or `npx prisma migrate deploy` with `DATABASE_URL` pointing at Railway (via CLI or Railway shell).

6. For file storage, mount a volume at `./uploads` or configure an external storage backend.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (`prisma migrate dev`) |
| `npm run db:push` | Push schema to DB (no migrations) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed test user |
| `npm run cap:sync` | Sync Capacitor |
| `npm run cap:open:ios` | Open iOS project |
| `npm run cap:open:android` | Open Android project |
| `npm run mobile:dev` | Sync with `CAPACITOR_SERVER_URL` for live reload |

## Local Login Troubleshooting

If `test@signnest.ng` / `password123` does not work:

1. Run the seed: `npm run db:seed`
2. Ensure `.env.local` has `AUTH_SECRET` or `NEXTAUTH_SECRET` and `NEXTAUTH_URL=http://localhost:3000`
3. Use a local database: `DATABASE_URL` must point to your local Postgres, not Railway
4. Or register a new account at `/register`
