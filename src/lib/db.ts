import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 uses driver adapters at runtime. For SQLite we use better-sqlite3.
// The adapter wants a raw filesystem path (not a `file:` URL), and we resolve
// relative paths against the project root so the app opens the same database
// file the Prisma CLI created (see prisma.config.ts).
function resolveSqlitePath(url: string | undefined): string {
  const fallback = "file:./prisma/dev.db";
  const raw = (url ?? fallback).replace(/^file:/, "");
  if (raw === ":memory:") return raw;
  return path.resolve(process.cwd(), raw);
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: resolveSqlitePath(process.env.DATABASE_URL),
  });
  return new PrismaClient({ adapter });
}

// Reuse a single client across hot reloads in development to avoid exhausting
// connections / re-opening the SQLite file on every change.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
