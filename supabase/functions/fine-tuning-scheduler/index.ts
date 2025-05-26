// This is a scheduled Edge Function that runs periodically to check if we need to fine-tune the model
// It will be triggered by a cron job set up in Supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Database } from "@shared/database.types.ts";
import { createFineTuningJob, uploadTrainingFile } from "@shared/openai.ts";

// Minimum number of new examples required to trigger fine-tuning
const MIN_NEW_EXAMPLES = 50;

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

    // Check if we have enough new examples to trigger fine-tuning
    const { data: unusedExamples, error: countError } = await supabase
      .from("fine_tuning_examples")
      .select("*")
      .eq("used_in_training", false)
      .order("created_at", { ascending: true });

    if (countError) {
      throw new Error(`Error fetching unused examples: ${countError.message}`);
    }

    // If we don't have enough examples, exit early
    if (!unusedExamples || unusedExamples.length < MIN_NEW_EXAMPLES) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Not enough new examples for fine-tuning. Have ${unusedExamples?.length || 0}, need ${MIN_NEW_EXAMPLES}.`,
          shouldFineTune: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // We have enough examples, prepare the training data
    console.log(
      `Found ${unusedExamples.length} unused examples, preparing for fine-tuning...`,
    );

    // Split into training (80%) and validation (20%) sets
    const shuffled = [...unusedExamples].sort(() => 0.5 - Math.random());
    const splitIndex = Math.floor(shuffled.length * 0.8);
    const trainingExamples = shuffled.slice(0, splitIndex);
    const validationExamples = shuffled.slice(splitIndex);

    // Format data for OpenAI fine-tuning (JSONL format)
    const formatExample = (example) => {
      return JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps create invoices from natural language descriptions.",
          },
          { role: "user", content: example.prompt },
          { role: "assistant", content: example.completion },
        ],
      });
    };

    const trainingData = trainingExamples.map(formatExample).join("\n");
    const validationData = validationExamples.map(formatExample).join("\n");

    // Upload training and validation files to OpenAI
    const trainingFileResult = await uploadTrainingFile(apiKey, trainingData);
    if (!trainingFileResult.success) {
      throw new Error(
        `Failed to upload training file: ${trainingFileResult.error}`,
      );
    }

    const validationFileResult = await uploadTrainingFile(
      apiKey,
      validationData,
    );
    if (!validationFileResult.success) {
      throw new Error(
        `Failed to upload validation file: ${validationFileResult.error}`,
      );
    }

    // Create fine-tuning job
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .split(".")[0];
    const fineTuningResult = await createFineTuningJob(apiKey, {
      model: "gpt-3.5-turbo",
      trainingFile: trainingFileResult.fileId,
      validationFile: validationFileResult.fileId,
      suffix: `invoice-generator-${timestamp}`,
    });

    if (!fineTuningResult.success) {
      throw new Error(
        `Failed to create fine-tuning job: ${fineTuningResult.error}`,
      );
    }

    // Record the fine-tuning job in the database
    const { data: jobData, error: jobError } = await supabase
      .from("fine_tuning_jobs")
      .insert({
        model_name: "gpt-3.5-turbo",
        provider: "openai",
        status: fineTuningResult.status,
        examples_count: unusedExamples.length,
        metadata: {
          training_file_id: trainingFileResult.fileId,
          validation_file_id: validationFileResult.fileId,
          training_examples: trainingExamples.length,
          validation_examples: validationExamples.length,
        },
        fine_tuned_model_id: null, // Will be updated when job completes
      })
      .select()
      .single();

    if (jobError) {
      throw new Error(`Error recording fine-tuning job: ${jobError.message}`);
    }

    // Mark examples as used in training
    const exampleIds = unusedExamples.map((ex) => ex.id);
    const { error: updateError } = await supabase
      .from("fine_tuning_examples")
      .update({ used_in_training: true })
      .in("id", exampleIds);

    if (updateError) {
      throw new Error(`Error updating examples: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Fine-tuning job created successfully",
        jobId: fineTuningResult.jobId,
        jobStatus: fineTuningResult.status,
        examplesUsed: unusedExamples.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in fine-tuning scheduler:", error);

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
