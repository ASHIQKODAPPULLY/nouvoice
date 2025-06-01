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

    // This will refresh the session if needed and set the auth cookies
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(
      "Middleware session check:",
      session ? "Session found" : "No session",
    );

    // Log cookie headers for debugging
    if (session) {
      console.log("Middleware: Session cookies should be set in the response");

      // Force a session refresh to ensure cookies are properly set
      if (pathname.startsWith("/api/") || pathname === "/pricing") {
        console.log(
          "Middleware: Critical path detected, forcing session refresh",
        );
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Middleware: Session refresh error:", refreshError);
        } else {
          console.log(
            "Middleware: Session refreshed successfully:",
            refreshData.session ? "Valid session" : "No session after refresh",
          );
        }
      }
    } else {
      console.log("Middleware: No session found, no auth cookies will be set");
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
