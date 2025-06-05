import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse JSON with error handling
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Invalid JSON input:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { priceId, returnUrl, userId } = body;
    console.log("Received request:", { priceId, returnUrl, userId });

    // Declare baseUrl at the top before any usage
    const baseUrl =
      returnUrl || "https://serene-sutherland6-a496q.view-2.tempo-dev.app";

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Price ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate price ID format
    if (
      !priceId.startsWith("price_") &&
      !priceId.includes("annual_discount") &&
      !priceId.includes("monthly_pro") &&
      priceId !== "free"
    ) {
      console.error("Invalid price ID format:", priceId);
      return new Response(
        JSON.stringify({ error: "Invalid price ID format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Handle free plan signup
    if (priceId === "free") {
      // For free plans, we don't need to create a checkout session
      // Just return a URL to redirect to the signup page
      return new Response(
        JSON.stringify({
          url: `${baseUrl}/auth/signup?plan=free`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get environment variables for PICA API
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      console.error("Missing PICA environment variables");
      return new Response(JSON.stringify({ error: "Configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("PICA keys available:", {
      secret: !!PICA_SECRET_KEY,
      connection: !!PICA_STRIPE_CONNECTION_KEY,
    });

    // Prepare form data for PICA API
    const formData = new URLSearchParams();
    formData.append("mode", "subscription");
    formData.append("line_items[0][price]", priceId);
    formData.append("line_items[0][quantity]", "1");
    formData.append("automatic_tax[enabled]", "true");

    // Set success and cancel URLs
    formData.append(
      "success_url",
      `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    );
    formData.append("cancel_url", `${baseUrl}/pricing`);

    // Add client reference ID if provided
    if (userId) {
      formData.append("client_reference_id", userId);
    }

    console.log("Form data prepared:", formData.toString());

    // Use the correct action ID for checkout sessions
    const actionId = "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg";

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds

    // Make call to PICA API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id": actionId,
        },
        body: formData.toString(),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    console.log("PICA API response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      console.error("PICA API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
          details: errorData,
          status: response.status,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sessionData = await response.json();
    console.log("Checkout session created successfully");

    return new Response(JSON.stringify({ url: sessionData.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
