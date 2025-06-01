import { createBrowserClient } from "@supabase/ssr";

// Extract project ref from the URL
const projectRef =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^\.]+)\./)?.[1] ||
  "";

// Export a singleton instance for direct imports
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
    cookies: {
      name: `sb-${projectRef}-auth-token`,
      lifetime: 60 * 60 * 24 * 7, // 1 week
      domain: "", // Will use the current domain
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
);

// Also export a function for backward compatibility
export function createClient() {
  return supabase;
}
