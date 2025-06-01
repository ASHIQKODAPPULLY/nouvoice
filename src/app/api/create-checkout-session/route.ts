import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Log the incoming request headers for debugging
    console.log(
      "Incoming request headers:",
      Object.fromEntries(request.headers),
    );

    const cookieStore = cookies();
    // Log all cookies for debugging
    console.log(
      "Available cookies:",
      cookieStore.getAll().map((c) => c.name),
    );

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Log detailed session information
    console.log(
      "Session check in API route:",
      session ? "Found session" : "No session found",
    );

    if (!session) {
      console.error("No session found in create-checkout-session");
      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 },
      );
    }

    // Only try to get user if we have a session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Session found but no user data");
      return NextResponse.json(
        { error: "Unauthorized - No user" },
        { status: 401 },
      );
    }

    // Log user ID for debugging
    console.log("User authenticated:", user.id);

    const { priceId, returnUrl } = await request.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    // Create form body for Pica API
    const formBody = new URLSearchParams();
    formBody.append("mode", "subscription");
    formBody.append("line_items[0][price]", priceId);
    formBody.append("line_items[0][quantity]", "1");
    formBody.append(
      "success_url",
      `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
    );
    formBody.append(
      "cancel_url",
      `${returnUrl || process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    );
    formBody.append("automatic_tax[enabled]", "true");
    formBody.append("client_reference_id", user.id);

    // Call Pica API to create checkout session
    console.log("Calling Pica API with price ID:", priceId);
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": process.env.PICA_SECRET_KEY || "",
          "x-pica-connection-key": process.env.PICA_STRIPE_CONNECTION_KEY || "",
          "x-pica-action-id": process.env.PICA_STRIPE_ACTION_ID || "",
        },
        // Remove credentials: "include" as it's not needed for server-to-server calls
        // and could cause issues with CORS
        body: formBody.toString(),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Checkout session creation failed:", errorData);
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: response.status },
      );
    }

    const sessionData = await response.json();

    return NextResponse.json({ url: sessionData.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
