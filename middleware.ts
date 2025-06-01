import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("✅ Middleware running");
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  await supabase.auth.getSession(); // Ensures the session cookie is set
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
