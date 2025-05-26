import { useState } from "react";
import {
  saveFineTuningExample,
  formatInvoiceForFineTuning,
  shouldCollectForFineTuning,
} from "@/lib/fine-tuning-service";

/**
 * Hook for collecting fine-tuning examples from invoice generation
 */
export function useFineTuning() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedExample, setLastSavedExample] = useState<any>(null);

  /**
   * Save an invoice generation example for fine-tuning
   */
  const saveInvoiceExample = async (
    prompt: string,
    invoiceData: any,
    confidence: number,
    wasEdited: boolean = false,
  ) => {
    // Check if we should collect this example
    if (!shouldCollectForFineTuning(confidence, wasEdited)) {
      return null;
    }

    try {
      setIsSaving(true);

      // Format the example for fine-tuning
      const example = formatInvoiceForFineTuning(prompt, invoiceData);

      // Save to the database
      const savedExample = await saveFineTuningExample(example);

      setLastSavedExample(savedExample);
      return savedExample;
    } catch (error) {
      console.error("Error saving fine-tuning example:", error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveInvoiceExample,
    isSaving,
    lastSavedExample,
  };
}
