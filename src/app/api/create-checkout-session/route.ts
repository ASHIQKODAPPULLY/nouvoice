import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError) {
      console.error("Auth error:", sessionError);
      return NextResponse.json(
        { error: "Authentication error", details: sessionError.message },
        { status: 401 },
      );
    }

    if (!user) {
      console.error("No user found in session");
      return NextResponse.json(
        { error: "Unauthorized - No user found in session" },
        { status: 401 },
      );
    }

    const { priceId, returnUrl } = await request.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-08-16",
    });

    // Create checkout session directly with Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      automatic_tax: { enabled: true },
      client_reference_id: user.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
