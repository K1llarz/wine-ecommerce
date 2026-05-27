# Maison du Vin — Wine E-Commerce Platform

A sophisticated, editorial wine boutique built as a unified **Next.js 16 (App Router)** full-stack application with **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (Base UI), and **Prisma 7** on SQLite (Postgres-ready).

> **Status:** Foundation + browseable storefront. The data layer, design system, shared layout, homepage, catalog, product detail and a working client cart are complete and verified. Checkout, authentication, the admin dashboard, and real payment/email/storage integrations are stubbed or scaffolded for the next phase — see [Roadmap](#roadmap).

---

## Tech stack

| Concern        | Choice |
| -------------- | ------ |
| Framework      | Next.js 16 (App Router, React 19, Turbopack) |
| Language       | TypeScript |
| Styling        | Tailwind CSS v4 (CSS-based theming) + shadcn/ui (Base UI primitives) |
| Fonts          | Playfair Display (headings) + Inter (body) via `next/font` |
| ORM / DB       | Prisma 7 with the `prisma-client` generator; SQLite for dev via the `better-sqlite3` driver adapter |
| State          | Zustand (persisted cart) |
| Forms / validation | React Hook Form + Zod |
| Icons          | lucide-react |

### Architecture note
The original brief specified a separate Express/NestJS API. This implementation uses a **unified Next.js full-stack app** (Server Components + Server Actions + Route Handlers) for a single deployable unit and shared types. The domain logic is isolated in `src/lib/`, so the API can be extracted into a standalone service later if needed.

---

## Prerequisites

- **Node.js 20+** (developed on Node 25)
- npm

No database server is required for local development — SQLite runs from a file.

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env        # (Windows: copy .env.example .env)

# 3. Generate the Prisma client, create the DB, and seed sample data
npm run db:generate
npm run db:migrate          # creates prisma/dev.db and applies migrations
npm run db:seed             # seeds categories, regions, varietals, 20 wines, users

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

### Seeded accounts

| Role        | Email                     | Password       |
| ----------- | ------------------------- | -------------- |
| Super Admin | `admin@maisonduvin.test`  | `admin1234`    |
| Customer    | `customer@example.com`    | `password1234` |

---

## npm scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate the Prisma client into `src/generated/prisma` |
| `npm run db:migrate` | Create & apply a dev migration |
| `npm run db:seed` | Seed the database (`prisma/seed.ts`) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Drop, re-migrate and re-seed the database |

---

## Project structure

```
prisma/
  schema.prisma          # all data models (Postgres-portable)
  seed.ts                # sample data
prisma.config.ts         # Prisma 7 config (datasource URL, seed)
public/wines/            # SVG bottle illustrations (one per wine type)
src/
  app/
    layout.tsx           # root layout: fonts, header, footer, age gate
    page.tsx             # homepage
    wines/page.tsx       # catalog with filters + sort
    products/[slug]/     # product detail page
    cart/                # cart page
    actions/             # server actions (newsletter)
  components/
    ui/                  # shadcn/ui components + ButtonLink helper
    site/                # header, footer, age gate, product card, cart, etc.
  generated/prisma/      # generated Prisma client (gitignored)
  lib/
    db.ts                # Prisma singleton (better-sqlite3 adapter)
    queries.ts           # server-side data access
    constants.ts         # enum-like unions + age rules
    format.ts            # money / slug / pairing helpers
    cart-store.ts        # persisted Zustand cart
    services/            # payments / email / storage seams (stubbed)
```

---

## Data model

Tables (Prisma models): `User`, `OAuthAccount`, `Address`, `Category`, `Region`, `GrapeVarietal`, `Product`, `ProductImage`, `ProductVarietal`, `Review`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `InventoryLog`, `NewsletterSubscriber`.

**SQLite portability decisions** (so a single schema runs on SQLite now and Postgres later):
- No native `enum`s or scalar lists (unsupported on SQLite). Enum-like columns are `String`, with allowed values documented in the schema and enforced in-app via the unions in `src/lib/constants.ts`.
- Money is stored as **integer cents** (`priceCents`, `totalCents`, …).
- JSON payloads (order address snapshots) are stored as TEXT.

### Moving to PostgreSQL
1. Change the datasource `provider` to `"postgresql"` in `prisma/schema.prisma`.
2. Set `DATABASE_URL` to a Postgres connection string.
3. Swap the driver adapter in `src/lib/db.ts` (e.g. `@prisma/adapter-pg`).
4. (Optional) promote the documented `String` enums to real `enum`s, and add `mode: "insensitive"` to text search in `src/lib/queries.ts` (SQLite `LIKE` is already case-insensitive for ASCII).
5. `npm run db:migrate`.

---

## Environment variables

See [`.env.example`](./.env.example). Only `DATABASE_URL` and `JWT_SECRET` are required for local dev. External services default to **stub** implementations (`PAYMENTS_PROVIDER`, `EMAIL_PROVIDER`, `STORAGE_PROVIDER` = `stub`) so the app runs with no third-party credentials. Real providers (Stripe / Resend / SendGrid / S3 / Cloudinary) plug in behind the interfaces in `src/lib/services/`.

---

## Design system

A warm, editorial palette defined as CSS variables in `src/app/globals.css` (Tailwind v4 `@theme`):
- **Deep burgundy** primary, **gold** accent, **cream** surfaces; full light & dark themes.
- Serif **Playfair Display** headings over **Inter** body, generous whitespace.
- Tokens are exposed as utilities: `bg-burgundy`, `text-gold`, plus the standard shadcn tokens (`primary`, `muted`, `accent`, …) and an `.eyebrow` label style.

---

## Implemented features

- Curated homepage: hero, collections, featured wines, Wine of the Month, region highlights, newsletter (working server action → DB).
- Catalog (`/wines`) with type/country filters, search and sort via URL params.
- Product detail pages with gallery image, specs, tasting notes, food pairings, varietals, reviews, related wines, and **Schema.org `Product`** structured data.
- Persisted client cart (add / update / remove, subtotal, free-shipping threshold) with a live header badge.
- Age-verification gate on entry (persisted), responsive header with mobile drawer, and footer.

## Roadmap

- Checkout flow (multi-step) + Stripe payment integration.
- Authentication (JWT + refresh, Google OAuth) and customer account area.
- Admin dashboard (`/admin`): product CRUD, orders, inventory, customers, analytics, role-based access (the `User.role` field and `ADMIN_ROLES` are already in place).
- Persisted server-side cart/wishlist for logged-in users; review submission.
- Real email & image-storage providers.

---

## Notes

- A `turbopack.root` is pinned in `next.config.ts` because an unrelated lockfile exists in a parent directory.
- The placeholder bottle imagery is first-party SVG; `next/image` is configured with `dangerouslyAllowSVG` + a strict CSP to serve it. Replace with real photography (Unsplash/Cloudinary hosts are pre-allowed in `next.config.ts`).
