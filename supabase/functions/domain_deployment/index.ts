// Edge function to deploy Next.js app to nouvoice.com.au and update Stripe webhook

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
    const { action } = await req.json();

    if (action === "create_webhook") {
      return await createStripeWebhook();
    } else if (action === "list_webhooks") {
      return await listStripeWebhooks();
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid action. Use 'create_webhook' or 'list_webhooks'.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function createStripeWebhook() {
  const url = "https://api.picaos.com/v1/passthrough/v1/webhook_endpoints";

  // Get environment variables
  const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
  const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

  if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  // Create form data for the request
  const formData = new URLSearchParams();
  formData.append("url", "https://nouvoice.com.au/api/webhook");
  // Note: Ensure the URL is correct - 'nouvoice.com.au' not 'nouvice.com.au'
  formData.append("enabled_events[]", "charge.succeeded");
  formData.append("enabled_events[]", "charge.failed");
  formData.append("enabled_events[]", "checkout.session.completed");
  formData.append("enabled_events[]", "invoice.paid");
  formData.append("enabled_events[]", "invoice.payment_failed");
  formData.append("enabled_events[]", "customer.subscription.updated");
  formData.append("enabled_events[]", "customer.subscription.deleted");
  formData.append("description", "Subscription management webhook");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
        "x-pica-action-id":
          "conn_mod_def::GCmLJhrfFi-0::LBWqKTZ8SvqQDLQNmt0xwg",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create webhook: ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();

    // Return the webhook secret and other details
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook created successfully",
        webhookId: data.id,
        webhookSecret: data.secret,
        webhookUrl: data.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error creating webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create webhook",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}

async function listStripeWebhooks() {
  const url = "https://api.picaos.com/v1/passthrough/v1/webhook_endpoints";

  // Get environment variables
  const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
  const PICA_STRIPE_CONNECTION_KEY = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

  if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing required environment variables" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-pica-secret": PICA_SECRET_KEY,
        "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
        "x-pica-action-id": "conn_mod_def::GCmLikqQKk0::i-QPgg6gQ5yQzlVX_Uxz7A",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to list webhooks: ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to list webhooks",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
}
