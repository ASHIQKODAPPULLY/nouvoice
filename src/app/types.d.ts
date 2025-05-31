// Global type definitions

interface Window {
  ENV?: {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    [key: string]: string | undefined;
  };
}
