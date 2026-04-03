import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { exec as execCb } from "node:child_process";
import { join as joinPath } from "node:path";

let dbPushInFlight: Promise<void> | null = null;

async function ensureAuthTablesExist() {
  // If NextAuth tables were never created (e.g. missing `public.User`),
  // we recover by pushing the Prisma schema.
  if (dbPushInFlight) return dbPushInFlight;

  dbPushInFlight = new Promise((resolve, reject) => {
    // Avoid interactive prompts in some environments.
    const env = { ...process.env, CI: process.env.CI ?? "1" };
    const schemaPath = joinPath(process.cwd(), "prisma", "schema.prisma");
    console.error("[Auth] Running Prisma db push to create missing NextAuth tables:", { schemaPath });
    execCb(
      `npx prisma db push --schema "${schemaPath}"`,
      { env, cwd: process.cwd() },
      (err, stdout, stderr) => {
        if (err) {
          console.error("[Auth] Prisma db push failed:", {
            message: err instanceof Error ? err.message : String(err),
            stderr: typeof stderr === "string" ? stderr.slice(0, 1000) : undefined,
          });
          reject(err);
        } else {
          console.error("[Auth] Prisma db push succeeded");
          resolve();
        }
      }
    );
  });

  return dbPushInFlight.finally(() => {
    dbPushInFlight = null;
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "").trim();
        if (!email || !password) return null;

        let user;
        try {
          user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("public.User") && msg.toLowerCase().includes("does not exist")) {
            console.error("[Auth] Missing public.User table detected. Attempting db push then retrying credentials authorize.");
            await ensureAuthTablesExist();
            user = await prisma.user.findFirst({
              where: { email: { equals: email, mode: "insensitive" } },
            });
          } else {
            throw e;
          }
        }
        if (!user?.password) return null;

        const ok = await compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
    async signIn({ user }) {
      if (!user.id) return false;
      try {
        const profile = await prisma.profile.findUnique({ where: { id: user.id } });
        if (!profile) {
          await prisma.profile.create({
            data: {
              id: user.id,
              fullName: user.name ?? user.email ?? "User",
              email: user.email ?? null,
            },
          });
        }
      } catch (e) {
        console.error("[SignNest] Profile auto-create failed:", e);
      }
      return true;
    },
  },
});
