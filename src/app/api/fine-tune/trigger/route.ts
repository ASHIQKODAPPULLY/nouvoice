import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Create authenticated Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get Supabase URL for invoking the Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Supabase URL not configured" },
        { status: 500 },
      );
    }

    // Invoke the fine-tuning-scheduler Edge Function
    const { data: schedulerData, error: schedulerError } =
      await supabase.functions.invoke(
        "supabase-functions-fine-tuning-scheduler",
        {
          method: "POST",
          body: {},
        },
      );

    if (schedulerError) {
      console.error("Error invoking fine-tuning-scheduler:", schedulerError);
      return NextResponse.json(
        { error: "Failed to trigger fine-tuning process" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fine-tuning process triggered successfully",
      data: schedulerData,
    });
  } catch (error) {
    console.error("Error in fine-tune trigger API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
