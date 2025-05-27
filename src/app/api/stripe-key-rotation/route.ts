import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  return NextResponse.redirect(
    new URL(
      "/stripe-diagnostics",
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
  );
}
