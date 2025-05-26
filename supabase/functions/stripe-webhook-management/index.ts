// Stripe Webhook Management Edge Function

interface WebhookRequest {
  action: "create" | "update" | "delete" | "list";
  url?: string;
  webhookId?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// URL validation regex - only accept HTTPS URLs
const validUrlPattern =
  /^https:\/\/[\w.-]+(\.[\w.-]+)+([\w\-._~:/?#[\]@!$&'()*+,;=])*$/;

// Webhook ID validation regex
const validWebhookIdPattern = /^we_[a-zA-Z0-9]+$/;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Verify required environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaConnectionKey = Deno.env.get("PICA_STRIPE_CONNECTION_KEY");

    if (!picaSecretKey || !picaConnectionKey) {
      throw new Error("Missing required configuration for webhook management");
    }

    const { action, url, webhookId } = (await req.json()) as WebhookRequest;

    // Fix URL if it contains typo 'nouvice.com.au'
    let correctedUrl = url;
    if (url && url.includes("nouvice.com.au")) {
      correctedUrl = url.replace("nouvice.com.au", "nouvoice.com.au");
      console.log(`Corrected URL from ${url} to ${correctedUrl}`);
    }

    // Define the events we want to listen for
    const enabledEvents = [
      "checkout.session.completed",
      "invoice.paid",
      "invoice.payment_failed",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ];

    let response;
    let requestConfig: RequestInit;
    let endpoint: string;

    switch (action) {
      case "list":
        requestConfig = {
          method: "GET",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLikqQKk0::i-QPgg6gQ5yQzlVX_Uxz7A",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        };

        endpoint = "https://api.picaos.com/v1/passthrough/v1/webhook_endpoints";
        break;

      case "create":
        if (!correctedUrl) {
          throw new Error("URL is required for creating a webhook endpoint");
        }

        // Validate URL format and ensure it's HTTPS
        if (!validUrlPattern.test(correctedUrl)) {
          throw new Error("Invalid URL format. Must be a valid HTTPS URL.");
        }

        const createBody = new URLSearchParams();
        createBody.append("url", correctedUrl);
        enabledEvents.forEach((event) =>
          createBody.append("enabled_events[]", event),
        );
        createBody.append("description", "Subscription management webhook");

        requestConfig = {
          method: "POST",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLJhrfFi-0::LBWqKTZ8SvqQDLQNmt0xwg",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: createBody.toString(),
        };

        endpoint = "https://api.picaos.com/v1/passthrough/v1/webhook_endpoints";
        break;

      case "update":
        if (!webhookId || !correctedUrl) {
          throw new Error(
            "Webhook ID and URL are required for updating a webhook endpoint",
          );
        }

        // Validate webhook ID format
        if (!validWebhookIdPattern.test(webhookId)) {
          throw new Error("Invalid webhook ID format");
        }

        // Validate URL format and ensure it's HTTPS
        if (!validUrlPattern.test(correctedUrl)) {
          throw new Error("Invalid URL format. Must be a valid HTTPS URL.");
        }

        const updateBody = new URLSearchParams();
        updateBody.append("url", correctedUrl);
        enabledEvents.forEach((event) =>
          updateBody.append("enabled_events[]", event),
        );

        requestConfig = {
          method: "POST",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLiDlS_F4::q8-k9dMmTUecBifQkkMQLA",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: updateBody.toString(),
        };

        endpoint = `https://api.picaos.com/v1/passthrough/v1/webhook_endpoints/${webhookId}`;
        break;

      case "delete":
        if (!webhookId) {
          throw new Error(
            "Webhook ID is required for deleting a webhook endpoint",
          );
        }

        // Validate webhook ID format
        if (!validWebhookIdPattern.test(webhookId)) {
          throw new Error("Invalid webhook ID format");
        }

        requestConfig = {
          method: "DELETE",
          headers: {
            "x-pica-secret": picaSecretKey,
            "x-pica-connection-key": picaConnectionKey,
            "x-pica-action-id":
              "conn_mod_def::GCmLhONdzxA::Wutzkm_zQNG6POIQCbI3dQ",
            "Content-Type": "application/json",
          },
        };

        endpoint = `https://api.picaos.com/v1/passthrough/v1/webhook_endpoints/${webhookId}`;
        break;

      default:
        throw new Error(
          "Invalid action. Must be one of: create, update, delete, list",
        );
    }

    try {
      response = await fetch(endpoint, requestConfig);
      const data = await response.json();

      // Check for API errors
      if (!response.ok) {
        console.error("API error:", data);
        return new Response(
          JSON.stringify({ error: "Error managing webhook endpoint" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: response.status,
          },
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: response.status,
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error("Failed to communicate with webhook management API");
    }
  } catch (error: any) {
    console.error("Webhook management error:", error);

    // Return a generic error message without exposing internal details
    return new Response(
      JSON.stringify({
        error: "Failed to process webhook management request",
        code: error.name || "ERROR",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
