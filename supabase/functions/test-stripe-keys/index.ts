// Edge function to test Stripe API keys and subscription functionality

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
    const { action, amount = 2000, currency = "usd" } = await req.json();

    // Get environment variables
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_PUBLIC_KEY = Deno.env.get("STRIPE_PUBLIC_KEY");

    if (!STRIPE_SECRET_KEY || !STRIPE_PUBLIC_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required environment variables",
          details: {
            errorType: "Configuration Error",
            suggestion:
              "Ensure STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY are set in your environment",
            details: "Required environment variables are not configured",
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Check if this is a test request to show the error for documentation
    if (action === "showExpiredKeyError") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API Key validation failed: 401 Unauthorized",
          details: {
            errorType: "Expired Key Error",
            suggestion: "Generate a new API key in the Stripe dashboard",
            details: {
              error: {
                code: "api_key_expired",
                doc_url: "https://stripe.com/docs/error-codes/api-key-expired",
                message: "Expired API Key provided: sk_live_*****Lou9vH",
                type: "invalid_request_error",
              },
            },
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Check connectivity to Stripe API
    if (action === "checkConnectivity") {
      try {
        const response = await fetch(
          "https://api.stripe.com/v1/customers?limit=1",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            },
          },
        );

        const responseText = await response.text();
        return new Response(
          JSON.stringify({
            success: response.ok,
            message: response.ok
              ? "Successfully connected to Stripe API"
              : "Failed to connect to Stripe API",
            statusCode: response.status,
            details: responseText,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Connection error: ${error.message}`,
            details: {
              errorType: "Connection Error",
              suggestion:
                "Check your network connection or if there's a Stripe API outage",
              details: error.toString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    // Create a test payment intent to validate keys
    if (action === "createPaymentIntent") {
      try {
        // For test purposes, use direct Stripe API instead of Pica passthrough
        const formData = new URLSearchParams();
        formData.append("amount", amount.toString());
        formData.append("currency", currency);
        formData.append("automatic_payment_methods[enabled]", "true");

        const response = await fetch(
          "https://api.stripe.com/v1/payment_intents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            },
            body: formData.toString(),
          },
        );

        const responseText = await response.text();
        console.log("Payment Intent Response status:", response.status);
        console.log("Payment Intent Response text:", responseText);

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { text: responseText };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Payment Intent creation failed: ${response.status} ${response.statusText}`,
              details: {
                errorType: responseData.error?.type || "API Error",
                suggestion: "Check your Stripe API key permissions and status",
                details: responseData,
              },
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment Intent created successfully - API keys are valid",
            data: responseData,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      } catch (error) {
        console.error("Error in createPaymentIntent:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Error creating Payment Intent: ${error.message}`,
            details: {
              errorType: "Execution Error",
              suggestion:
                "Check your network connection and API key configuration",
              details: error.toString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    // Validate API keys by listing customers
    if (action === "validateKeys") {
      try {
        const response = await fetch(
          "https://api.stripe.com/v1/customers?limit=1",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            },
          },
        );

        const responseText = await response.text();
        console.log("Response status:", response.status);
        console.log("Response text:", responseText);

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { text: responseText };
        }

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `API Key validation failed: ${response.status} ${response.statusText}`,
              details: {
                errorType: responseData.error?.type || "Authentication Error",
                suggestion:
                  "Check that your Stripe API key is valid and has the correct permissions",
                details: responseData,
              },
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "API keys are valid",
            data: responseData,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      } catch (error) {
        console.error("Error in validateKeys:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Error validating API keys: ${error.message}`,
            details: {
              errorType: "Execution Error",
              suggestion:
                "Check your network connection and API key configuration",
              details: error.toString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    // Invalid action
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid action specified",
        details: {
          errorType: "Input Error",
          suggestion:
            "Specify a valid action: validateKeys, createPaymentIntent, checkConnectivity, or showExpiredKeyError",
          details: `Received action: ${action}`,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error processing request: ${error.message}`,
        details: {
          errorType: "Server Error",
          suggestion: "Check your request format and try again",
          details: error.toString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
