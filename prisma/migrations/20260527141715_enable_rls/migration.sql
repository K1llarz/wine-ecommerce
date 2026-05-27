-- Enable Row Level Security (RLS) on every table in the public schema.
--
-- Why: tables in `public` are auto-exposed through Supabase's PostgREST API,
-- which is reachable with the publishable/anon key that ships to the browser.
-- With RLS off, that API could read/write any table (e.g. users.passwordHash).
--
-- Why this is safe for this app: the application connects through Prisma as the
-- `postgres` role (the table owner), which BYPASSES RLS, so it keeps full
-- access. Enabling RLS with NO policies denies the low-privilege `anon` /
-- `authenticated` roles used by the public API — effectively closing it off.
-- (We don't read/write via the anon key anywhere, so no policies are needed.)

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."oauth_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."grape_varietals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."product_varietals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."wishlist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."inventory_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
