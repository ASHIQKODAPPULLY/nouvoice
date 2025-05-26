import { createClient } from "@/lib/supabase/client";

export interface WebhookEndpoint {
  id: string;
  object: string;
  url: string;
  enabled_events: string[];
  status: string;
  created: number;
  secret?: string;
}

export async function createWebhookEndpoint(
  url: string,
): Promise<WebhookEndpoint> {
  // Validate URL format
  if (!url || !url.startsWith("https://")) {
    throw new Error("Invalid webhook URL. Must use HTTPS protocol.");
  }

  // Fix URL if it contains typo 'npouvoice.com.au' or 'nouvice.com.au'
  if (url.includes("npouvoice.com.au")) {
    url = url.replace("npouvoice.com.au", "nouvoice.com.au");
  }
  if (url.includes("nouvice.com.au")) {
    url = url.replace("nouvice.com.au", "nouvoice.com.au");
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-webhook-management",
      {
        body: { action: "create", url },
      },
    );

    if (error) {
      console.error("Webhook creation error:", error);
      throw new Error(`Failed to create webhook endpoint`);
    }

    if (!data) {
      throw new Error("No data returned from webhook creation");
    }

    return data;
  } catch (err: any) {
    console.error("Webhook creation exception:", err);
    throw new Error(`Error creating webhook endpoint: ${err.message}`);
  }
}

export async function updateWebhookEndpoint(
  webhookId: string,
  url: string,
): Promise<WebhookEndpoint> {
  // Validate webhook ID format
  if (!webhookId || !webhookId.startsWith("we_")) {
    throw new Error("Invalid webhook ID format");
  }

  // Validate URL format
  if (!url || !url.startsWith("https://")) {
    throw new Error("Invalid webhook URL. Must use HTTPS protocol.");
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-webhook-management",
      {
        body: { action: "update", webhookId, url },
      },
    );

    if (error) {
      console.error("Webhook update error:", error);
      throw new Error(`Failed to update webhook endpoint`);
    }

    if (!data) {
      throw new Error("No data returned from webhook update");
    }

    return data;
  } catch (err: any) {
    console.error("Webhook update exception:", err);
    throw new Error(`Error updating webhook endpoint: ${err.message}`);
  }
}

export async function deleteWebhookEndpoint(
  webhookId: string,
): Promise<{ id: string; object: string; deleted: boolean }> {
  // Validate webhook ID format
  if (!webhookId || !webhookId.startsWith("we_")) {
    throw new Error("Invalid webhook ID format");
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-webhook-management",
      {
        body: { action: "delete", webhookId },
      },
    );

    if (error) {
      console.error("Webhook deletion error:", error);
      throw new Error(`Failed to delete webhook endpoint`);
    }

    if (!data) {
      throw new Error("No data returned from webhook deletion");
    }

    return data;
  } catch (err: any) {
    console.error("Webhook deletion exception:", err);
    throw new Error(`Error deleting webhook endpoint: ${err.message}`);
  }
}
