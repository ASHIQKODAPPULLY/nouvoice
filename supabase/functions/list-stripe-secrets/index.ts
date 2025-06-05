import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      scopeType = "account",
      scopeUser,
      limit = 10,
      startingAfter,
      endingBefore,
    } = await req.json();

    // Create query parameters for the request
    const params = new URLSearchParams();
    params.append("scope[type]", scopeType);

    if (scopeType === "user" && scopeUser) {
      params.append("scope[user]", scopeUser);
    }

    if (limit) {
      params.append("limit", limit.toString());
    }

    if (startingAfter) {
      params.append("starting_after", startingAfter);
    }

    if (endingBefore) {
      params.append("ending_before", endingBefore);
    }

    // Call the Pica passthrough API to list secrets
    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/apps/secrets?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLL-J1uYs::BOMcYIBiQCyGFTORilN5GQ",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to list Stripe secrets",
          details: data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in list-stripe-secrets function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred while listing secrets",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
