import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  // Validate Supabase user session
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session: supabaseSession },
  } = await supabase.auth.getSession();

  if (!supabaseSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Initialize Stripe with proper error handling
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY not set");
      return NextResponse.json(
        { error: "Stripe secret key not configured" },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-08-16",
    });

    // Retrieve the session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid session data returned" },
        { status: 400 },
      );
    }

    // Log customer email for debugging
    console.log("🔍 Session customer email:", session.customer_details?.email);

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          error: "Payment not completed",
          status: session.payment_status,
        },
        { status: 400 },
      );
    }

    // Return the session data
    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error verifying payment:", error?.message, error?.stack);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 },
    );
  }
}
