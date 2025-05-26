import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const { priceId, returnUrl } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    // Validate priceId format to prevent injection attacks
    const validPriceIdPattern = /^price_[a-zA-Z0-9_]+$/;
    if (!validPriceIdPattern.test(priceId)) {
      return NextResponse.json(
        { error: "Invalid price ID format" },
        { status: 400 },
      );
    }

    // Get user info from auth if available
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      // Continue without user, will be handled as anonymous checkout
    }

    // Require authenticated user for paid subscriptions
    if (!user && priceId !== "price_free") {
      return NextResponse.json(
        { error: "Authentication required for paid subscriptions" },
        { status: 401 },
      );
    }

    // Sanitize and validate return URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    let validatedReturnUrl = baseUrl;

    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        // Only accept URLs from our domain
        if (url.hostname === new URL(baseUrl).hostname) {
          validatedReturnUrl = returnUrl;
        }
      } catch (e) {
        // Invalid URL, fall back to base URL
        console.warn("Invalid return URL provided, using default");
      }
    }

    // Check if user already has an active subscription
    if (user) {
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (existingSubscription) {
        // Optionally handle existing subscription (redirect to manage subscription page)
        // For now, we'll allow creating a new subscription which will replace the old one
        console.log(
          "User has existing subscription, creating new one will replace it",
        );
      }
    }

    // Call the Edge Function to create a checkout session
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-create-checkout-session",
      {
        body: {
          priceId,
          returnUrl: validatedReturnUrl,
          userId: user?.id,
          userEmail: user?.email,
        },
      },
    );

    if (error) {
      console.error("Error invoking create-checkout-session function:", error);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    const session = data;

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    // Don't expose detailed error messages to client
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
