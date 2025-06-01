import { createBrowserClient } from "@supabase/ssr";
import { isBrowser } from "../environment";

// Extract project ref from the URL
const projectRef =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^\.]+)\./)?.[1] ||
  "";

// Create a client-side only supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

// Initialize the client only in browser environment
if (isBrowser) {
  supabaseClient = createBrowserClient(
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
        domain:
          window.location.hostname === "localhost" ? "localhost" : undefined,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  );
}

// Export a singleton instance for direct imports
export const supabase = supabaseClient!;

// Also export a function for backward compatibility
export function createClient() {
  if (!isBrowser) {
    throw new Error(
      "createClient() should only be called in browser environment",
    );
  }
  return supabaseClient!;
}
