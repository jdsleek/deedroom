# Restore Railway Database from Backup

If `prisma db push` (or similar) was run against a **shared** Postgres instance and dropped tables from other apps, restore from a Railway backup.

## 1. Restore via Railway Dashboard

1. Go to [railway.app](https://railway.app) and open the project that has the Postgres service.
2. Click the **PostgreSQL** service.
3. Open the **Backups** tab.
4. Find a backup from **before** the wipe (check timestamp).
5. Click **Restore** on that backup.
6. Wait for Railway to restore. The service may redeploy.
7. After restore, your old tables and data (Customer, Dispatch, Product, Sale, etc.) should be back.

## 2. DeedRoom Schema on Restored DB

If you share this DB with DeedRoom and want both DeedRoom tables and the other app tables:

- **Option A**: Create a **separate** Postgres for DeedRoom (recommended). Use the restored DB for the other apps only.
- **Option B**: If you must share: After restore, run `prisma db push` **only** against a copy of the schema that includes **both** DeedRoom tables **and** the other app tables. Do not run the DeedRoom-only schema — it would drop the restored tables again.

## 3. API Token (Optional)

`RAILWAY_TOKEN` in `.env.local` can be used for Railway API scripts (e.g. listing backups). It is **never** committed (`.env*` is gitignored). Create tokens at [railway.com/account/tokens](https://railway.com/account/tokens).
