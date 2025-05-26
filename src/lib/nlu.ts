/**
 * Natural Language Understanding (NLU) Layer
 *
 * This module provides advanced text processing capabilities to extract structured
 * invoice data from natural language prompts.
 */

import { LineItem } from "@/components/InvoicePreview";
export interface NLUResult {
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  clientInfo: {
    name: string;
    email: string;
    address: string;
  };
  companyInfo?: {
    name: string;
    email: string;
    address: string;
  };
  taxRate: number;
  dueDate?: string;
  dueDays?: number;
  notes?: string;
  confidence: number;
}

/**
 * Process text with NLU to extract structured invoice data
 */
export async function processWithNLU(text: string): Promise<NLUResult> {
  try {
    // Extract client information
    const clientInfo = extractClientInfo(text);

    // Extract line items with improved pattern matching
    const items = extractLineItems(text);

    // Extract tax rate
    const taxRate = extractTaxRate(text);

    // Extract due date information
    const { dueDays, dueDate } = extractDueDates(text);

    // Extract notes
    const notes = extractNotes(text, dueDays);

    // Calculate confidence score based on extraction completeness
    const confidence = calculateConfidence({
      hasClientName: !!clientInfo.name && clientInfo.name !== "Client",
      hasItems: items.length > 0,
      hasTaxRate: taxRate !== 10, // Default tax rate is 10, so if it's different, we found it
      hasDueInfo: !!dueDays || !!dueDate,
      hasNotes:
        !!notes &&
        notes !==
          "Payment due as per the terms above. Thank you for your business.",
    });

    return {
      items,
      clientInfo,
      taxRate,
      dueDays,
      dueDate,
      notes,
      confidence,
    };
  } catch (error) {
    console.error("Error in NLU processing:", error);
    throw new Error("Failed to process text with NLU");
  }
}

/**
 * Extract client information from text
 */
function extractClientInfo(text: string): {
  name: string;
  email: string;
  address: string;
} {
  // Default values
  let clientInfo = {
    name: "Client",
    email: "client@example.com",
    address: "Client Address",
  };

  // Look for explicit client name label
  const clientNameLabelMatch = text.match(
    /client\s+name\s*(?::|is)\s*([\w\s&'-]+?)(?:\.|,|\s+|$)/i,
  );
  if (clientNameLabelMatch && clientNameLabelMatch[1]) {
    clientInfo.name = clientNameLabelMatch[1].trim();
  }

  // Look for explicit address label
  const addressLabelMatch = text.match(
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
  const nameEmailMatch = text.match(
    /([\w\s&'-]+?)\s*\(([\w.+-]+@[\w-]+\.[\w.-]+)\)/i,
  );
  if (nameEmailMatch && nameEmailMatch[1] && nameEmailMatch[2]) {
    clientInfo.name = nameEmailMatch[1].trim();
    clientInfo.email = nameEmailMatch[2].trim();
  } else {
    // Fall back to other patterns
    for (const pattern of namePatterns) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1]) {
        clientInfo.name = nameMatch[1].trim();
        break;
      }
    }

    // Look for email pattern
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) {
      clientInfo.email = emailMatch[0];
    }
  }

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
    const addressMatch = text.match(pattern);
    if (addressMatch && addressMatch[1]) {
      clientInfo.address = addressMatch[1].trim();
      break;
    }
  }

  return clientInfo;
}

/**
 * Extract line items from text with enhanced pattern matching
 */
function extractLineItems(text: string): Array<{
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}> {
  const items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }> = [];

  // Special case for newspaper/subscription delivery patterns
  if (
    text.toLowerCase().includes("newspaper") ||
    text.toLowerCase().includes("herald sun")
  ) {
    // Try to extract date range
    const dateRangePattern =
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(?:to|and|-)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
    const dateRangeMatch = text.match(dateRangePattern);

    // Try to extract days of the week
    const daysPattern =
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?/gi;
    const daysMatches = [...text.matchAll(daysPattern)];
    const days = daysMatches.map((match) => match[1].toLowerCase());

    // Try to extract prices for specific days
    const dayPricePattern =
      /\$(\d+(?:\.\d+)?)\s+(?:on|for)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?/gi;
    const dayPrices = {};
    let dayPriceMatch;
    while ((dayPriceMatch = dayPricePattern.exec(text)) !== null) {
      const price = parseFloat(dayPriceMatch[1]);
      const day = dayPriceMatch[2].toLowerCase();
      dayPrices[day] = price;
    }

    // Alternative pattern: "day is $X"
    const dayIsPricePattern =
      /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\s+(?:is|costs?)\s+\$(\d+(?:\.\d+)?)/gi;
    let dayIsPriceMatch;
    while ((dayIsPriceMatch = dayIsPricePattern.exec(text)) !== null) {
      const day = dayIsPriceMatch[1].toLowerCase();
      const price = parseFloat(dayIsPriceMatch[2]);
      dayPrices[day] = price;
    }

    // If we have date range and days with prices, calculate occurrences
    if (dateRangeMatch && Object.keys(dayPrices).length > 0) {
      const startDateStr = dateRangeMatch[1];
      const endDateStr = dateRangeMatch[2];

      // Parse dates
      const startDate = parseDate(startDateStr);
      const endDate = parseDate(endDateStr);

      if (startDate && endDate) {
        // Count occurrences of each day in the date range
        const dayOccurrences = countDayOccurrences(startDate, endDate);

        // Create line items for each day
        for (const [day, price] of Object.entries(dayPrices)) {
          const dayIndex = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ].indexOf(day);
          if (dayIndex !== -1 && dayOccurrences[dayIndex] > 0) {
            const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
            items.push({
              description: `${capitalizedDay} Herald Sun Newspaper Delivery`,
              quantity: dayOccurrences[dayIndex],
              unitPrice: price,
              amount: dayOccurrences[dayIndex] * price,
            });
          }
        }

        // If we successfully created items, return them
        if (items.length > 0) {
          return items;
        }
      }
    }
  }

  // Standard pattern matching if newspaper-specific logic didn't work
  // Match patterns like "$500 for website design" or "website design for $500"
  const itemPatterns = [
    /\$(\d+(?:\.\d+)?)\s+(?:for|on)\s+([\w\s,'-]+?)(?:\.|,|\s+and\s+|$)/gi,
    /([\w\s,'-]+?)\s+(?:for|at|costs?|:)\s+\$(\d+(?:\.\d+)?)(?:\.|,|\s+and\s+|$)/gi,
    /([\w\s,'-]+?)\s+[-–]\s+\$(\d+(?:\.\d+)?)(?:\.|,|\s+and\s+|$)/gi,
  ];

  // Process each pattern
  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (pattern.source.startsWith("\\$(\\d+(?:\\.\\d+)?)")) {
        // Handle "$X for Y" pattern
        const unitPrice = parseFloat(match[1]);
        const description = match[2].trim();

        items.push({
          description,
          quantity: 1,
          unitPrice,
          amount: unitPrice,
        });
      } else {
        // Handle "X for $Y" pattern
        const description = match[1].trim();
        const unitPrice = parseFloat(match[2]);

        items.push({
          description,
          quantity: 1,
          unitPrice,
          amount: unitPrice,
        });
      }
    }
  }

  // Look for items with quantities
  const quantityPatterns = [
    /(\d+)\s+(?:hours?|hrs?)\s+(?:of\s+)?([\w\s,'-]+?)\s+(?:at|for)\s+\$(\d+(?:\.\d+)?)(?:\s+(?:per|an|each)\s+(?:hour|hr))?/gi,
    /(\d+)\s+([\w\s,'-]+?)\s+(?:at|for)\s+\$(\d+(?:\.\d+)?)\s+(?:per|an|each)/gi,
    /(\d+)\s+([\w\s,'-]+?)\s+(?:at|for)\s+\$(\d+(?:\.\d+)?)/gi,
  ];

  for (const pattern of quantityPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const quantity = parseInt(match[1]);
      const description = match[2].trim();
      const unitPrice = parseFloat(match[3]);
      const amount = quantity * unitPrice;

      items.push({
        description,
        quantity,
        unitPrice,
        amount,
      });
    }
  }

  // If no items were found, add a default item based on context
  if (items.length === 0) {
    const serviceTypes = [
      {
        keywords: ["newspaper", "herald", "sun"],
        service: "Newspaper Delivery Services",
      },
      {
        keywords: ["web", "website", "site"],
        service: "Website Development Services",
      },
      { keywords: ["design", "graphic"], service: "Design Services" },
      {
        keywords: ["content", "writing", "copy"],
        service: "Content Creation Services",
      },
      {
        keywords: ["consult", "advice", "strategy"],
        service: "Consulting Services",
      },
      {
        keywords: ["market", "advertising", "promotion"],
        service: "Marketing Services",
      },
      { keywords: ["seo", "search", "optimization"], service: "SEO Services" },
      { keywords: ["host", "server", "domain"], service: "Hosting Services" },
    ];

    let defaultDescription = "Professional Services";

    for (const type of serviceTypes) {
      if (
        type.keywords.some((keyword) => text.toLowerCase().includes(keyword))
      ) {
        defaultDescription = type.service;
        break;
      }
    }

    // Try to extract a price if mentioned anywhere
    const priceMatch = text.match(/\$(\d+(?:\.\d+)?)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : 100;

    items.push({
      description: defaultDescription,
      quantity: 1,
      unitPrice: price,
      amount: price,
    });
  }

  return items;
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  try {
    // Handle various date formats
    const formats = [
      // MM/DD/YYYY
      (str: string) => {
        const parts = str.split(/[\/\-]/);
        if (parts.length === 3) {
          return new Date(
            parseInt(parts[2]),
            parseInt(parts[0]) - 1,
            parseInt(parts[1]),
          );
        }
        return null;
      },
      // DD/MM/YYYY
      (str: string) => {
        const parts = str.split(/[\/\-]/);
        if (parts.length === 3) {
          return new Date(
            parseInt(parts[2]),
            parseInt(parts[1]) - 1,
            parseInt(parts[0]),
          );
        }
        return null;
      },
      // YYYY/MM/DD
      (str: string) => {
        const parts = str.split(/[\/\-]/);
        if (parts.length === 3 && parts[0].length === 4) {
          return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
          );
        }
        return null;
      },
      // Standard Date parsing
      (str: string) => new Date(str),
    ];

    // Try each format until one works
    for (const format of formats) {
      const date = format(dateStr);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Count occurrences of each day of the week in a date range
 */
function countDayOccurrences(startDate: Date, endDate: Date): number[] {
  const occurrences = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    occurrences[currentDate.getDay()]++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return occurrences;
}

/**
 * Extract tax rate from text
 */
function extractTaxRate(text: string): number {
  const taxPatterns = [
    /(?:apply|with|at|include|including|plus)\s+(\d+(?:\.\d+)?)\s*%\s*(?:tax|gst|vat|sales\s+tax)/i,
    /(\d+(?:\.\d+)?)\s*%\s*(?:tax|gst|vat|sales\s+tax)/i,
  ];

  let taxRate = 10; // Default tax rate
  for (const pattern of taxPatterns) {
    const match = text.match(pattern);
    if (match) {
      taxRate = parseFloat(match[1]);
      break;
    }
  }

  return taxRate;
}

/**
 * Extract due date information from text using chrono-node for advanced date parsing
 */

function extractDueDates(text: string): { dueDays?: number; dueDate?: string } {
  let dueDays: number | undefined;
  let dueDate: string | undefined;

  // First try to extract relative dates like "due in X days/weeks/months"
  const relativePatterns = [
    /due\s+(?:in|within)\s+(\d+)\s*(?:days?|weeks?|months?)/i,
    /(?:net|payment\s+terms|terms)\s+(\d+)/i,
  ];

  for (const pattern of relativePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes("days?|weeks?|months?")) {
        // Handle "due in X days/weeks/months"
        const value = parseInt(match[1]);
        const unit = match[0].toLowerCase();

        if (unit.includes("week")) {
          dueDays = value * 7;
        } else if (unit.includes("month")) {
          dueDays = value * 30;
        } else {
          dueDays = value;
        }
        break;
      } else if (pattern.source.includes("net|payment")) {
        // Handle "net X" or "payment terms X"
        dueDays = parseInt(match[1]);
        break;
      }
    }
  }

  // If no relative date found, try chrono for absolute date parsing
  if (!dueDays && !dueDate) {
    // Look for phrases that indicate a due date
    const duePhrases = [
      "due on",
      "due by",
      "due date",
      "payment due",
      "to be paid by",
      "to be paid on",
      "payment deadline",
      "pay by",
      "pay on",
    ];

    // Find the position of due date phrases in the text
    let duePhraseIndex = -1;
    let foundPhrase = "";

    for (const phrase of duePhrases) {
      const index = text.toLowerCase().indexOf(phrase);
      if (index !== -1 && (duePhraseIndex === -1 || index < duePhraseIndex)) {
        duePhraseIndex = index;
        foundPhrase = phrase;
      }
    }

    // If we found a due phrase, extract the date that follows it
    if (duePhraseIndex !== -1) {
      const textAfterPhrase = text.substring(
        duePhraseIndex + foundPhrase.length,
      );
      const parsedDate = chrono.parseDate(textAfterPhrase);

      if (parsedDate) {
        dueDate = parsedDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      }
    } else {
      // If no specific phrase found, try parsing the entire text for dates
      const parsedResults = chrono.parse(text);

      if (parsedResults.length > 0) {
        // Find the date that's most likely to be a due date (usually after the current date)
        const now = new Date();
        const futureDates = parsedResults
          .map((r) => r.start.date())
          .filter((date) => date > now);

        if (futureDates.length > 0) {
          // Use the closest future date as the due date
          const closestDate = futureDates.reduce((prev, curr) =>
            curr.getTime() - now.getTime() < prev.getTime() - now.getTime()
              ? curr
              : prev,
          );
          dueDate = closestDate.toISOString().split("T")[0];
        } else if (parsedResults.length > 0) {
          // If no future dates, use the last mentioned date
          dueDate = parsedResults[parsedResults.length - 1].start
            .date()
            .toISOString()
            .split("T")[0];
        }
      }
    }
  }

  // If we have dueDays but no specific date, calculate the date
  if (dueDays && !dueDate) {
    const date = new Date();
    date.setDate(date.getDate() + dueDays);
    dueDate = date.toISOString().split("T")[0];
  }

  return { dueDays, dueDate };
}

/**
 * Extract notes from text
 */
function extractNotes(text: string, dueDays?: number): string {
  // Look for notes after keywords with multiple patterns
  const notesPatterns = [
    /(?:notes?|message|comment|additional\s+info|instructions):\s*([^.]+(?:\.[^.]+)*)/i,
    /(?:please\s+(?:add|include)\s+(?:a\s+)?notes?|message|comment):\s*([^.]+(?:\.[^.]+)*)/i,
    /(?:please\s+(?:add|include)\s+(?:the\s+)?(?:following|this)\s+notes?):\s*([^.]+(?:\.[^.]+)*)/i,
    /(?:notes?|message|comment)\s+(?:should\s+(?:say|read|be))\s*["']([^"']+)["']/i,
  ];

  for (const pattern of notesPatterns) {
    const notesMatch = text.match(pattern);
    if (notesMatch && notesMatch[1]) {
      return notesMatch[1].trim();
    }
  }

  // Look for payment instructions
  const paymentPatterns = [
    /(?:payment\s+(?:instructions|details|info)):\s*([^.]+(?:\.[^.]+)*)/i,
    /(?:pay\s+(?:via|using|by))\s+([^.]+(?:\.[^.]+)*)/i,
  ];

  for (const pattern of paymentPatterns) {
    const paymentMatch = text.match(pattern);
    if (paymentMatch && paymentMatch[1]) {
      return `Payment instructions: ${paymentMatch[1].trim()}. Thank you for your business.`;
    }
  }

  // Generate a default note based on the due days
  if (dueDays) {
    return `Payment due within ${dueDays} days. Thank you for your business.`;
  }

  return "Payment due as per the terms above. Thank you for your business.";
}

/**
 * Helper to standardize date formats
 */
function standardizeDate(dateStr: string): string {
  try {
    // Handle various formats and convert to YYYY-MM-DD
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
    return dateStr; // Return as is if parsing fails
  } catch (e) {
    return dateStr;
  }
}

/**
 * Calculate confidence score based on extraction completeness
 */
function calculateConfidence({
  hasClientName,
  hasItems,
  hasTaxRate,
  hasDueInfo,
  hasNotes,
}: {
  hasClientName: boolean;
  hasItems: boolean;
  hasTaxRate: boolean;
  hasDueInfo: boolean;
  hasNotes: boolean;
}): number {
  let score = 0.5; // Base score

  // Add points for each successfully extracted piece of information
  if (hasClientName) score += 0.1;
  if (hasItems) score += 0.2; // Items are most important
  if (hasTaxRate) score += 0.05;
  if (hasDueInfo) score += 0.1;
  if (hasNotes) score += 0.05;

  return Math.min(1, score); // Cap at 1.0
}
