import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Log all available cookies (names only for security)
    const allCookies = cookieStore.getAll();
    console.log(
      "🍪 Debug route - Available cookies:",
      allCookies.map((c) => ({
        name: c.name,
        path: c.path,
        secure: c.secure,
        sameSite: c.sameSite,
        httpOnly: c.httpOnly !== false,
      })),
    );

    // Check for specific Supabase auth cookies
    const hasSupabaseAuthCookie = allCookies.some(
      (c) => c.name.includes("supabase") && c.name.includes("auth"),
    );

    // Get the session directly to check authentication status
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log(
      "🔑 Debug route - Session check:",
      session ? "Session found" : "No session found",
    );

    if (sessionError) {
      console.error("❌ Debug route - Auth error:", sessionError);
    }

    return NextResponse.json({
      cookieCount: allCookies.length,
      hasSupabaseAuthCookie,
      cookieNames: allCookies.map((c) => c.name),
      hasSession: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      error: sessionError?.message || null,
    });
  } catch (error) {
    console.error("Error in debug-session route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
