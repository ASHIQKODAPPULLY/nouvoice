import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe once outside the handler
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-08-16",
});

export async function POST(request: Request) {
  try {
    console.log("🔍 API route /api/create-checkout-session called");

    const cookieStore = cookies();
    console.log("🍪 Cookie store initialized");

    // Log available cookies for debugging (without exposing values)
    const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);
    console.log("🍪 Available cookies:", cookieNames);

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    console.log("🔌 Supabase client created in API route");

    // Get the session first to check authentication status
    const { data: sessionData, error: sessionCheckError } =
      await supabase.auth.getSession();
    console.log(
      "🔑 Session check in API route:",
      sessionData.session ? "Session found" : "No session found",
    );

    if (sessionCheckError) {
      console.error("❌ Session check error:", sessionCheckError);
    }

    // Log available cookies for detailed debugging (without exposing values)
    console.log("🍪 Available cookies (detailed):", cookieNames);

    // Get the full cookie objects for debugging (without exposing values)
    const allCookies = cookieStore.getAll();
    console.log(
      "🍪 Cookie details:",
      allCookies.map((c) => ({
        name: c.name,
        path: c.path,
        secure: c.secure,
        sameSite: c.sameSite,
        httpOnly: c.httpOnly !== false,
      })),
    );

    // Get the session directly to check authentication status
    const {
      data: { session: supabaseSession },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log(
      "🔑 Session check in API route:",
      supabaseSession ? "Session found" : "No session found",
    );
    console.log(
      "🔑 Session user:",
      supabaseSession?.user ? "User found" : "No user in session",
    );

    if (sessionError) {
      console.error("❌ Auth error:", sessionError);
      return NextResponse.json(
        { error: "Authentication error", details: sessionError.message },
        { status: 401 },
      );
    }

    if (!supabaseSession?.user) {
      console.error("❌ No user found in session");
      return NextResponse.json(
        { error: "Unauthorized - No user found in session" },
        { status: 401 },
      );
    }

    // Use the user from the session
    const user = supabaseSession.user;

    const { priceId, returnUrl } = await request.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Create checkout session directly with Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      automatic_tax: { enabled: true },
      client_reference_id: user.id,
      customer_email: user.email, // Link Stripe checkout to the user
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    console.error(error instanceof Error ? error.stack : error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
