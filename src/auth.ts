import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
if (!secret || secret === "your-random-32-char-secret") {
  console.error(
    "[DeedRoom] AUTH_SECRET is missing or still the placeholder. Add to .env.local: AUTH_SECRET=$(openssl rand -base64 32)"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
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

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          include: { profile: true },
        });
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
      return true;
    },
  },
});
