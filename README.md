# DeedRoom

Secure transaction room platform for Nigerian real estate deals. Create deal rooms, invite parties, share documents, collect eSignatures via OTP, and produce sealed executed PDFs.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Railway)
- **Auth**: NextAuth.js (email + password)
- **Storage**: Local filesystem (`./uploads`)
- **OTP/SMS**: Termii API
- **PDF**: pdf-lib

## Quick Start

### 1. Clone & Install

```bash
cd deedroom
npm install
```

### 2. Railway Postgres

1. Go to [railway.app](https://railway.app) and create a project
2. Add **PostgreSQL** (one-click)
3. Copy the `DATABASE_URL` from Variables
4. Add it to `.env.local`:

```env
DATABASE_URL="postgresql://..."
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=your-random-32-char-secret
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (for OTP/invites)
TERMII_API_KEY=...
TERMII_SENDER_ID=DeedRoom
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
npx prisma db push
```

This creates all tables in your Railway Postgres. No manual SQL needed.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register a new account and create your first deal.

## Deploy to Railway

1. Connect your repo to Railway
2. Add PostgreSQL plugin (or use existing)
3. Set environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (e.g. `https://your-app.railway.app`)
4. For file storage in production, mount a volume at `./uploads` or switch to S3/Vercel Blob

## Project Structure

```
src/
├── app/           # Pages & API routes
├── components/    # UI components
├── lib/           # Supabase removed; Prisma, auth, storage, termii, pdf
├── types/         # TypeScript types
prisma/
└── schema.prisma  # Database schema
```

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma db push` - Sync schema to DB
- `npx prisma studio` - Open DB GUI
