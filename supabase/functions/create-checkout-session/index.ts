import { corsHeaders } from "@shared/cors.ts";

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
      console.error("Missing price ID in request");
      return new Response(JSON.stringify({ error: "Price ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle free plan signup
    if (priceId === "free") {
      console.log("Handling free plan signup");
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

    console.log("Environment check:", {
      hasPicaSecret: !!PICA_SECRET_KEY,
      hasPicaConnection: !!PICA_STRIPE_CONNECTION_KEY,
      picaSecretLength: PICA_SECRET_KEY?.length || 0,
      picaConnectionLength: PICA_STRIPE_CONNECTION_KEY?.length || 0,
    });

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      console.error("Missing PICA environment variables", {
        PICA_SECRET_KEY: !!PICA_SECRET_KEY,
        PICA_STRIPE_CONNECTION_KEY: !!PICA_STRIPE_CONNECTION_KEY,
      });
      return new Response(JSON.stringify({ error: "Configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare form data for PICA API with more detailed logging
    const formData = new URLSearchParams();
    formData.append("mode", "subscription");
    formData.append("line_items[0][price]", priceId);
    formData.append("line_items[0][quantity]", "1");
    formData.append("automatic_tax[enabled]", "true");

    // Set success and cancel URLs
    const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;

    formData.append("success_url", successUrl);
    formData.append("cancel_url", cancelUrl);

    // Add client reference ID if provided
    if (userId) {
      formData.append("client_reference_id", userId);
    }

    console.log("Request details:", {
      priceId,
      successUrl,
      cancelUrl,
      userId,
      formDataEntries: Array.from(formData.entries()),
    });

    // Use the correct action ID for checkout sessions
    const actionId = "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg";
    const apiUrl = "https://api.picaos.com/v1/passthrough/v1/checkout/sessions";

    console.log("Making PICA API call:", {
      url: apiUrl,
      actionId,
      bodyLength: formData.toString().length,
    });

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.error("Request timeout after 15 seconds");
      controller.abort();
    }, 15000); // 15 seconds

    let response;
    try {
      // Make call to PICA API
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id": actionId,
        },
        body: formData.toString(),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error("Fetch error:", {
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
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    clearTimeout(timeout);

    console.log("PICA API response:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      let errorData;
      let errorText;

      try {
        errorText = await response.text();
        console.log("Raw error response:", errorText);

        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
          errorData = { message: errorText };
        }
      } catch (textError) {
        console.error("Failed to read error response text:", textError);
        errorData = { message: "Unknown error" };
      }

      console.error("PICA API error details:", {
        status: response.status,
        statusText: response.statusText,
        errorData: JSON.stringify(errorData, null, 2),
        rawResponse: errorText,
      });

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
      console.log("Raw success response:", responseText);
      sessionData = JSON.parse(responseText);
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

    console.log("Checkout session created successfully:", {
      sessionId: sessionData.id,
      url: sessionData.url,
    });

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

    console.error("Edge function error details:", errorDetails);

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
