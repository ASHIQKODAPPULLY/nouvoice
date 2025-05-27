// Edge function to list Stripe API secrets
import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const {
      scopeType = "account",
      userId,
      limit = 10,
      startingAfter,
      endingBefore,
    } = await req.json();

    // Get environment variables
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required Pica environment variables",
          details: {
            errorType: "Configuration Error",
            suggestion:
              "Ensure PICA_SECRET_KEY and PICA_STRIPE_CONNECTION_KEY are set in your environment",
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("scope[type]", scopeType);

    if (scopeType === "user" && userId) {
      queryParams.append("scope[user]", userId);
    }

    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    if (startingAfter) {
      queryParams.append("starting_after", startingAfter);
    }

    if (endingBefore) {
      queryParams.append("ending_before", endingBefore);
    }

    // Construct the URL with query parameters
    const url = `https://api.picaos.com/v1/passthrough/apps/secrets?${queryParams.toString()}`;

    // Make the request to Pica Passthrough API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GCmLL-J1uYs::BOMcYIBiQCyGFTORilN5GQ",
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
          error: `Failed to list Stripe secrets: ${response.status} ${response.statusText}`,
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
        message: "Successfully retrieved Stripe secrets",
        data: responseData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error listing Stripe secrets:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Error listing Stripe secrets: ${error.message}`,
        details: {
          errorType: "Execution Error",
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
