import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma.
//   - Runtime connection: provided by the pg driver adapter in src/lib/db.ts
//     (DATABASE_URL — the Supabase Transaction pooler, port 6543).
//   - Migration connection: configured here. Migrations must use the DIRECT
//     connection (DIRECT_URL, port 5432) — PgBouncer transaction mode can't
//     run them. `dotenv/config` above loads .env so DIRECT_URL resolves.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
