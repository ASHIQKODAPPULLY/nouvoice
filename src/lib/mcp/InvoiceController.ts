import { InvoiceModel } from "./InvoiceModel";
import { InvoicePresenter } from "./InvoicePresenter";
import {
  BusinessDetails,
  GeneratedInvoice,
  generateInvoiceFromPrompt,
} from "../invoiceGenerator";
import { processWithNLU } from "../nlu";

// Controller: Handles user input and coordinates between Model and Presenter
export class InvoiceController {
  private model: InvoiceModel;
  private presenter: InvoicePresenter;

  constructor(model: InvoiceModel, presenter: InvoicePresenter) {
    this.model = model;
    this.presenter = presenter;
  }

  async generateInvoice(promptText: string): Promise<GeneratedInvoice> {
    try {
      // Show loading state
      this.presenter.showLoading(true);

      // Get data from model
      const businessDetails = this.model.getBusinessDetails();
      const aiProvider = this.model.getAIProvider();
      const clientDetails = this.model.getClientDetails();

      // First analyze the prompt with NLU to extract structured data
      await this.analyzePrompt(promptText);

      // Generate invoice using the existing function
      const generatedInvoice = await generateInvoiceFromPrompt(
        promptText,
        businessDetails,
        aiProvider,
        clientDetails,
      );

      // Update the presenter with the result
      this.presenter.updateInvoiceData(generatedInvoice);

      // Hide loading state
      this.presenter.showLoading(false);

      return generatedInvoice;
    } catch (error) {
      // Handle errors
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to generate invoice",
      );
      this.presenter.showLoading(false);
      throw error;
    }
  }

  setBusinessDetails(details: BusinessDetails): void {
    this.model.setBusinessDetails(details);
  }

  setAIProvider(provider: "openai" | "claude" | "gemini"): void {
    this.model.setAIProvider(provider);
  }

  setClientDetails(details: {
    name: string;
    email: string;
    address: string;
  }): void {
    this.model.setClientDetails(details);
  }

  // Additional methods for handling user interactions
  validatePrompt(promptText: string): boolean {
    return promptText.trim().length > 0;
  }

  enhancePrompt(promptText: string): string {
    // Add intelligence to improve the prompt before processing
    let enhancedPrompt = promptText;

    // Add client details context if available
    const clientDetails = this.model.getClientDetails();
    if (clientDetails) {
      if (
        !promptText.toLowerCase().includes(clientDetails.name.toLowerCase())
      ) {
        enhancedPrompt = `Invoice for ${clientDetails.name}. ${enhancedPrompt}`;
      }
    }

    // Add business context if available
    const businessDetails = this.model.getBusinessDetails();
    if (
      businessDetails &&
      !promptText
        .toLowerCase()
        .includes(businessDetails.businessName.toLowerCase())
    ) {
      enhancedPrompt = `${enhancedPrompt} From ${businessDetails.businessName}.`;
    }

    // Add tax context if not specified
    if (
      !promptText.toLowerCase().includes("tax") &&
      !promptText.toLowerCase().includes("%")
    ) {
      enhancedPrompt = `${enhancedPrompt} Apply standard tax rate.`;
    }

    // Add payment terms if not specified
    if (
      !promptText.toLowerCase().includes("due") &&
      !promptText.toLowerCase().includes("net") &&
      !promptText.toLowerCase().includes("payment")
    ) {
      enhancedPrompt = `${enhancedPrompt} Due in 30 days.`;
    }

    // Add quantity context if price is mentioned without quantity
    const pricePattern = /\$(\d+(?:\.\d+)?)/g;
    const priceMatches = [...promptText.matchAll(pricePattern)];

    for (const match of priceMatches) {
      const price = match[0];
      const priceIndex = match.index;
      if (priceIndex !== undefined) {
        const beforePrice = promptText.substring(
          Math.max(0, priceIndex - 30),
          priceIndex,
        );

        // If there's no quantity mentioned before the price
        if (!beforePrice.match(/\d+\s+(?:hours?|hrs?|units?|items?)/i)) {
          // Check if this price is not already associated with a quantity
          const afterPrice = promptText.substring(
            priceIndex,
            Math.min(promptText.length, priceIndex + 30),
          );
          if (!afterPrice.match(/per\s+(?:hour|hr|unit|item)/i)) {
            // Add quantity context
            enhancedPrompt = enhancedPrompt.replace(
              price,
              `1 item at ${price}`,
            );
          }
        }
      }
    }

    return enhancedPrompt;
  }

  // New method to analyze and extract structured data from the prompt
  async analyzePrompt(promptText: string) {
    try {
      // Use the NLU layer to extract structured data
      const nluResult = await processWithNLU(promptText);
      console.log("NLU Analysis Result:", nluResult);

      // Update the model with the extracted data
      if (
        nluResult.clientInfo &&
        nluResult.clientInfo.name !== "Client" &&
        !this.model.getClientDetails()
      ) {
        this.model.setClientDetails(nluResult.clientInfo);
      }

      if (nluResult.items && nluResult.items.length > 0) {
        // Convert NLU items to line items
        const lineItems = nluResult.items.map((item, index) => ({
          id: (index + 1).toString(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        }));

        this.model.setLineItems(lineItems);
      }

      if (nluResult.taxRate) {
        this.model.setTaxRate(nluResult.taxRate);
      }

      if (nluResult.dueDate) {
        this.model.setDueDate(nluResult.dueDate);
      }

      if (nluResult.notes) {
        this.model.setNotes(nluResult.notes);
      }

      return nluResult;
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      throw new Error("Failed to analyze prompt");
    }
  }
}
