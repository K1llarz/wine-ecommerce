import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 uses driver adapters at runtime. We connect to Postgres (Supabase)
// through node-postgres. At runtime we use DATABASE_URL — the Supabase
// Transaction pooler (port 6543) — which is what works on serverless platforms
// like Vercel. Migrations use DIRECT_URL (see prisma/schema.prisma).
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot reloads / serverless invocations to avoid
// exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
