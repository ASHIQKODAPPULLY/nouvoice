import { LineItem } from "@/components/InvoicePreview";
import { processWithNLU } from "./nlu";

export interface BusinessDetails {
  businessName: string;
  abn: string;
  address: string;
  bankName: string;
  bsb: string;
  accountNumber: string;
  logo?: string;
}

export interface GeneratedInvoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyABN?: string;
  companyBankDetails?: {
    bankName: string;
    bsb: string;
    accountNumber: string;
  };
  companyLogo?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
  status?: "paid" | "unpaid" | "overdue";
  reminderSent?: boolean;
  paymentDue?: number; // days until payment is due
  invoiceFormat?: "standard" | "modern" | "minimal";
}

// Helper function to generate a dynamic invoice number with more options
const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const day = new Date().getDate().toString().padStart(2, "0");
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  // Use a more dynamic format that includes the date in a readable format
  return `INV-${year}${month}${day}-${randomNum}`;
};

// Helper function to calculate dates
const calculateDates = (
  dueDays: number = 30,
): { date: string; dueDate: string } => {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + dueDays);

  return {
    date: today.toISOString().split("T")[0],
    dueDate: dueDate.toISOString().split("T")[0],
  };
};

// Helper to extract client information from prompt
const extractClientInfo = (
  prompt: string,
): { name: string; email: string; address: string } => {
  // Default values
  let clientInfo = {
    name: "Client",
    email: "client@example.com",
    address: "Client Address",
  };

  // Look for explicit client name label
  const clientNameLabelMatch = prompt.match(
    /client\s+name\s*(?::|is)\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
  );
  if (clientNameLabelMatch && clientNameLabelMatch[1]) {
    clientInfo.name = clientNameLabelMatch[1].trim();
  }

  // Look for explicit address label
  const addressLabelMatch = prompt.match(
    /address\s*(?::|is)\s*([\w\s,.'-]+?)(?:\.|,|\s+|$)/i,
  );
  if (addressLabelMatch && addressLabelMatch[1]) {
    clientInfo.address = addressLabelMatch[1].trim();
  }

  // Try to extract client name using multiple patterns
  const namePatterns = [
    // Look for name with email pattern
    /([\w\s&'-]+?)\s*\(([\w.+-]+@[\w-]+\.[\w.-]+)\)/i,
    // Traditional patterns
    /(?:invoice|bill) for ([\w\s&'-]+?)(?:\.|,|\s+for\s+|\s+on\s+|$)/i,
    /(?:to|for) ([\w\s&'-]+?)(?:\.|,|\s+for\s+|\s+on\s+|$)/i,
    /client(?::|\s+is\s+|\s+name\s+is\s+)\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
    /(?:billing|invoice)(?::|\s+to\s+)\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
  ];

  // First try to find name with email pattern
  const nameEmailMatch = prompt.match(
    /([\w\s&'-]+?)\s*\(([\w.+-]+@[\w-]+\.[\w.-]+)\)/i,
  );
  if (nameEmailMatch && nameEmailMatch[1] && nameEmailMatch[2]) {
    clientInfo.name = nameEmailMatch[1].trim();
    clientInfo.email = nameEmailMatch[2].trim();
  } else {
    // Fall back to other patterns
    for (const pattern of namePatterns) {
      const nameMatch = prompt.match(pattern);
      if (nameMatch && nameMatch[1]) {
        clientInfo.name = nameMatch[1].trim();
        break;
      }
    }

    // Look for email pattern
    const emailMatch = prompt.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) {
      clientInfo.email = emailMatch[0];
    }
  }

  // Email is already handled above

  // Try to extract address with multiple patterns
  const addressPatterns = [
    // Look for name with email and address pattern
    /\([\w.+-]+@[\w-]+\.[\w.-]+\)\s+at\s+([\w\s,.'-]+?)(?:\s+for|\.|,|$)/i,
    // Traditional patterns
    /(?:located|based|residing)(?:\s+at|\s+in)\s+([\w\s,.'-]+?)(?:\.|,|\s+for\s+|$)/i,
    /address(?::|\s+is\s+|\s+at\s+)\s*([\w\s,.'-]+?)(?:\.|,|\s+|$)/i,
    /at ([\w\s,.'-]+?)(?:\.|,|\s+for\s+|$)/i,
  ];

  for (const pattern of addressPatterns) {
    const addressMatch = prompt.match(pattern);
    if (addressMatch && addressMatch[1]) {
      clientInfo.address = addressMatch[1].trim();
      break;
    }
  }

  return clientInfo;
};

// Helper to extract company information
const extractCompanyInfo = (
  prompt: string,
): { name: string; email: string; address: string } => {
  // Default values
  let companyInfo = {
    name: "Your Company",
    email: "contact@yourcompany.com",
    address: "Your Company Address",
  };

  // Try to extract company name with multiple patterns
  const companyPatterns = [
    /(?:from|by|issued by) ([\w\s&'-]+?)(?:\.|,|\s+for\s+|$)/i,
    /([\w\s&'-]+?)(?:'s|')? (?:services|company|business|studio|agency|firm|consultancy)(?:\.|,|\s+|$)/i,
    /company(?::|\s+is\s+|\s+name\s+is\s+)\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
    /(?:my|our) (?:business|company|firm) (?:is|name is) ([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
    /include (?:my|our) (?:business|company) details:?\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
  ];

  for (const pattern of companyPatterns) {
    const companyMatch = prompt.match(pattern);
    if (companyMatch && companyMatch[1]) {
      companyInfo.name = companyMatch[1].trim();
      break;
    }
  }

  // Try to extract company email
  const emailPattern =
    /(?:company|business|my|our)\s+email\s+(?:is|:)\s*([\w.+-]+@[\w-]+\.[\w.-]+)/i;
  const emailMatch =
    prompt.match(emailPattern) || prompt.match(/([\w.+-]+@[\w-]+\.[\w.-]+)/g);

  // Get client email from prompt to avoid using it for company
  const clientEmailMatch = prompt.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const clientEmail = clientEmailMatch ? clientEmailMatch[0] : null;

  if (emailMatch && emailMatch[1] && emailMatch[1] !== clientEmail) {
    companyInfo.email = emailMatch[1];
  } else if (emailMatch && Array.isArray(emailMatch) && emailMatch.length > 1) {
    // If we found multiple emails, use the second one for company if it's different from client
    const emails = emailMatch.filter((email) => email !== clientEmail);
    if (emails.length > 0) {
      companyInfo.email = emails[0];
    }
  }

  // Try to extract company address
  const addressPatterns = [
    /(?:company|business|our)\s+address\s+(?:is|:)\s*([\w\s,.'-]+?)(?:\.|,|\s+|$)/i,
    /(?:located|based)\s+(?:at|in)\s+([\w\s,.'-]+?)(?:\.|,|\s+|$)/i,
  ];

  for (const pattern of addressPatterns) {
    const addressMatch = prompt.match(pattern);
    if (addressMatch && addressMatch[1]) {
      companyInfo.address = addressMatch[1].trim();
      break;
    }
  }

  return companyInfo;
};

// Helper to get default due date
function getDefaultDueDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

// Main function to generate invoice from prompt
export const generateInvoiceFromPrompt = async (
  prompt: string,
  businessDetails?: BusinessDetails,
  aiProvider?: "openai" | "claude" | "gemini",
  clientDetails?: {
    name: string;
    email: string;
    address: string;
  },
): Promise<GeneratedInvoice> => {
  try {
    // Process the prompt with NLU to extract structured data
    const nluResult = await processWithNLU(prompt);
    console.log("NLU Result:", nluResult);

    // Use client details from parameters if provided, otherwise use NLU extracted details
    const clientInfo = clientDetails || nluResult.clientInfo;

    // Extract company info from prompt if business details not provided
    const extractedCompanyInfo = extractCompanyInfo(prompt);
    const companyInfo = businessDetails
      ? {
          name: businessDetails.businessName,
          email: extractedCompanyInfo.email,
          address: businessDetails.address,
        }
      : extractedCompanyInfo;

    // Use the items extracted by NLU
    const lineItems = nluResult.items.map((item) => {
      let description = item.description;

      // Special handling for newspaper deliveries
      if (
        prompt.toLowerCase().includes("herald sun") ||
        prompt.toLowerCase().includes("newspaper")
      ) {
        if (description.toLowerCase().includes("tuesday")) {
          description = "Tuesday Herald Sun Newspaper Delivery";
        } else if (description.toLowerCase().includes("thursday")) {
          description = "Thursday Herald Sun Newspaper Delivery";
        } else if (
          description.includes("Professional") ||
          description.includes("Standard") ||
          description.includes("Consulting")
        ) {
          description = "Herald Sun Newspaper Delivery";
        }
      }
      // Regular enhancement for other types of services
      else if (description) {
        // Add more specific details based on the service type
        if (
          description.toLowerCase().includes("web") ||
          description.toLowerCase().includes("website")
        ) {
          description =
            description + " (Includes Responsive Design & Mobile Optimization)";
        } else if (description.toLowerCase().includes("design")) {
          description =
            description + " (Custom Professional Design with Revisions)";
        } else if (description.toLowerCase().includes("content")) {
          description = description + " (SEO-Optimized with Target Keywords)";
        } else if (description.toLowerCase().includes("consult")) {
          description = description + " (Expert Advisory Services)";
        } else if (description.toLowerCase().includes("develop")) {
          description = description + " (Custom Development with Testing)";
        } else if (description.toLowerCase().includes("market")) {
          description = description + " (Strategic Marketing Services)";
        } else if (description.toLowerCase().includes("host")) {
          description =
            description + " (Secure Server Configuration & Maintenance)";
        } else {
          // For generic descriptions, add professional service indicator
          if (description.length < 25) {
            // Only add if description is short
            description = description + " (Professional Service)";
          }
        }
      }

      return {
        id: (nluResult.items.indexOf(item) + 1).toString(),
        description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      };
    });

    // Calculate subtotal, tax amount, and total
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = nluResult.taxRate;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Use due days from NLU or default to 30
    const dueDays = nluResult.dueDays || 30;

    // Use due date from NLU or calculate from due days
    const dueDate = nluResult.dueDate || getDefaultDueDate(dueDays);
    const date = new Date().toISOString().split("T")[0]; // Today's date

    // Generate a random invoice number
    const invoiceNumber = generateInvoiceNumber();

    return {
      invoiceNumber,
      date,
      dueDate,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientAddress: clientInfo.address,
      companyName: companyInfo.name,
      companyAddress: companyInfo.address,
      companyEmail: companyInfo.email,
      companyABN: businessDetails?.abn,
      companyBankDetails: businessDetails
        ? {
            bankName: businessDetails.bankName,
            bsb: businessDetails.bsb,
            accountNumber: businessDetails.accountNumber,
          }
        : undefined,
      companyLogo: businessDetails?.logo,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes:
        nluResult.notes ||
        `Payment due within ${dueDays} days. Thank you for your business.`,
      status: "unpaid",
      reminderSent: false,
      paymentDue: dueDays,
      invoiceFormat: "standard",
    };
  } catch (error) {
    console.error("Error generating invoice:", error);

    // Fallback to traditional extraction if NLU fails
    console.log("Falling back to traditional extraction methods");

    // Use provided client details or extract from prompt
    const clientInfo = clientDetails || extractClientInfo(prompt);
    const extractedCompanyInfo = extractCompanyInfo(prompt);
    const companyInfo = businessDetails
      ? {
          name: businessDetails.businessName,
          email: extractedCompanyInfo.email,
          address: businessDetails.address,
        }
      : extractedCompanyInfo;

    // Extract items and prices with enhanced descriptions
    const items = [];
    const itemPattern =
      /\$(\d+(?:\.\d+)?)\s+(?:for|on)\s+([\w\s,'-]+?)(?:\.|,|\s+and\s+|$)|([\w\s,'-]+?)\s+(?:for|at|costs?|:)\s+\$(\d+(?:\.\d+)?)(?:\.|,|\s+and\s+|$)/gi;
    let match;

    while ((match = itemPattern.exec(prompt)) !== null) {
      const price = parseFloat(match[1] || match[4]);
      let description = (match[2] || match[3] || "").trim();

      // Use the description exactly as extracted, without enhancements
      if (description) {
        // No modifications to descriptions to ensure consistency
      }

      items.push({
        id: (items.length + 1).toString(),
        description,
        quantity: 1,
        unitPrice: price,
        amount: price,
      });
    }

    // Add a default item if none found
    if (items.length === 0) {
      // Use a simpler default description for consistency with live preview
      let defaultDescription = "Professional Services";

      // Determine the type of service from the prompt keywords
      if (
        prompt.toLowerCase().includes("herald sun") ||
        prompt.toLowerCase().includes("newspaper")
      ) {
        defaultDescription = "Newspaper Delivery Services";
      } else if (
        prompt.toLowerCase().includes("web") ||
        prompt.toLowerCase().includes("website")
      ) {
        defaultDescription = "Website Development Services";
      } else if (prompt.toLowerCase().includes("design")) {
        defaultDescription = "Design Services";
      } else if (
        prompt.toLowerCase().includes("content") ||
        prompt.toLowerCase().includes("writing")
      ) {
        defaultDescription = "Content Creation Services";
      } else if (prompt.toLowerCase().includes("market")) {
        defaultDescription = "Marketing Services";
      } else if (prompt.toLowerCase().includes("seo")) {
        defaultDescription = "SEO Services";
      }

      items.push({
        id: "1",
        description: defaultDescription,
        quantity: 1,
        unitPrice: 100,
        amount: 100,
      });
    }

    // Extract tax rate
    const taxPattern = /(?:apply|with|at)\s+(\d+(?:\.\d+)?)\s*%\s*tax/i;
    const taxMatch = prompt.match(taxPattern);
    const taxRate = taxMatch ? parseFloat(taxMatch[1]) : 10;

    // Calculate subtotal, tax amount, and total
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Extract due date
    const dueDaysPattern = /due\s+in\s+(\d+)\s*days/i;
    const dueDaysMatch = prompt.match(dueDaysPattern);
    const dueDays = dueDaysMatch ? parseInt(dueDaysMatch[1]) : 30;

    const dueDate = getDefaultDueDate(dueDays);

    // Generate a random invoice number
    const invoiceNumber = generateInvoiceNumber();

    return {
      invoiceNumber,
      date: new Date().toISOString().split("T")[0],
      dueDate,
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientAddress: clientInfo.address,
      companyName: companyInfo.name,
      companyAddress: companyInfo.address,
      companyEmail: companyInfo.email,
      companyABN: businessDetails?.abn,
      companyBankDetails: businessDetails
        ? {
            bankName: businessDetails.bankName,
            bsb: businessDetails.bsb,
            accountNumber: businessDetails.accountNumber,
          }
        : undefined,
      companyLogo: businessDetails?.logo,
      lineItems: items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes: `Payment due within ${dueDays} days. Thank you for your business.`,
      status: "unpaid",
      reminderSent: false,
      paymentDue: dueDays,
      invoiceFormat: "standard",
    };
  }
};
