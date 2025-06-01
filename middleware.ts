import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Add debugging log to verify middleware execution
  console.log("✅ Middleware executed for", pathname);

  // Allow Supabase auth callback to proceed without redirection
  if (pathname.startsWith("/auth/callback")) {
    console.log("Middleware: allowing auth callback to proceed");
    return NextResponse.next();
  }

  // Create a response object to modify
  const response = NextResponse.next();

  try {
    // Create a Supabase client using the middleware helper
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Log all cookies from the request for debugging
    const requestCookies = request.headers.get("cookie");
    console.log(
      "Middleware: Request cookies:",
      requestCookies ? "Present" : "None",
    );
    if (requestCookies) {
      const cookieNames = requestCookies
        .split(";")
        .map((c) => c.trim().split("=")[0]);
      console.log("Middleware: Request cookie names:", cookieNames);
    }

    // This will refresh the session if needed and set the auth cookies
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "Middleware session check:",
      session ? "Session found" : "No session",
    );

    // Always force a session refresh to ensure cookies are properly set
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError) {
      console.error("Middleware: Session refresh error:", refreshError);
    } else {
      console.log(
        "Middleware: Session refreshed:",
        refreshData.session ? "Valid session" : "No session after refresh",
      );
    }

    // Log the cookie names that will be set
    const cookieHeader = response.headers.get("set-cookie");
    if (cookieHeader) {
      console.log(
        "Middleware: Setting cookies in response header:",
        cookieHeader,
      );
    } else {
      console.warn("Middleware: No cookies found in response header");
    }

    // For debugging - log the URL being accessed
    console.log(`Middleware processing: ${pathname}`);

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
