import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Allow Supabase auth callback to proceed without redirection
  if (pathname.startsWith("/auth/callback")) {
    console.log("Middleware: allowing auth callback to proceed");
    return NextResponse.next();
  }

  // Create a response object to modify
  const response = NextResponse.next();

  // Create a Supabase client using the middleware helper
  const supabase = createMiddlewareClient({ req: request, res: response });

  // This will refresh the session if needed and set the auth cookies
  await supabase.auth.getSession();

  return response;
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
