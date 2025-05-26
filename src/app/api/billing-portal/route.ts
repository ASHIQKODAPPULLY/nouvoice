import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get the user's subscription to find their customer ID
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    const customerId = subscription.stripe_customer_id;

    // Call the Edge Function to create a billing portal session
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-create-billing-portal",
      {
        body: {
          customerId,
          returnUrl:
            request.headers.get("origin") || "http://localhost:3000/account",
        },
      },
    );

    if (error) {
      console.error("Error creating billing portal session:", error);
      return NextResponse.json(
        { error: "Failed to create billing portal session" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Unexpected error creating billing portal session:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
