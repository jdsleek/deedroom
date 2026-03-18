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

### 2. Database — Local vs Railway

**Local development** (recommended for testing):

**Option A — Docker** (requires Docker Desktop running):
```bash
docker compose up -d
```

**Option B — Homebrew** (macOS): `brew install postgresql@16 && brew services start postgresql@16`, then create DB: `createdb deedroom`

Then:
```bash
cp .env.example .env.local
# Edit .env.local: DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deedroom"
# (Use your macOS username if not 'postgres' for Homebrew, e.g. postgresql://$(whoami)@localhost:5432/deedroom)
```

**Production (Railway)**:

1. Go to [railway.app](https://railway.app) and create a project
2. Add **PostgreSQL** (one-click)
3. Copy the `DATABASE_URL` from Variables
4. Set it in Railway env vars (or `.env.local` when testing against Railway)

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
3. **Required environment variables** (Settings → Variables):
   - `DATABASE_URL` — from PostgreSQL plugin (auto-linked if same project)
   - `AUTH_SECRET` or `NEXTAUTH_SECRET` — generate: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your app URL (e.g. `https://deedroom.up.railway.app`)
4. Deploy — `prisma db push` runs on startup to sync the schema
5. For file storage, mount a volume at `./uploads` or switch to S3/Vercel Blob

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

## Local Development

1. Copy `.env.example` → `.env.local` and set `DATABASE_URL` for local Postgres
2. Start Postgres: `docker compose up -d`
3. Create tables: `npm run db:push`
4. (Optional) Seed test user: `npm run db:seed` → login with `test@deedroom.local` / `password123`
5. Run: `npm run dev`

Keep `.env.local` for local use only; never commit it. Production uses Railway env vars.

### Local login troubleshooting

If `test@deedroom.local` / `password123` doesn't work:

1. **Run the seed** — `npm run db:seed` creates the test user
2. **Check env** — `.env.local` must have `AUTH_SECRET` or `NEXTAUTH_SECRET` (and `NEXTAUTH_URL=http://localhost:3000`)
3. **Use local DB** — `DATABASE_URL` must point to your local Postgres, not Railway
4. **Or register** — Use `/register` to create a new account

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Sync schema to DB
- `npm run db:studio` - Open Prisma Studio (DB GUI)
- `npm run db:seed` - Seed test user for local dev
