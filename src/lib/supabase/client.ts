import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined",
  );
}

// Export a singleton instance for direct imports
export const supabase = createSupabaseClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

// Also export a function for backward compatibility
export function createClient() {
  return supabase;
}
