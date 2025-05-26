// This Edge Function checks the status of ongoing fine-tuning jobs and updates the database

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Database } from "@shared/database.types.ts";
import { getFineTuningJobStatus } from "@shared/openai.ts";

// Cors headers for preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable not set");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables not set");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Get all in-progress fine-tuning jobs
    const { data: activeJobs, error: jobsError } = await supabase
      .from("fine_tuning_jobs")
      .select("*")
      .in("status", ["pending", "running", "validating_files", "queued"]);

    if (jobsError) {
      throw new Error(`Error fetching active jobs: ${jobsError.message}`);
    }

    if (!activeJobs || activeJobs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No active fine-tuning jobs found",
          updatedJobs: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Check status of each job and update the database
    const jobUpdates = await Promise.all(
      activeJobs.map(async (job) => {
        // Extract OpenAI job ID from metadata
        const openaiJobId = job.metadata?.openai_job_id || job.id;

        // Get current status from OpenAI
        const statusResult = await getFineTuningJobStatus(apiKey, openaiJobId);

        if (!statusResult.success) {
          console.error(
            `Failed to get status for job ${job.id}: ${statusResult.error}`,
          );
          return null;
        }

        // Update job in database
        const updates: any = {
          status: statusResult.status,
        };

        // If job is complete, update the fine-tuned model ID and completion time
        if (statusResult.status === "succeeded") {
          updates.fine_tuned_model_id = statusResult.fineTunedModel;
          updates.completed_at = new Date().toISOString();

          // Add training and validation loss if available
          if (statusResult.data.result_files?.length > 0) {
            // In a real implementation, we would download and parse the result files
            // to get the training and validation loss
            updates.training_loss =
              statusResult.data.training_metrics?.training_loss;
            updates.validation_loss =
              statusResult.data.training_metrics?.validation_loss;
          }
        }

        // Update the job in the database
        const { error: updateError } = await supabase
          .from("fine_tuning_jobs")
          .update(updates)
          .eq("id", job.id);

        if (updateError) {
          console.error(`Error updating job ${job.id}: ${updateError.message}`);
          return null;
        }

        return {
          jobId: job.id,
          previousStatus: job.status,
          newStatus: statusResult.status,
          fineTunedModel: statusResult.fineTunedModel,
        };
      }),
    );

    // Filter out null values (failed updates)
    const successfulUpdates = jobUpdates.filter(Boolean);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${successfulUpdates.length} fine-tuning jobs`,
        updatedJobs: successfulUpdates,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in fine-tuning status checker:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
