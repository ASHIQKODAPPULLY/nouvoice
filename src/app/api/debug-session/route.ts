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

    // Check for specific Supabase auth cookies - expand the search patterns
    const hasSupabaseAuthCookie = allCookies.some(
      (c) =>
        c.name.includes("supabase") ||
        c.name.includes("sb-") ||
        c.name.includes("auth") ||
        c.name === "sb-auth-token",
    );

    // Log specific cookie details for debugging
    const authCookies = allCookies.filter(
      (c) =>
        c.name.includes("supabase") ||
        c.name.includes("sb-") ||
        c.name.includes("auth"),
    );

    if (authCookies.length > 0) {
      console.log(
        "🔑 Auth cookies found:",
        authCookies.map((c) => c.name),
      );
    } else {
      console.log("⚠️ No auth cookies found");
    }

    // Get the session directly to check authentication status
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Try to refresh the session
    let refreshResult = null;
    try {
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession();
      refreshResult = {
        success: !refreshError,
        hasSession: !!refreshData.session,
        error: refreshError?.message || null,
      };
    } catch (refreshException) {
      refreshResult = {
        success: false,
        error: refreshException.message,
      };
    }

    console.log(
      "🔑 Debug route - Session check:",
      session ? "Session found" : "No session found",
    );

    if (sessionError) {
      console.error("❌ Debug route - Auth error:", sessionError);
    }

    // Check environment variables (without exposing values)
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    };

    return NextResponse.json({
      cookieCount: allCookies.length,
      hasSupabaseAuthCookie,
      cookieNames: allCookies.map((c) => c.name),
      hasSession: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      error: sessionError?.message || null,
      refreshResult,
      envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in debug-session route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
