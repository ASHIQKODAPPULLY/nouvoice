import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "Missing session_id parameter" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Direct API request to Stripe to retrieve checkout session
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY") ?? ""}`,
        },
      },
    );

    if (!stripeResponse.ok) {
      const errorBody = await stripeResponse.text();
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve Stripe session",
          details: errorBody,
        }),
        {
          status: stripeResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const sessionData = await stripeResponse.json();

    return new Response(JSON.stringify({ session: sessionData }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
