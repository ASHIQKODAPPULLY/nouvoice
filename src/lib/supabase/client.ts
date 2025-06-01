import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Custom storage with logging for debugging session issues
const logStorage = {
  getItem: (key: string) => {
    const value =
      typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    console.log(
      `[Supabase Storage] getItem: ${key} = ${value ? "exists" : "null"}`,
    );
    return value;
  },
  setItem: (key: string, value: string) => {
    console.log(
      `[Supabase Storage] setItem: ${key} = ${value ? "value set" : "empty"}`,
    );
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    console.log(`[Supabase Storage] removeItem: ${key}`);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

// Export a singleton instance for direct imports
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: logStorage,
      flowType: "pkce",
      storageKey: "supabase-auth-token",
      cookieOptions: {
        name: "sb-auth-token",
        lifetime: 60 * 60 * 24 * 7, // 1 week
        domain: "",
        path: "/",
        sameSite: "lax",
      },
    },
  },
);

// Also export a function for backward compatibility
export function createClient() {
  return supabase;
}
