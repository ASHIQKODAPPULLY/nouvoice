import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const plan = searchParams.get("plan") || "free";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // If the plan is 'pro', redirect to checkout
    if (plan === "pro") {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }

    // Otherwise redirect to dashboard
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Return 400 if code is not available
  return NextResponse.json({ error: "No code provided" }, { status: 400 });
}
