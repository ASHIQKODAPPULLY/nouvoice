import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  console.log("=== CHECKOUT SESSION EDGE FUNCTION STARTED ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Timestamp:", new Date().toISOString());

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse JSON with error handling
    let body;
    try {
      const rawBody = await req.text();
      console.log("Raw request body:", rawBody);
      body = JSON.parse(rawBody);
      console.log("Parsed request body:", body);
    } catch (e) {
      console.error("Invalid JSON input:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { priceId, returnUrl, userId } = body;
    console.log("Extracted parameters:", { priceId, returnUrl, userId });

    // Declare baseUrl at the top before any usage
    const baseUrl =
      returnUrl || "https://serene-sutherland6-a496q.view-2.tempo-dev.app";
    console.log("Base URL:", baseUrl);

    if (!priceId) {
      console.error("Missing price ID in request");
      return new Response(JSON.stringify({ error: "Price ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle free plan signup
    if (priceId === "free") {
      console.log("Handling free plan signup");
      const freeUrl = `${baseUrl}/auth/signup?plan=free`;
      console.log("Redirecting to free signup:", freeUrl);
      return new Response(JSON.stringify({ url: freeUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Stripe secret key from environment
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key present:", !!STRIPE_SECRET_KEY);
    console.log(
      "Stripe key prefix:",
      STRIPE_SECRET_KEY
        ? STRIPE_SECRET_KEY.substring(0, 8) + "..."
        : "NOT_FOUND",
    );

    if (!STRIPE_SECRET_KEY) {
      console.error(
        "Missing Stripe secret key - environment variable not found",
      );
      return new Response(
        JSON.stringify({
          error: "Stripe configuration missing",
          details: "STRIPE_SECRET_KEY environment variable is required",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate Stripe key format
    const keyPattern = /^sk_(test|live)_[a-zA-Z0-9]{24,}$/;
    if (!keyPattern.test(STRIPE_SECRET_KEY)) {
      console.error("Invalid Stripe key format");
      return new Response(
        JSON.stringify({
          error: "Invalid Stripe key format",
          details: "Stripe secret key must start with sk_test_ or sk_live_",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Set success and cancel URLs
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;
    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);

    // Prepare request body for Stripe API - using form data format
    const formData = new URLSearchParams();
    formData.append("mode", "subscription");
    formData.append("line_items[0][price]", priceId);
    formData.append("line_items[0][quantity]", "1");
    formData.append("automatic_tax[enabled]", "true");
    formData.append("success_url", successUrl);
    formData.append("cancel_url", cancelUrl);

    if (userId) {
      formData.append("client_reference_id", userId);
      console.log("Added client reference ID:", userId);
    }

    console.log("Form data prepared:", formData.toString());

    // Direct Stripe API call
    const apiUrl = "https://api.stripe.com/v1/checkout/sessions";
    console.log("Making request to Stripe API:", apiUrl);

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.error("Request timeout after 30 seconds");
      controller.abort();
    }, 30000); // 30 seconds

    let response;
    try {
      console.log("Sending request to Stripe...");
      // Make direct call to Stripe API with form data
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
        body: formData.toString(),
        signal: controller.signal,
      });
      console.log("Stripe API response received");
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("Fetch error occurred:", {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack,
      });

      if (fetchError.name === "AbortError") {
        return new Response(JSON.stringify({ error: "Request timeout" }), {
          status: 408,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          error: "Network error",
          message: fetchError.message,
          details: fetchError.stack,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    clearTimeout(timeout);

    console.log("Stripe API response status:", response.status);
    console.log("Stripe API response status text:", response.statusText);
    console.log(
      "Stripe API response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      let errorData;
      let errorText;

      try {
        errorText = await response.text();
        console.log("Raw error response from Stripe:", errorText);

        try {
          errorData = JSON.parse(errorText);
          console.log("Parsed error data:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
          errorData = { message: errorText };
        }
      } catch (textError) {
        console.error("Failed to read error response text:", textError);
        errorData = { message: "Unknown error" };
      }

      console.error("=== STRIPE API ERROR DETAILS ===");
      console.error("Status:", response.status);
      console.error("Status Text:", response.statusText);
      console.error("Error Data:", JSON.stringify(errorData, null, 2));
      console.error("Raw Response:", errorText);

      // Create a detailed error message
      const detailedError = {
        error: "Failed to create checkout session",
        status: response.status,
        statusText: response.statusText,
        details: errorData,
        rawError: errorText,
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(detailedError), {
        status:
          response.status >= 400 && response.status < 500
            ? response.status
            : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sessionData;
    try {
      const responseText = await response.text();
      console.log("Raw success response from Stripe:", responseText);
      sessionData = JSON.parse(responseText);
      console.log("Parsed session data:", {
        id: sessionData.id,
        url: sessionData.url,
        mode: sessionData.mode,
        status: sessionData.status,
      });
    } catch (parseError) {
      console.error("Failed to parse success response:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid response format",
          message: parseError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("=== CHECKOUT SESSION CREATED SUCCESSFULLY ===");
    console.log("Session ID:", sessionData.id);
    console.log("Checkout URL:", sessionData.url);
    console.log("=== EDGE FUNCTION COMPLETED ===");

    return new Response(JSON.stringify({ url: sessionData.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Improved error logging with full error details
    const errorDetails = {
      name: error?.name || "Unknown",
      message: error?.message || "Unknown error",
      stack: error?.stack || "No stack trace",
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
    };

    console.error("=== EDGE FUNCTION CRITICAL ERROR ===");
    console.error("Error name:", errorDetails.name);
    console.error("Error message:", errorDetails.message);
    console.error("Error stack:", errorDetails.stack);
    console.error("Full error object:", errorDetails.fullError);
    console.error("=== END ERROR DETAILS ===");

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || "Unknown error occurred",
        name: error?.name || "Unknown",
        timestamp: new Date().toISOString(),
        details: errorDetails,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
