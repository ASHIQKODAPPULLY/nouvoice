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

        // Key is valid, now update it in Vercel environment variables
        // Note: In a real implementation, this would call a secure API to update the environment variable
        // For this demo, we'll simulate success but note that actual implementation requires Vercel API integration

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
          message:
            "Stripe Secret Key validated successfully. To complete the rotation, please update your Vercel environment variables with this new key.",
          instructions: [
            "1. Go to your Vercel Dashboard",
            "2. Select your project",
            "3. Navigate to Settings > Environment Variables",
            "4. Update the STRIPE_SECRET_KEY variable with your new key",
            "5. Redeploy your application to apply the changes",
          ],
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
