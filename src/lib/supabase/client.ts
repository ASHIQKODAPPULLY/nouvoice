import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Make sure we're using the public environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    // Return a dummy client that won't cause errors but won't work either
    // This prevents crashes when env vars aren't available
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: new Error("Missing Supabase credentials"),
          }),
        signUp: () =>
          Promise.resolve({
            data: null,
            error: new Error("Missing Supabase credentials"),
          }),
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
