import { corsHeaders } from "@shared/cors.ts";
import {
  verifyKeyFormat,
  getKeyType,
  interpretStripeError,
} from "@shared/stripe-diagnostics.ts";

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

    console.log("Received request with:", {
      priceId: priceId ? `${priceId.substring(0, 10)}...` : "undefined",
      returnUrl: returnUrl || "undefined",
      userId: userId ? `${userId.substring(0, 5)}...` : "undefined",
    });

    if (!priceId || typeof priceId !== "string") {
      console.error("Invalid price ID:", priceId);
      return new Response(JSON.stringify({ error: "Invalid price ID" }), {
        status: 400,
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

    // Validate API keys if available
    if (!picaSecretKey || picaSecretKey.trim() === "") {
      console.error("PICA_SECRET_KEY is missing or empty");
      return new Response(
        JSON.stringify({
          error: "Missing required API credentials",
          details: "PICA_SECRET_KEY is missing or empty",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!picaConnectionKey || picaConnectionKey.trim() === "") {
      console.error("PICA_STRIPE_CONNECTION_KEY is missing or empty");
      return new Response(
        JSON.stringify({
          error: "Missing required API credentials",
          details: "PICA_STRIPE_CONNECTION_KEY is missing or empty",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create form body for Pica API
    const formBody = new URLSearchParams();
    formBody.append("mode", "subscription");
    formBody.append("line_items[0][price]", priceId);
    formBody.append("line_items[0][quantity]", "1");

    // Use absolute URLs for success and cancel URLs
    const siteUrl =
      returnUrl || Deno.env.get("SITE_URL") || "https://nouvoice.com.au";
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
      "x-pica-secret": picaSecretKey,
      "x-pica-connection-key": picaConnectionKey,
      "x-pica-action-id": picaActionId,
    };

    console.log("Request headers prepared:", {
      "Content-Type": headers["Content-Type"],
      "x-pica-secret": headers["x-pica-secret"] ? "present" : "missing",
      "x-pica-connection-key": headers["x-pica-connection-key"]
        ? "present"
        : "missing",
      "x-pica-action-id": headers["x-pica-action-id"],
    });

    // Log the full URL and request details for debugging
    console.log(
      "Making request to:",
      "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
    );

    try {
      const response = await fetch(
        "https://api.picaos.com/v1/passthrough/v1/checkout/sessions",
        {
          method: "POST",
          headers: headers,
          body: formBody.toString(),
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

      if (!response.ok) {
        let errorData;
        let errorText;
        try {
          errorData = await response.json();
          console.error(
            "Pica API error response JSON:",
            JSON.stringify(errorData),
          );
        } catch (e) {
          try {
            errorText = await response.text();
            console.error("Pica API error response text:", errorText);
            errorData = { message: errorText };
          } catch (textError) {
            console.error("Failed to read error response:", textError);
            errorData = { message: "Failed to read error response" };
          }
        }

        // Log detailed error information
        console.error("Checkout session creation failed:", {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          error: errorData,
        });

        // Try to interpret Stripe errors
        const interpretedError = interpretStripeError(errorData);
        console.log("Interpreted error:", interpretedError);

        // Return a 200 response with error details instead of forwarding the error status
        // This prevents the Edge Function from returning a non-2xx status code
        return new Response(
          JSON.stringify({
            error: "Failed to create checkout session",
            details: errorData,
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

      const sessionData = await response.json();
      console.log("Checkout session created successfully");

      return new Response(JSON.stringify({ url: sessionData.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
