import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Resolve a `file:` SQLite URL to an absolute path against the project root so
// the Prisma CLI and the app runtime (src/lib/db.ts) always open the same file,
// regardless of the current working directory. Non-file URLs (e.g. Postgres)
// are passed through unchanged.
function resolveDatabaseUrl(url: string | undefined): string | undefined {
  if (!url || !url.startsWith("file:")) return url;
  const filePath = url.slice("file:".length);
  if (filePath === ":memory:") return url;
  return `file:${path.resolve(process.cwd(), filePath)}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveDatabaseUrl(process.env["DATABASE_URL"]),
  },
});
