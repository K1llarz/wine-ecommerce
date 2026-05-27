import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components / browser code.
 * Reads the publishable (anon) key — safe to expose to the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
