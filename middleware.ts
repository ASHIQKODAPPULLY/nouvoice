import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("✅ Middleware running");
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Get and set the session - this ensures the session cookie is properly set
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Log session details for debugging
  console.log(
    "✅ Middleware session check:",
    session ? "Session found" : "No session found",
  );

  if (session) {
    // Explicitly refresh the session to ensure the cookie is properly set
    await supabase.auth.refreshSession();
    console.log("✅ Session refreshed in middleware");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
