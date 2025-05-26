"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Download,
  Share2,
  Lock,
  FileText,
  FileImage,
  FileSpreadsheet,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface InvoiceExportOptionsProps {
  isPremiumUser?: boolean;
  onExport?: (format: "pdf" | "csv" | "image") => void;
  onShare?: () => void;
  invoiceData?: any; // Add invoice data for download functionality
}

const InvoiceExportOptions = ({
  isPremiumUser = false,
  onExport = () => {},
  onShare = () => {},
  invoiceData = null,
}: InvoiceExportOptionsProps) => {
  // Load last used export format from localStorage
  const [lastUsedFormat, setLastUsedFormat] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    success: boolean;
    message: string;
  }>({
    success: false,
    message: "",
  });

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const savedFormat = localStorage.getItem("lastExportFormat");
      if (savedFormat) {
        setLastUsedFormat(savedFormat);
      }
    }
  }, []);

  // Function to handle download action based on format
  const handleDownload = (
    format: "json" | "pdf" | "csv" | "image" = "json",
  ) => {
    // Save the format preference to localStorage (only on client side)
    if (typeof window !== "undefined") {
      localStorage.setItem("lastExportFormat", format);
      setLastUsedFormat(format);
    }
    console.log(
      `Download requested in ${format} format, invoice data:`,
      invoiceData,
    );

    // If no invoice data, show alert
    if (!invoiceData) {
      alert("No invoice data available to download");
      return;
    }

    try {
      switch (format) {
        case "pdf":
          // Generate PDF content using HTML to PDF approach
          try {
            // First notify via the export function
            onExport("pdf");

            // Get the logo from localStorage if available
            const logoImage = localStorage.getItem("invoiceLogoImage");
            console.log("Logo image for PDF:", logoImage);
            const logoHtml = logoImage
              ? `<img src="${logoImage}" alt="Company Logo" style="max-height: 80px; max-width: 200px; margin-bottom: 10px;">`
              : "";

            // Create a printable version of the invoice
            const printWindow = window.open("", "", "width=800,height=600");
            if (!printWindow) {
              alert("Please allow popups to download PDF");
              return;
            }

            printWindow.document.write(`
              <html>
                <head>
                  <title>Invoice ${invoiceData.invoiceNumber}</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .invoice-title { font-size: 24px; font-weight: bold; }
                    .company-details { margin-bottom: 20px; }
                    .client-details { margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                    .totals { margin-left: auto; width: 300px; }
                    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 5px; }
                    .logo-container { text-align: right; margin-bottom: 10px; }
                  </style>
                </head>
                <body>
                  <div class="invoice-header">
                    <div>
                      <div class="invoice-title">${invoiceData.companyName}</div>
                      <div>${invoiceData.companyAddress || ""}</div>
                      <div>${invoiceData.companyEmail || ""}</div>
                    </div>
                    <div style="text-align: right;">
                      <div class="logo-container">${logoHtml}</div>
                      <div class="invoice-title">INVOICE</div>
                      <div>Invoice #: ${invoiceData.invoiceNumber}</div>
                      <div>Date: ${new Date(invoiceData.date).toLocaleDateString()}</div>
                      <div>Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div class="client-details">
                    <div style="font-weight: bold;">Bill To:</div>
                    <div>${invoiceData.clientName}</div>
                    <div>${invoiceData.clientAddress || ""}</div>
                    <div>${invoiceData.clientEmail || ""}</div>
                  </div>
                  
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoiceData.lineItems
                        .map(
                          (item) => `
                        <tr>
                          <td>${item.description}</td>
                          <td>${item.quantity}</td>
                          <td>${item.unitPrice.toFixed(2)}</td>
                          <td>${item.amount.toFixed(2)}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                  
                  <div class="totals">
                    <div class="total-row">
                      <div>Subtotal:</div>
                      <div>${invoiceData.subtotal.toFixed(2)}</div>
                    </div>
                    <div class="total-row">
                      <div>Tax (${invoiceData.taxRate}%):</div>
                      <div>${invoiceData.taxAmount.toFixed(2)}</div>
                    </div>
                    <div class="total-row grand-total">
                      <div>Total:</div>
                      <div>${invoiceData.total.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
                    <div style="font-weight: bold;">Notes:</div>
                    <div>${invoiceData.notes || ""}</div>
                  </div>
                </body>
              </html>
            `);

            // Wait for content to load then print
            printWindow.document.close();
            printWindow.focus();

            // Use timeout to ensure content is loaded before printing
            setTimeout(() => {
              printWindow.print();
              // Close the window after print dialog is closed (or after a timeout)
              setTimeout(() => {
                printWindow.close();
              }, 1000);
            }, 500);
          } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the PDF. Please try again.");
          }
          break;

        case "csv":
          // Generate CSV content
          let csvContent =
            "Invoice Number,Date,Due Date,Client,Description,Quantity,Unit Price,Amount\n";

          // Add invoice header info
          csvContent += `${invoiceData.invoiceNumber},${invoiceData.date},${invoiceData.dueDate},${invoiceData.clientName},,,,\n`;

          // Add line items
          invoiceData.lineItems?.forEach((item: any) => {
            csvContent += `,,,,${item.description},${item.quantity},${item.unitPrice},${item.amount}\n`;
          });

          // Add totals
          csvContent += `,,,,Subtotal,,,${invoiceData.subtotal}\n`;
          csvContent += `,,,,Tax (${invoiceData.taxRate}%),,,${invoiceData.taxAmount}\n`;
          csvContent += `,,,,Total,,,${invoiceData.total}\n`;

          const csvUri =
            "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
          const csvLink = document.createElement("a");
          csvLink.setAttribute("href", csvUri);
          csvLink.setAttribute(
            "download",
            `invoice-${invoiceData.invoiceNumber || Date.now()}.csv`,
          );
          document.body.appendChild(csvLink);
          csvLink.click();
          document.body.removeChild(csvLink);
          break;

        case "image":
          // Call the export function with image format
          onExport("image");

          // Alert the user that this feature is coming soon with more details
          alert(
            "The image export feature will be available soon. This will allow you to download your invoice as a PNG or JPG file.",
          );
          break;

        case "json":
        default:
          // Create a JSON string of the invoice data
          const dataStr = JSON.stringify(invoiceData, null, 2);
          const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

          // Create a download link and trigger it
          const downloadLink = document.createElement("a");
          downloadLink.setAttribute("href", dataUri);
          downloadLink.setAttribute(
            "download",
            `invoice-${invoiceData.invoiceNumber || Date.now()}.json`,
          );
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          break;
      }

      console.log(`Invoice downloaded successfully as ${format}`, {
        invoiceNumber: invoiceData.invoiceNumber,
      });

      // Show success message
      setExportStatus({
        success: true,
        message: `Invoice exported as ${format}`,
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setExportStatus({ success: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error(`Error downloading invoice as ${format}:`, error);
      alert(
        `There was an error downloading the invoice as ${format}. Please try again.`,
      );
    }
  };

  // Function to handle share action
  const handleShare = () => {
    if (navigator.share && invoiceData) {
      navigator
        .share({
          title: "Invoice",
          text: "Check out this invoice I created",
          // In a real app, this would be a URL to a shareable version of the invoice
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Share failed:", err);
          // Fallback to the provided onShare function
          onShare();
        });
    } else {
      // If Web Share API is not available, use the provided onShare function
      onShare();
    }
  };
  return (
    <div className="w-full p-4 bg-background border rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Export Invoice</h3>
          {isPremiumUser && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200"
            >
              Premium
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={lastUsedFormat === "pdf" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => handleDownload("pdf")}
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export as PDF document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={lastUsedFormat === "csv" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => handleDownload("csv")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export as CSV spreadsheet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={lastUsedFormat === "image" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => handleDownload("image")}
                >
                  <FileImage className="h-4 w-4" />
                  <span>Image</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export as image file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator
            orientation="vertical"
            className="h-8 mx-2 hidden sm:block"
          />

          <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {exportStatus.success && (
        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md">
          {exportStatus.message}
        </div>
      )}

      {!isPremiumUser && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md flex items-center gap-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upgrade to Premium for custom branding, premium templates, and
            unlimited usage.
            <Button
              variant="link"
              className="px-1 py-0 h-auto text-sm font-medium"
            >
              Upgrade now
            </Button>
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceExportOptions;
