import { createClient } from "@supabase/supabase-js";

/**
 * Helper function to generate the correct slug for Supabase edge functions
 * @param functionPath The path to the function (e.g., "supabase/functions/hello_world/index.ts")
 * @returns The properly formatted slug for invoking the function
 */
export function generateFunctionSlug(functionPath: string): string {
  return functionPath
    .replace("/index.ts", "")
    .replace(/\//g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "");
}

/**
 * Helper function to invoke Supabase edge functions with proper error handling
 * @param functionPath The path to the function (e.g., "supabase/functions/hello_world/index.ts")
 * @param payload The payload to send to the function
 * @returns The response from the function
 */
export async function invokeEdgeFunction<T = any, P = any>(
  functionPath: string,
  payload?: P,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const slug = generateFunctionSlug(functionPath);
  console.log(`Invoking edge function with slug: ${slug}`);

  try {
    const { data, error } = await supabase.functions.invoke<T>(slug, {
      body: payload,
    });

    if (error) {
      console.error(`Error invoking edge function ${slug}:`, error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Exception invoking edge function ${slug}:`, error);
    return { data: null, error };
  }
}
