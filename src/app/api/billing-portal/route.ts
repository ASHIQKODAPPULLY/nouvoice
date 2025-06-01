import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe once outside the handler for better performance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

export async function POST(request: Request) {
  try {
    // Use route handler client to ensure session is tied to cookies
    const supabase = createRouteHandlerClient({ cookies: () => cookies() });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Authentication error:", userError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get the user's subscription to find their customer ID
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription or Stripe customer ID found" },
        { status: 404 },
      );
    }

    const customerId = subscription.stripe_customer_id;

    // Create billing portal session directly with Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url:
        request.headers.get("origin") || "http://localhost:3000/account",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Unexpected error creating billing portal session:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return NextResponse.json(
      { error: "An unexpected error occurred", message: error.message },
      { status: 500 },
    );
  }
}
