// Edge function to create a Stripe billing portal session

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
    const { customerId, returnUrl } = await req.json();

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    // Validate customerId format to prevent injection attacks
    const validCustomerIdPattern = /^cus_[a-zA-Z0-9]+$/;
    if (!validCustomerIdPattern.test(customerId)) {
      throw new Error("Invalid customer ID format");
    }

    // Get environment variables
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_STRIPE_CONNECTION_KEY = Deno.env.get(
      "PICA_STRIPE_CONNECTION_KEY",
    );

    if (!PICA_SECRET_KEY || !PICA_STRIPE_CONNECTION_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Sanitize and validate return URL
    let validatedReturnUrl = returnUrl;
    if (!returnUrl) {
      validatedReturnUrl = "http://localhost:3000/account";
    }

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append("customer", customerId);
    formData.append("return_url", validatedReturnUrl);

    // Make the request to create a billing portal session
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_STRIPE_CONNECTION_KEY,
          "x-pica-action-id":
            "conn_mod_def::GCmLiDlS_F4::q8-k9dMmTUecBifQkkMQLA",
        },
        body: formData.toString(),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create billing portal session: ${errorData.error || response.statusText}`,
      );
    }

    const data = await response.json();

    // Return the session URL
    return new Response(
      JSON.stringify({
        url: data.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create billing portal session",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
