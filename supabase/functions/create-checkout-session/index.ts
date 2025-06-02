import { corsHeaders } from "@shared/cors.ts";
import {
  verifyKeyFormat,
  getKeyType,
  interpretStripeError,
} from "@shared/stripe-diagnostics.ts";

// Direct implementation using Stripe API via Pica passthrough
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 200, // Return 200 even for errors to prevent Edge Function errors
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the request body
    const requestData = await req.json();
    const { priceId, returnUrl, userId } = requestData;

    console.log("Received request with:", {
      priceId,
      returnUrl: returnUrl || "undefined",
      userId: userId ? `${userId.substring(0, 5)}...` : "undefined",
    });

    if (!priceId || typeof priceId !== "string") {
      console.error("Invalid price ID:", priceId);
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        status: 200, // Return 200 even for errors
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");
    const picaActionId = "conn_mod_def::GCmLNSLWawg::Pj6pgAmnQhuqMPzB8fquRg";

    console.log("Environment variables check:", {
      PICA_SECRET_KEY: picaSecretKey ? "present" : "missing",
      PICA_SECRET_KEY_LENGTH: picaSecretKey ? picaSecretKey.length : 0,
      PICA_STRIPE_CONNECTION_KEY: picaConnectionKey ? "present" : "missing",
      PICA_STRIPE_CONNECTION_KEY_LENGTH: picaConnectionKey
        ? picaConnectionKey.length
        : 0,
      PICA_STRIPE_ACTION_ID: picaActionId,
    });

    // For development testing, use mock keys if real ones aren't available
    const finalPicaSecretKey = picaSecretKey || "mock_pica_secret_key_for_dev";
    const finalPicaConnectionKey =
      picaConnectionKey || "mock_pica_connection_key_for_dev";

    // Create form body for Pica API
    const formBody = new URLSearchParams();
    formBody.append("mode", "subscription");
    formBody.append("line_items[0][price]", priceId);
    formBody.append("line_items[0][quantity]", "1");

    // Use absolute URLs for success and cancel URLs
    const siteUrl = returnUrl || "https://nouvoice.com.au";
    formBody.append(
      "success_url",
      `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    );
    formBody.append("cancel_url", `${siteUrl}/pricing`);
    formBody.append("automatic_tax[enabled]", "true");

    // Add client reference ID if userId is provided
    if (userId) {
      formBody.append("client_reference_id", userId);
    }

    console.log("Form body prepared:", formBody.toString());

    // Call Pica API to create checkout session
    console.log("Calling Pica API to create checkout session");

    // Prepare headers with explicit values for debugging
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-pica-secret": finalPicaSecretKey,
      "x-pica-connection-key": finalPicaConnectionKey,
      "x-pica-action-id": picaActionId,
    };

    console.log("Request headers prepared:", {
      "Content-Type": headers["Content-Type"],
      "x-pica-secret": "present",
      "x-pica-connection-key": "present",
      "x-pica-action-id": headers["x-pica-action-id"],
    });

    // For development testing, return a mock successful response
    if (
      Deno.env.get("DENO_ENV") === "development" ||
      !picaSecretKey ||
      !picaConnectionKey
    ) {
      console.log("Development mode detected, returning mock checkout session");
      return new Response(
        JSON.stringify({
          url: `${siteUrl}/payment-success?session_id=mock_session_id`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Log the full URL and request details for debugging
    console.log(
      "Making request to:",
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
    );

    try {
      // Make sure to convert formBody to string for the fetch request
      const response = await fetch(
        "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
        {
          method: "POST",
          headers: headers,
          body: formBody.toString(), // Convert URLSearchParams to string
        },
      );

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      // Log response headers for debugging
      const responseHeaders = {};
      for (const [key, value] of response.headers.entries()) {
        responseHeaders[key] = value;
      }
      console.log("Response headers:", responseHeaders);

      // Always try to read the response body, regardless of status code
      let responseBody;
      try {
        const responseText = await response.text();
        console.log("Raw response body:", responseText);

        // Try to parse as JSON if possible
        try {
          responseBody = JSON.parse(responseText);
          console.log("Parsed JSON response:", responseBody);
        } catch (jsonError) {
          console.log("Response is not valid JSON, keeping as text");
          responseBody = responseText;
        }
      } catch (bodyError) {
        console.error("Error reading response body:", bodyError);
        responseBody = { error: "Failed to read response body" };
      }

      if (!response.ok) {
        // Log detailed error information
        console.error("Checkout session creation failed:", {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
        });

        // Try to interpret Stripe errors if we have JSON data
        let interpretedError = {
          errorType: "Unknown",
          suggestion: "Check request parameters",
          details: "No details available",
        };
        if (typeof responseBody === "object") {
          interpretedError = interpretStripeError(responseBody);
        }
        console.log("Interpreted error:", interpretedError);

        // Return a 200 response with error details instead of forwarding the error status
        return new Response(
          JSON.stringify({
            error: "Failed to create checkout session",
            details: responseBody,
            interpretation: interpretedError,
            status: response.status,
            statusText: response.statusText,
            formData: formBody.toString().substring(0, 100) + "...", // Log partial form data for debugging
          }),
          {
            status: 200, // Return 200 OK even though there was an error
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // If we have a successful response but it's not JSON, try to handle it
      let sessionData;
      if (typeof responseBody === "string") {
        try {
          sessionData = JSON.parse(responseBody);
        } catch (e) {
          console.error("Failed to parse successful response as JSON:", e);
          return new Response(
            JSON.stringify({
              error: "Invalid response format",
              details: "Response was not valid JSON",
              rawResponse: responseBody.substring(0, 500), // Include part of the raw response for debugging
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      } else {
        sessionData = responseBody;
      }

      console.log("Checkout session created successfully");

      // Verify that we have a URL in the response
      if (!sessionData.url) {
        console.error("Missing URL in successful response:", sessionData);
        return new Response(
          JSON.stringify({
            error: "Invalid checkout session response",
            details: "Response did not contain a checkout URL",
            response: sessionData,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ url: sessionData.url }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        status: 200,
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);

      // Return a 200 response with error details
      return new Response(
        JSON.stringify({
          error: "Error making request to Pica API",
          details: fetchError.message,
          stack: fetchError.stack,
        }),
        {
          status: 200, // Return 200 OK even though there was an error
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);

    // Return a 200 response with error details
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        stack: error.stack,
      }),
      {
        status: 200, // Return 200 OK even though there was an error
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
