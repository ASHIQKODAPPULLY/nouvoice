import { corsHeaders } from "..//_shared/cors.ts";

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
    console.log("Received request data:", JSON.stringify(requestData));

    const { priceId, successUrl, cancelUrl, userId } = requestData;
    console.log("Processing checkout for priceId:", priceId);

    if (!priceId || typeof priceId !== "string") {
      console.error("Invalid price ID received:", priceId);
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

    // Use the provided success and cancel URLs or fallback to defaults
    const siteUrl = Deno.env.get("SITE_URL") || "https://nouvoice.com.au";
    formBody.append(
      "success_url",
      `${successUrl || `${siteUrl}/payment-success`}?session_id={CHECKOUT_SESSION_ID}`,
    );
    formBody.append("cancel_url", cancelUrl || `${siteUrl}/pricing`);
    formBody.append("automatic_tax[enabled]", "true");

    // Add client reference ID if userId is provided
    if (userId) {
      formBody.append("client_reference_id", userId);
    }

    console.log("Sending request to Pica API with priceId:", priceId);
    console.log("Form body:", formBody.toString());

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
          "x-pica-action-id":
            "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg",
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
    console.log("Checkout session created successfully:", {
      id: sessionData.id,
      amount_total: sessionData.amount_total,
      url: sessionData.url,
    });

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
