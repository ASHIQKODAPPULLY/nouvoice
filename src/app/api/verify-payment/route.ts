import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  try {
    // Call the Supabase Edge Function to verify the session
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-verify-stripe-session",
      {
        body: { session_id: sessionId },
      },
    );

    if (error) {
      console.error("Error invoking verify-stripe-session function:", error);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 500 },
      );
    }

    if (!data || !data.session) {
      return NextResponse.json(
        { error: "Invalid session data returned" },
        { status: 400 },
      );
    }

    // Check if payment was successful
    if (data.session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: data.session.payment_status,
        },
        { status: 400 },
      );
    }

    // Return the session data
    return NextResponse.json(data.session);
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
