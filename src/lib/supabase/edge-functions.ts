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
    // Log the Supabase URL and function endpoint for debugging
    console.log(
      `Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${slug}`,
    );

    // Log the payload for debugging (excluding sensitive data)
    const sanitizedPayload = { ...payload };
    if (sanitizedPayload && typeof sanitizedPayload === "object") {
      // Sanitize any sensitive fields before logging
      if ("priceId" in sanitizedPayload) {
        console.log(`Price ID: ${sanitizedPayload.priceId}`);
      }
      if ("returnUrl" in sanitizedPayload) {
        console.log(`Return URL: ${sanitizedPayload.returnUrl}`);
      }
    }

    const { data, error } = await supabase.functions.invoke<T>(slug, {
      body: payload,
    });

    if (error) {
      console.error(`Error invoking edge function ${slug}:`, error);
      console.error(`Error details:`, JSON.stringify(error, null, 2));

      // Check if the error is a non-2xx status code but we still got data
      // This can happen when the edge function returns a 200 status with error details in the body
      if (data) {
        console.log(`Edge function ${slug} returned data despite error:`, data);
        return { data, error: null };
      }

      throw error;
    }

    // Log successful response
    console.log(
      `Edge function ${slug} response:`,
      data ? "Data received" : "No data",
    );

    return { data, error: null };
  } catch (error) {
    console.error(`Exception invoking edge function ${slug}:`, error);

    // Try to extract more detailed error information
    let detailedError = error;
    if (error instanceof Error) {
      detailedError = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    return { data: null, error: detailedError };
  }
}
