// Edge function to test Stripe API keys and subscription functionality
import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const {
      action,
      amount = 2000,
      currency = "usd",
      testKey,
      paymentIntentId,
      clientSecret,
    } = await req.json();

    // Get environment variables
    const STRIPE_SECRET_KEY = testKey || Deno.env.get("STRIPE_SECRET_KEY");
    const STRIPE_PUBLIC_KEY = Deno.env.get("STRIPE_PUBLIC_KEY");
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

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

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required Pica environment variables",
          details: {
            errorType: "Configuration Error",
            suggestion:
              "Ensure PICA_SECRET_KEY and PICA_STRIPE_CONNECTION_KEY are set in your environment",
            details: "Required Pica environment variables are not configured",
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

    // Check connectivity to Stripe API using Pica Passthrough
    if (action === "checkConnectivity") {
      try {
        const response = await fetch(
          "https://api.picaos.com/v1/passthrough/customers?limit=1",
          {
            method: "GET",
            headers: {
              "x-pica-secret": PICA_SECRET_KEY,
              "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
              "x-pica-action-id":
                "conn_mod_def::GCmLP3yB4Mg::rCRiTSApTyy-gb44BkTwPw",
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        const responseText = await response.text();
        return new Response(
          JSON.stringify({
            success: response.ok,
            message: response.ok
              ? "Successfully connected to Stripe API via Pica Passthrough"
              : "Failed to connect to Stripe API via Pica Passthrough",
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

    // Create a test payment intent to validate keys using Pica Passthrough
    if (action === "createPaymentIntent") {
      try {
        const formData = new URLSearchParams();
        formData.append("amount", amount.toString());
        formData.append("currency", currency);
        formData.append("automatic_payment_methods[enabled]", "true");

        const response = await fetch(
          "https://api.picaos.com/v1/passthrough/payment_intents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "x-pica-secret": PICA_SECRET_KEY,
              "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
              "x-pica-action-id":
                "conn_mod_def::GCmLP3yB4Mg::rCRiTSApTyy-gb44BkTwPw",
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

    // Validate API keys by creating a payment intent using Pica Passthrough
    if (action === "validateKeys") {
      try {
        const formData = new URLSearchParams();
        formData.append("amount", "100");
        formData.append("currency", "usd");
        formData.append("automatic_payment_methods[enabled]", "true");

        const response = await fetch(
          "https://api.picaos.com/v1/passthrough/payment_intents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "x-pica-secret": PICA_SECRET_KEY,
              "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
              "x-pica-action-id":
                "conn_mod_def::GCmLP3yB4Mg::rCRiTSApTyy-gb44BkTwPw",
            },
            body: formData.toString(),
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
              keyType: STRIPE_SECRET_KEY.startsWith("sk_test")
                ? "Test Key"
                : "Live Key",
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
            keyType: STRIPE_SECRET_KEY.startsWith("sk_test")
              ? "Test Key"
              : "Live Key",
            data: {
              paymentIntentId: responseData.id,
              clientSecret: responseData.client_secret,
              status: responseData.status,
              livemode: responseData.livemode,
            },
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
            keyType: STRIPE_SECRET_KEY.startsWith("sk_test")
              ? "Test Key"
              : "Live Key",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    // Verify a specific payment intent using Pica Passthrough
    if (action === "verifyPaymentIntent" && paymentIntentId && clientSecret) {
      try {
        const url = `https://api.picaos.com/v1/passthrough/payment_intents/${encodeURIComponent(paymentIntentId)}?client_secret=${encodeURIComponent(clientSecret)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "x-pica-secret": PICA_SECRET_KEY,
            "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
            "x-pica-action-id":
              "conn_mod_def::GCmLP3yB4Mg::rCRiTSApTyy-gb44BkTwPw",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const responseText = await response.text();
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
              error: `Payment Intent verification failed: ${response.status} ${response.statusText}`,
              details: responseData,
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
            message: "Payment Intent verified successfully",
            data: responseData,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      } catch (error) {
        console.error("Error in verifyPaymentIntent:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Error verifying Payment Intent: ${error.message}`,
            details: error.toString(),
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
            "Specify a valid action: validateKeys, createPaymentIntent, checkConnectivity, verifyPaymentIntent, or showExpiredKeyError",
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
