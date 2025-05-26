import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const {
      prompt,
      completion,
      source = "user_feedback",
      qualityScore = 0.5,
    } = body;

    // Validate required fields
    if (!prompt || !completion) {
      return NextResponse.json(
        { error: "Missing required fields: prompt and completion" },
        { status: 400 },
      );
    }

    // Create authenticated Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Insert the example into the database
    const { data, error } = await supabase
      .from("fine_tuning_examples")
      .insert({
        prompt,
        completion,
        source,
        quality_score: qualityScore,
        used_in_training: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving fine-tuning example:", error);
      return NextResponse.json(
        { error: "Failed to save fine-tuning example" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Fine-tuning example saved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in fine-tune API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Create authenticated Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    // Get fine-tuning examples
    const {
      data: examples,
      error: examplesError,
      count,
    } = await supabase
      .from("fine_tuning_examples")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (examplesError) {
      console.error("Error fetching fine-tuning examples:", examplesError);
      return NextResponse.json(
        { error: "Failed to fetch fine-tuning examples" },
        { status: 500 },
      );
    }

    // Get fine-tuning jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("fine_tuning_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (jobsError) {
      console.error("Error fetching fine-tuning jobs:", jobsError);
      return NextResponse.json(
        { error: "Failed to fetch fine-tuning jobs" },
        { status: 500 },
      );
    }

    // Get counts
    const { data: counts, error: countsError } = await supabase
      .from("fine_tuning_examples")
      .select("used_in_training", { count: "exact", head: true })
      .eq("used_in_training", false);

    const unusedCount = counts?.count || 0;

    if (countsError) {
      console.error("Error fetching counts:", countsError);
    }

    return NextResponse.json({
      success: true,
      examples,
      jobs,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
      stats: {
        unusedExamples: unusedCount,
      },
    });
  } catch (error) {
    console.error("Error in fine-tune API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
