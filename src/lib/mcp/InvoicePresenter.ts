import { GeneratedInvoice } from "../invoiceGenerator";

// Presenter: Handles UI updates and formatting
export class InvoicePresenter {
  private setInvoiceData: (data: GeneratedInvoice) => void;
  private setIsProcessing: (isProcessing: boolean) => void;
  private setError: (error: string | null) => void;

  constructor(
    setInvoiceData: (data: GeneratedInvoice) => void,
    setIsProcessing: (isProcessing: boolean) => void,
    setError: (error: string | null) => void,
  ) {
    this.setInvoiceData = setInvoiceData;
    this.setIsProcessing = setIsProcessing;
    this.setError = setError;
  }

  updateInvoiceData(data: GeneratedInvoice): void {
    this.setInvoiceData(data);
  }

  showLoading(isLoading: boolean): void {
    this.setIsProcessing(isLoading);
  }

  showError(errorMessage: string | null): void {
    this.setError(errorMessage);
  }

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  // Get status display information
  getStatusDisplay(status: string): { label: string; color: string } {
    switch (status) {
      case "paid":
        return { label: "Paid", color: "bg-green-100 text-green-800" };
      case "overdue":
        return { label: "Overdue", color: "bg-red-100 text-red-800" };
      case "unpaid":
      default:
        return { label: "Unpaid", color: "bg-amber-100 text-amber-800" };
    }
  }
}
