import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan") || "free";

  // Redirect to Supabase Auth signup page with plan info
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/signup?plan=${plan}`;

  return NextResponse.redirect(redirectUrl);
}
