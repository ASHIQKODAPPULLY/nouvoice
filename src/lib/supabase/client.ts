import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Export a singleton instance for direct imports
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Also export a function for backward compatibility
export function createClient() {
  return supabase;
}
