import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { priceId, returnUrl, userId } = await req.json();

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Price ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate Stripe secret key format
    if (!stripeSecretKey.startsWith("sk_")) {
      console.error("Invalid Stripe secret key format");
      return new Response(
        JSON.stringify({ error: "Invalid Stripe configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare form data for Stripe Checkout Session API
    const formData = new URLSearchParams();
    formData.append("mode", "subscription");
    formData.append("line_items[0][price]", priceId);
    formData.append("line_items[0][quantity]", "1");
    formData.append("automatic_tax[enabled]", "true");

    // Set success and cancel URLs
    const baseUrl =
      returnUrl || "https://serene-sutherland6-a496q.view-2.tempo-dev.app";
    formData.append(
      "success_url",
      `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    );
    formData.append("cancel_url", `${baseUrl}/pricing`);

    // Add client reference ID if provided
    if (userId) {
      formData.append("client_reference_id", userId);
    }

    console.log("Creating Stripe checkout session with price:", priceId);

    // Make direct call to Stripe API
    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${stripeSecretKey}`,
        },
        body: formData.toString(),
      },
    );

    const responseData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe API error:", responseData);
      return new Response(
        JSON.stringify({
          error:
            responseData.error?.message || "Failed to create checkout session",
          details: responseData,
        }),
        {
          status: stripeResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Stripe checkout session created successfully");
    return new Response(JSON.stringify({ url: responseData.url }), {
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
