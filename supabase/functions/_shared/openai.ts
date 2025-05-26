import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import OpenAI from "https://esm.sh/openai@4.28.0";

export interface FineTuningConfig {
  model: string;
  trainingFile: string;
  validationFile?: string;
  hyperparameters?: {
    nEpochs?: number;
  };
  suffix?: string;
}

export async function createFineTuningJob(
  apiKey: string,
  config: FineTuningConfig,
) {
  const openai = new OpenAI({
    apiKey,
  });

  try {
    const fineTuningJob = await openai.fineTuning.jobs.create({
      training_file: config.trainingFile,
      validation_file: config.validationFile,
      model: config.model,
      hyperparameters: config.hyperparameters,
      suffix: config.suffix,
    });

    return {
      success: true,
      jobId: fineTuningJob.id,
      status: fineTuningJob.status,
      model: fineTuningJob.model,
      data: fineTuningJob,
    };
  } catch (error) {
    console.error("Error creating fine-tuning job:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function uploadTrainingFile(apiKey: string, fileContent: string) {
  const openai = new OpenAI({
    apiKey,
  });

  try {
    // Convert string content to Blob
    const blob = new Blob([fileContent], { type: "application/jsonl" });

    // Create a File object from the Blob
    const file = new File([blob], "training_data.jsonl", {
      type: "application/jsonl",
    });

    const uploadedFile = await openai.files.create({
      file,
      purpose: "fine-tune",
    });

    return {
      success: true,
      fileId: uploadedFile.id,
      data: uploadedFile,
    };
  } catch (error) {
    console.error("Error uploading training file:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getFineTuningJobStatus(apiKey: string, jobId: string) {
  const openai = new OpenAI({
    apiKey,
  });

  try {
    const job = await openai.fineTuning.jobs.retrieve(jobId);

    return {
      success: true,
      status: job.status,
      fineTunedModel: job.fine_tuned_model,
      data: job,
    };
  } catch (error) {
    console.error("Error retrieving fine-tuning job status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
