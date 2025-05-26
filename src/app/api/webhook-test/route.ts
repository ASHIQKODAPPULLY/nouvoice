import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    // Get user info from auth if available
    const supabase = createClient();

    // Call the edge function to manage webhook endpoints
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-domain_deployment",
      {
        body: { action: action || "list_webhooks" },
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error testing webhooks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
