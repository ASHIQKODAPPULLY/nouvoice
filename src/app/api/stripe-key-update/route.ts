import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, newKey } = await request.json();

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

    // Handle key rotation if requested
    if (action === "rotateKey" && newKey) {
      try {
        // First validate the new key by making a test API call
        const testResponse = await fetch(
          "https://api.stripe.com/v1/customers?limit=1",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newKey}`,
            },
          },
        );

        if (!testResponse.ok) {
          const errorData = await testResponse.json();
          return NextResponse.json(
            {
              success: false,
              error: "Invalid Stripe key. Please check the key and try again.",
              details: errorData,
            },
            { status: 400 },
          );
        }

        // Key is valid, now update it using the Pica passthrough API
        const params = new URLSearchParams();
        params.append("name", "stripe_secret_key");
        params.append("payload", newKey);
        params.append("scope[type]", "account");

        // Call the Edge Function to set the secret
        const { data: secretData, error: secretError } =
          await supabase.functions.invoke(
            "supabase-functions-stripe-key-update",
            {
              body: {
                name: "stripe_secret_key",
                payload: newKey,
                scopeType: "account",
              },
            },
          );

        if (secretError) {
          console.error("Error setting Stripe secret:", secretError);
          return NextResponse.json(
            { error: secretError.message || "Failed to set Stripe secret" },
            { status: 500 },
          );
        }

        // Call the Edge Function to test the new key
        const { data: testData, error: testError } =
          await supabase.functions.invoke(
            "supabase-functions-test-stripe-keys",
            {
              body: {
                action: "validateKeys",
                testKey: newKey, // Pass the new key for testing
              },
            },
          );

        if (testError) {
          console.error("Error testing new Stripe key:", testError);
          return NextResponse.json(
            { error: testError.message || "Failed to validate new Stripe key" },
            { status: 500 },
          );
        }

        return NextResponse.json({
          success: true,
          message: "Stripe Secret Key validated and stored successfully.",
          secretData,
          testResults: testData,
        });
      } catch (rotateError: any) {
        console.error("Error rotating Stripe key:", rotateError);
        return NextResponse.json(
          {
            success: false,
            error: rotateError.message || "Failed to rotate Stripe key",
          },
          { status: 500 },
        );
      }
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
