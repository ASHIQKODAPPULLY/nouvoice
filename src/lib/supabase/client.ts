import { createBrowserClient } from "@supabase/ssr";

// Export a singleton instance for direct imports. Using the helper from
// `@supabase/ssr` ensures authentication cookies are kept in sync so that
// server components can access the session.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Also export a function for backward compatibility
export function createClient() {
  return supabase;
}
