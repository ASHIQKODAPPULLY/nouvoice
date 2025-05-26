import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, webhookId } = body;
    let { url } = body;

    // Validate required parameters based on action
    if (action === "create" && !url) {
      return NextResponse.json(
        { error: "URL is required for creating a webhook endpoint" },
        { status: 400 },
      );
    }

    if (action === "update" && (!webhookId || !url)) {
      return NextResponse.json(
        {
          error:
            "Webhook ID and URL are required for updating a webhook endpoint",
        },
        { status: 400 },
      );
    }

    if (action === "delete" && !webhookId) {
      return NextResponse.json(
        { error: "Webhook ID is required for deleting a webhook endpoint" },
        { status: 400 },
      );
    }

    // Fix URL if it contains typo 'npouvoice.com.au' or 'nouvice.com.au'
    if (url) {
      if (url.includes("npouvoice.com.au")) {
        url = url.replace("npouvoice.com.au", "nouvoice.com.au");
      }
      if (url.includes("nouvice.com.au")) {
        url = url.replace("nouvice.com.au", "nouvoice.com.au");
      }
    }

    // Get user info from auth if available
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Call the edge function to manage webhook endpoints
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-stripe-webhook-management",
      {
        body: { action, url, webhookId },
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error managing webhook endpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
