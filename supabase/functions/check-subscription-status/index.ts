import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { email, stripeCustomerId } = await req.json();

    if (!email && !stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: "Missing email or Stripe customer ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let customerId = stripeCustomerId;

    // If we don't have a customer ID, we need to find the customer by email first
    if (!customerId && email) {
      const customerUrl = new URL(
        "https://api.picaos.com/v1/passthrough/v1/customers",
      );
      customerUrl.searchParams.append("email", email);

      const customerResponse = await fetch(customerUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
          "x-pica-connection-key":
            Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "",
          "x-pica-action-id":
            "conn_mod_def::GCmLJH3d-hI::FWLkWoqcTCSLivbkEFylDQ",
        },
      });

      if (!customerResponse.ok) {
        return new Response(JSON.stringify({ hasActiveFreePlan: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const customerData = await customerResponse.json();
      if (customerData.data && customerData.data.length > 0) {
        customerId = customerData.data[0].id;
      } else {
        return new Response(JSON.stringify({ hasActiveFreePlan: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Now check subscriptions for this customer
    const subscriptionUrl = new URL(
      "https://api.picaos.com/v1/passthrough/v1/subscriptions",
    );
    subscriptionUrl.searchParams.append("customer", customerId);

    const response = await fetch(subscriptionUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-pica-secret": Deno.env.get("PICA_SECRET_KEY") || "",
        "x-pica-connection-key":
          Deno.env.get("PICA_STRIPE_CONNECTION_KEY") || "",
        "x-pica-action-id": "conn_mod_def::GCmLJH3d-hI::FWLkWoqcTCSLivbkEFylDQ",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stripe API error:", errorText);
      return new Response(JSON.stringify({ hasActiveFreePlan: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptions = await response.json();

    // Check if user has an active free plan subscription
    // Free plan is identified by price ID "free" or amount 0
    const hasActiveFreePlan =
      subscriptions.data &&
      subscriptions.data.some(
        (sub) =>
          sub.status === "active" &&
          sub.items.data.some(
            (item) =>
              item.plan.amount === 0 ||
              item.plan.id === "free" ||
              item.price?.id === "free",
          ),
      );

    return new Response(JSON.stringify({ hasActiveFreePlan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        hasActiveFreePlan: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
