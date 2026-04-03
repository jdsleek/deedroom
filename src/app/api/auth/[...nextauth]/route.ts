import { handlers } from "@/auth";

// Prisma cannot run in the Edge runtime. NextAuth credentials sign-in executes `authorize`,
// which uses Prisma. Force this route to use Node.js runtime.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
