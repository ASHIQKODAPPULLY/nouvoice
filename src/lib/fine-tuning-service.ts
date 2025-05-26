/**
 * Fine-tuning Service
 *
 * This module provides functions to interact with the fine-tuning API endpoints
 * and manage the fine-tuning process.
 */

export interface FineTuningExample {
  id?: string;
  prompt: string;
  completion: string;
  source?: string;
  qualityScore?: number;
  createdAt?: string;
  usedInTraining?: boolean;
}

export interface FineTuningJob {
  id: string;
  modelName: string;
  provider: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  examplesCount: number;
  fineTunedModelId: string | null;
  metadata: any;
}

export interface FineTuningStats {
  unusedExamples: number;
}

export interface FineTuningResponse {
  examples?: FineTuningExample[];
  jobs?: FineTuningJob[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats?: FineTuningStats;
}

/**
 * Save a new fine-tuning example
 */
export async function saveFineTuningExample(
  example: FineTuningExample,
): Promise<FineTuningExample> {
  const response = await fetch("/api/fine-tune", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: example.prompt,
      completion: example.completion,
      source: example.source || "user_feedback",
      qualityScore: example.qualityScore || 0.5,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save fine-tuning example");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get fine-tuning examples and jobs
 */
export async function getFineTuningData(
  page: number = 1,
  limit: number = 10,
): Promise<FineTuningResponse> {
  const response = await fetch(`/api/fine-tune?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch fine-tuning data");
  }

  return await response.json();
}

/**
 * Manually trigger the fine-tuning process
 */
export async function triggerFineTuning(): Promise<any> {
  const response = await fetch("/api/fine-tune/trigger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to trigger fine-tuning");
  }

  return await response.json();
}

/**
 * Format an invoice response for fine-tuning
 */
export function formatInvoiceForFineTuning(
  prompt: string,
  invoiceData: any,
): FineTuningExample {
  // Convert the invoice data to a structured JSON string
  const completion = JSON.stringify(
    {
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      clientAddress: invoiceData.clientAddress,
      items: invoiceData.invoiceItems.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      taxRate: invoiceData.taxRate,
      dueDate: invoiceData.dueDate,
      notes: invoiceData.notes,
    },
    null,
    2,
  );

  return {
    prompt,
    completion,
    source: "generated_invoice",
    qualityScore: 0.8, // Higher quality since it's from actual usage
  };
}

/**
 * Check if we should collect this invoice for fine-tuning
 * (e.g., based on confidence score, user feedback, etc.)
 */
export function shouldCollectForFineTuning(
  confidence: number,
  userEdited: boolean = false,
): boolean {
  // Collect examples that:
  // 1. Have high confidence (good examples)
  // 2. Were edited by the user (to learn from corrections)
  return confidence > 0.8 || userEdited;
}
