import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, customerId, priceId, amount, currency } =
      await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    // Get user info from auth if available
    const supabase = createClient();

    // Call the Edge Function to test Stripe keys
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-test-stripe-keys",
      {
        body: {
          action,
          customerId,
          priceId,
          amount,
          currency,
        },
      },
    );

    if (error) {
      console.error("Error invoking test-stripe-keys function:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to test Stripe keys",
          details: error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error testing Stripe keys:", error);
    // Don't expose detailed error messages to client
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test Stripe keys",
        details: error.toString(),
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
