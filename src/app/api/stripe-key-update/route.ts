import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    // Get user info from auth if available
    const supabase = createClient();
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

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Call the Edge Function to test Stripe keys
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-test-stripe-keys",
      {
        body: {
          action: action || "validateKeys",
        },
      },
    );

    if (error) {
      console.error("Error invoking test-stripe-keys function:", error);
      return NextResponse.json(
        { error: error.message || "Failed to test Stripe keys" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error testing Stripe keys:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to test Stripe keys",
      },
      { status: 500 },
    );
  }
}
