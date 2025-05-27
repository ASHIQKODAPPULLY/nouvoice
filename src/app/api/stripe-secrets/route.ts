import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      scopeType = "account",
      userId,
      limit,
      startingAfter,
      endingBefore,
    } = await request.json();

    // Get user info from auth if available
    const supabase = createClient();

    // Call the Edge Function to list Stripe secrets
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-list-stripe-secrets",
      {
        body: {
          scopeType,
          userId,
          limit,
          startingAfter,
          endingBefore,
        },
      },
    );

    if (error) {
      console.error("Error invoking list-stripe-secrets function:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to list Stripe secrets",
          details: error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error listing Stripe secrets:", error);
    // Don't expose detailed error messages to client
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to list Stripe secrets",
        details: error.toString(),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
