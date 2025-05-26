import { LineItem } from "@/components/InvoicePreview";
import { BusinessDetails, GeneratedInvoice } from "../invoiceGenerator";

// Model: Represents the data structure and business logic
export class InvoiceModel {
  private invoiceData: Partial<GeneratedInvoice>;
  private businessDetails?: BusinessDetails;
  private aiProvider?: "openai" | "claude" | "gemini";
  private clientDetails?: {
    name: string;
    email: string;
    address: string;
  };

  constructor() {
    this.invoiceData = {
      lineItems: [],
      subtotal: 0,
      taxRate: 10,
      taxAmount: 0,
      total: 0,
      notes: "",
      status: "unpaid",
      reminderSent: false,
    };
  }

  setBusinessDetails(details: BusinessDetails): void {
    this.businessDetails = details;
    this.invoiceData.companyName = details.businessName;
    this.invoiceData.companyAddress = details.address;
    this.invoiceData.companyABN = details.abn;
    this.invoiceData.companyBankDetails = {
      bankName: details.bankName,
      bsb: details.bsb,
      accountNumber: details.accountNumber,
    };
    this.invoiceData.companyLogo = details.logo;
  }

  setAIProvider(provider: "openai" | "claude" | "gemini"): void {
    this.aiProvider = provider;
  }

  setClientDetails(details: {
    name: string;
    email: string;
    address: string;
  }): void {
    this.clientDetails = details;
    this.invoiceData.clientName = details.name;
    this.invoiceData.clientEmail = details.email;
    this.invoiceData.clientAddress = details.address;
  }

  setLineItems(items: LineItem[]): void {
    this.invoiceData.lineItems = items;
    this.recalculateTotals();
  }

  addLineItem(item: LineItem): void {
    if (!this.invoiceData.lineItems) {
      this.invoiceData.lineItems = [];
    }
    this.invoiceData.lineItems.push(item);
    this.recalculateTotals();
  }

  setTaxRate(rate: number): void {
    this.invoiceData.taxRate = rate;
    this.recalculateTotals();
  }

  setDueDate(dueDate: string): void {
    this.invoiceData.dueDate = dueDate;
  }

  setInvoiceNumber(number: string): void {
    this.invoiceData.invoiceNumber = number;
  }

  setNotes(notes: string): void {
    this.invoiceData.notes = notes;
  }

  getInvoiceData(): Partial<GeneratedInvoice> {
    return this.invoiceData;
  }

  getBusinessDetails(): BusinessDetails | undefined {
    return this.businessDetails;
  }

  getAIProvider(): "openai" | "claude" | "gemini" | undefined {
    return this.aiProvider;
  }

  getClientDetails():
    | { name: string; email: string; address: string }
    | undefined {
    return this.clientDetails;
  }

  private recalculateTotals(): void {
    if (!this.invoiceData.lineItems) return;

    const subtotal = this.invoiceData.lineItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const taxAmount = subtotal * ((this.invoiceData.taxRate || 0) / 100);

    this.invoiceData.subtotal = subtotal;
    this.invoiceData.taxAmount = taxAmount;
    this.invoiceData.total = subtotal + taxAmount;
  }
}
