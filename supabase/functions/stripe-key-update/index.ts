import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, payload, scopeType, scopeUser, expiresAt } = await req.json();

    if (!name || !payload || !scopeType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters: name, payload, or scopeType",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create form data for the request
    const params = new URLSearchParams();
    params.append("name", name);
    params.append("payload", payload);
    params.append("scope[type]", scopeType);

    if (scopeType === "user" && scopeUser) {
      params.append("scope[user]", scopeUser);
    }

    if (expiresAt) {
      params.append("expires_at", expiresAt.toString());
    }

    // Call the Pica passthrough API to set the secret
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/apps/secrets",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLMrEc5Q0::-f5ubHYTSi2nRU7fMdCGkQ",
        },
        body: params,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to set Stripe secret",
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
    console.error("Error in stripe-key-update function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred during key update",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
