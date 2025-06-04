import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Validate Supabase environment variables and return a client instance.
 * Logs an error and returns `null` if the required variables are missing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined",
    );
    return null;
  }

  return createSupabaseClient(url, anonKey);
}

// Export a singleton instance for direct imports
export const supabase = createClient();
