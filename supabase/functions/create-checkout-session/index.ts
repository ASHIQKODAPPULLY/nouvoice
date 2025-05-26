// Edge function to create a Stripe checkout session

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { priceId, returnUrl, userId, userEmail } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    // Validate priceId format to prevent injection attacks
    const validPriceIdPattern = /^price_[a-zA-Z0-9_]+$/;
    if (!validPriceIdPattern.test(priceId)) {
      throw new Error("Invalid price ID format");
    }

    // Get environment variables
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Sanitize and validate return URL
    let validatedReturnUrl = returnUrl;
    if (!returnUrl) {
      validatedReturnUrl = "http://localhost:3000";
    }

    // Create form data for the request
    const formData = new URLSearchParams();

    // Add line items
    formData.append("line_items[0][price]", priceId);
    formData.append("line_items[0][quantity]", "1");

    // Set mode to subscription
    formData.append("mode", "subscription");

    // Set success and cancel URLs
    formData.append(
      "success_url",
      `${validatedReturnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    );
    formData.append("cancel_url", `${validatedReturnUrl}/pricing`);

    // Add payment method types
    formData.append("payment_method_types[]", "card");

    // Add client reference ID if userId is provided
    if (userId) {
      formData.append("client_reference_id", userId);
    }

    // Add customer email if provided
    if (userEmail) {
      formData.append("customer_email", userEmail);
    }

    // Add metadata
    formData.append("metadata[priceId]", priceId);

    // Add plan type metadata based on price ID
    let planType = "unknown";
    if (priceId === "price_1RPFsuBHa6CDK7TJfVmF8ld6") {
      planType = "free";
    } else if (priceId === "price_1RNxxsBHa6CDK7TJCN035U5R") {
      planType = "pro";
    } else if (priceId === "price_1RPG2jBHa6CDK7TJvViR7IoO") {
      planType = "annual";
    } else if (priceId === "price_1RPG53BHa6CDK7TJGyBiQwM2") {
      planType = "team";
    }
    formData.append("metadata[plan_type]", planType);
    formData.append(
      "metadata[isAnnual]",
      priceId === "price_1RPG53BHa6CDK7TJGyBiQwM2" ? "true" : "false",
    );
    if (userId) {
      formData.append("metadata[userId]", userId);
    }

    // Allow promotion codes
    formData.append("allow_promotion_codes", "true");

    // Collect billing address
    formData.append("billing_address_collection", "auto");

    // Make the request to create a checkout session
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id":
            "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg",
        },
        body: formData.toString(),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create checkout session: ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();

    // Return the session ID and URL
    return new Response(
      JSON.stringify({
        sessionId: data.id,
        url: data.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create checkout session",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
