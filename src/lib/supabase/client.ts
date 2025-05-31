import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Make sure we're using the public environment variables
  // Use window.ENV variables if available (for client-side), otherwise use process.env
  const supabaseUrl =
    typeof window !== "undefined" && window.ENV?.NEXT_PUBLIC_SUPABASE_URL
      ? window.ENV.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    typeof window !== "undefined" && window.ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables", {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    });

    // Return a dummy client that won't cause errors but won't work either
    // This prevents crashes when env vars aren't available
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        signInWithPassword: (credentials) => {
          console.error(
            "Cannot sign in: Missing Supabase credentials in environment",
          );
          return Promise.resolve({
            data: null,
            error: new Error("Missing Supabase credentials"),
          });
        },
        signUp: (credentials) => {
          console.error(
            "Cannot sign up: Missing Supabase credentials in environment",
          );
          return Promise.resolve({
            data: null,
            error: new Error("Missing Supabase credentials"),
          });
        },
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
