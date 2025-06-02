import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract authorization header if present
    const authHeader = request.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);

    // Log the incoming request headers for debugging
    console.log(
      "Incoming request headers:",
      Object.fromEntries(request.headers),
    );

    // Parse request body early to avoid parsing it multiple times
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body parsed successfully:", {
        priceId: requestBody.priceId
          ? `${requestBody.priceId.substring(0, 10)}...`
          : "undefined",
        returnUrl: requestBody.returnUrl || "undefined",
      });
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const cookieStore = cookies();
    // Log all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log(
      "Available cookies:",
      allCookies.map((c) => c.name),
    );

    // Check specifically for Supabase auth cookie
    const supabaseCookie = allCookies.find((c) =>
      c.name.includes("-auth-token"),
    );
    console.log("Supabase auth cookie found:", !!supabaseCookie);

    // Log cookie values for debugging (redacted for security)
    if (supabaseCookie) {
      console.log(
        "Auth cookie exists with length:",
        supabaseCookie.value.length,
      );
    }

    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    console.log("Supabase client created with cookies");

    // Get the current user session
    const sessionResult = await supabase.auth.getSession();
    const session = sessionResult.data.session;
    const sessionError = sessionResult.error;

    // Log detailed session information
    console.log(
      "Session check in API route:",
      session ? "Found session" : "No session found",
    );

    if (sessionError) {
      console.error("Session error:", sessionError);
    }

    if (!session) {
      console.error("No session found in create-checkout-session");

      // If we have an auth header but no session, try to use the token directly
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        console.log("Attempting to use provided access token");

        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (data.user && !error) {
            console.log("Successfully authenticated with provided token");
            const { priceId, returnUrl } = requestBody;
            return await processCheckoutSession(priceId, returnUrl, data.user);
          } else {
            console.error("Token authentication failed:", error);
          }
        } catch (tokenError) {
          console.error("Error using provided token:", tokenError);
        }
      }

      // For development/testing purposes, allow anonymous checkout if explicitly requested
      if (requestBody.allowAnonymous === true) {
        console.log(
          "Anonymous checkout requested, proceeding without authentication",
        );
        const mockUser = { id: "anonymous-user-" + Date.now() };
        return await processCheckoutSession(
          requestBody.priceId,
          requestBody.returnUrl,
          mockUser,
        );
      }

      return NextResponse.json(
        { error: "Unauthorized - No session" },
        { status: 401 },
      );
    }

    // Only try to get user if we have a session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
    }

    if (!user) {
      console.error("Session found but no user data");
      return NextResponse.json(
        { error: "Unauthorized - No user" },
        { status: 401 },
      );
    }

    // Log user ID for debugging
    console.log("User authenticated:", user.id);

    const { priceId, returnUrl } = requestBody;
    return await processCheckoutSession(priceId, returnUrl, user);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

async function processCheckoutSession(
  priceId: string,
  returnUrl: string,
  user: any,
) {
  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  // Validate price ID format
  if (
    !priceId.startsWith("price_") &&
    !priceId.includes("annual_discount") &&
    !priceId.includes("monthly_pro")
  ) {
    console.error("Invalid price ID format:", priceId);
    return NextResponse.json(
      { error: "Invalid price ID format" },
      { status: 400 },
    );
  }

  // Create form body for Pica API
  const formBody = new URLSearchParams();
  formBody.append("mode", "subscription");
  formBody.append("line_items[0][price]", priceId);
  formBody.append("line_items[0][quantity]", "1");

  // Use absolute URLs for success and cancel URLs
  const siteUrl =
    returnUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://nouvoice.com.au";
  formBody.append(
    "success_url",
    `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
  );
  formBody.append("cancel_url", `${siteUrl}/pricing`);
  formBody.append("automatic_tax[enabled]", "true");
  formBody.append("client_reference_id", user.id);

  // Call Pica API to create checkout session
  console.log("Calling Pica API with price ID:", priceId);
  console.log("Form body:", formBody.toString());
  console.log("PICA_SECRET_KEY exists:", !!process.env.PICA_SECRET_KEY);
  console.log(
    "PICA_STRIPE_CONNECTION_KEY exists:",
    !!process.env.PICA_STRIPE_CONNECTION_KEY,
  );

  // Always use the exact action ID from the documentation
  const actionId = "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg";
  // Verify the action ID is correctly formatted
  console.log("Verifying action ID format:", actionId);
  console.log("Using action ID:", actionId);

  // Log the full request details for debugging
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "x-pica-secret": process.env.PICA_SECRET_KEY || "",
    "x-pica-connection-key": process.env.PICA_STRIPE_CONNECTION_KEY || "",
    "x-pica-action-id": actionId,
  };

  console.log("Request headers prepared:", {
    "Content-Type": headers["Content-Type"],
    "x-pica-secret": headers["x-pica-secret"] ? "present" : "missing",
    "x-pica-secret-length": headers["x-pica-secret"]
      ? headers["x-pica-secret"].length
      : 0,
    "x-pica-connection-key": headers["x-pica-connection-key"]
      ? "present"
      : "missing",
    "x-pica-connection-key-length": headers["x-pica-connection-key"]
      ? headers["x-pica-connection-key"].length
      : 0,
    "x-pica-action-id": headers["x-pica-action-id"],
  });

  const response = await fetch(
    "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
    {
      method: "POST",
      headers: headers,
      // Remove credentials: "include" as it's not needed for server-to-server calls
      // and could cause issues with CORS
      body: formBody.toString(),
    },
  );

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: await response.text() };
    }
    console.error("Checkout session creation failed:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorData,
        status: response.status,
        statusText: response.statusText,
      },
      { status: response.status },
    );
  }

  const sessionData = await response.json();
  console.log("Checkout session created successfully");
  return NextResponse.json({ url: sessionData.url });
}
