import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the request body
    const requestData = await req.json();
    const { priceId, returnUrl, userId } = requestData;

    if (!priceId || typeof priceId !== "string") {
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create form body for Pica API
    const formBody = new URLSearchParams();
    formBody.append("mode", "subscription");
    formBody.append("line_items[0][price]", priceId);
    formBody.append("line_items[0][quantity]", "1");

    // Use absolute URLs for success and cancel URLs
    const siteUrl = Deno.env.get("SITE_URL") || "https://nouvoice.com.au";
    formBody.append(
      "success_url",
      `${returnUrl || siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    );
    formBody.append("cancel_url", `${returnUrl || siteUrl}/pricing`);
    formBody.append("automatic_tax[enabled]", "true");

    // Add client reference ID if userId is provided
    if (userId) {
      formBody.append("client_reference_id", userId);
    }

    // Call Pica API to create checkout session
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "",
          "x-pica-action-id": Deno.env.get("PICA_STRIPE_ACTION_ID") || "",
        },
        body: formBody.toString(),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Checkout session creation failed:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
          details: errorData,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const sessionData = await response.json();

    return new Response(JSON.stringify({ url: sessionData.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
