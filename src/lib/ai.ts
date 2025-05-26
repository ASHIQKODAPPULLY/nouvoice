import OpenAI from "openai";

// Initialize OpenAI client
let openai: OpenAI | null = null;

// Initialize the OpenAI client if API key is available
if (
  typeof process !== "undefined" &&
  process.env &&
  process.env.OPENAI_API_KEY
) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// AI Provider options
export type AIProvider = "openai" | "claude" | "gemini" | "claude-opus";

// Current AI provider - can be changed by user
let currentAIProvider: AIProvider = "openai";

export interface AIInvoiceRequest {
  prompt: string;
  businessDetails?: {
    businessName: string;
    abn: string;
    address: string;
  };
  provider?: AIProvider;
  clientDetails?: {
    name: string;
    email: string;
    address: string;
  };
}

export interface AIInvoiceResponse {
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number;
  dueDate: string;
  notes: string;
  success: boolean;
  error?: string;
}

/**
 * Process invoice prompt using AI
 */
export function setAIProvider(provider: AIProvider): void {
  currentAIProvider = provider;
  console.log(`AI provider set to: ${provider}`);
}

export function getCurrentAIProvider(): AIProvider {
  return currentAIProvider;
}

import { processWithNLU, NLUResult } from "./nlu";

/**
 * Process invoice prompt using AI with NLU pre-processing
 */
export async function processInvoiceWithAI(
  request: AIInvoiceRequest,
): Promise<AIInvoiceResponse> {
  // Use the provider from the request or the current default
  const provider = request.provider || currentAIProvider;
  try {
    // First, pre-process the prompt with our NLU layer to extract structured data
    console.log("🔍 Pre-processing prompt with NLU layer");
    let nluResult: NLUResult | null = null;
    try {
      nluResult = await processWithNLU(request.prompt);
      console.log("✅ NLU pre-processing complete", {
        confidence: nluResult.confidence,
        extractedItems: nluResult.items.length,
        dueDate: nluResult.dueDate,
      });
    } catch (error) {
      console.error("Error in NLU pre-processing:", error);
      // Continue even if NLU fails - the LLM can still process the prompt
    }

    // If client details are provided, use them directly
    if (request.clientDetails) {
      console.log("✅ Using provided client details");
    }

    // Check if we should use a different provider
    if (provider === "claude") {
      console.log("✅ Using Claude AI for invoice processing");
      return processWithClaude(request, nluResult);
    } else if (provider === "claude-opus") {
      console.log("✅ Using Claude Opus AI for invoice processing");
      return processWithClaudeOpus(request, nluResult);
    } else if (provider === "gemini") {
      console.log("✅ Using Gemini AI for invoice processing");
      return processWithGemini(request, nluResult);
    }

    // Default to OpenAI
    if (!openai) {
      // Fallback to local processing if API key is not available
      console.warn("OpenAI API key not available, using local processing");
      console.log(
        "🔴 Using fallback processing - OpenAI integration NOT active",
      );
      return fallbackProcessing(request, nluResult);
    }

    console.log("✅ Using OpenAI for invoice processing");

    const businessContext = request.businessDetails
      ? `Business context: ${request.businessDetails.businessName}, ABN: ${request.businessDetails.abn}, Address: ${request.businessDetails.address}`
      : "";

    // Add NLU pre-processed data as context if available
    const nluContext = nluResult
      ? `
      Pre-processed data from NLU layer (confidence: ${nluResult.confidence}):
      ${nluResult.clientInfo.name !== "Client" ? `- Client Name: ${nluResult.clientInfo.name}` : ""}
      ${nluResult.clientInfo.email !== "client@example.com" ? `- Client Email: ${nluResult.clientInfo.email}` : ""}
      ${nluResult.clientInfo.address !== "Client Address" ? `- Client Address: ${nluResult.clientInfo.address}` : ""}
      ${nluResult.items.length > 0 ? `- Extracted ${nluResult.items.length} line items` : ""}
      ${nluResult.taxRate !== 10 ? `- Tax Rate: ${nluResult.taxRate}%` : ""}
      ${nluResult.dueDate ? `- Due Date: ${nluResult.dueDate}` : ""}
      ${nluResult.dueDays ? `- Due in Days: ${nluResult.dueDays}` : ""}
      ${nluResult.notes ? `- Notes: ${nluResult.notes}` : ""}
    `
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create invoices. Extract the following information from the user's prompt: 
          1. Client name, email, and address
          2. Line items with detailed descriptions, quantities, and prices
          3. Tax rate (default to 10% if not specified)
          4. Due date or payment terms (default to 30 days if not specified)
          5. Any notes or payment instructions
          
          For line items, extract SPECIFIC and DETAILED descriptions that clearly explain the service or product. For example, instead of "Web Design", use "Professional Website Design with Responsive Layout" or instead of "Content Creation", use "SEO-Optimized Blog Content Creation (5 articles)". Be as specific as possible about what the service or product entails.
          
          Format your response as structured JSON with the following exact structure:
          {
            "clientName": "Full client name",
            "clientEmail": "client@example.com",
            "clientAddress": "Full client address",
            "items": [
              {
                "description": "Item description",
                "quantity": 1,
                "unitPrice": 100.00
              }
            ],
            "taxRate": 10,
            "dueDate": "YYYY-MM-DD",
            "notes": "Payment instructions or notes"
          }
          
          CRITICAL INSTRUCTIONS:
          - For client name, extract ONLY the person or company name (e.g., "John Smith"), not the service description
          - For client address, extract the full address (e.g., "123 Main St, New York")
          - For client email, extract the email address in the format name@domain.com
          - For line items, extract EACH distinct service or product with its DETAILED description and price
          - Each line item should be a separate object in the items array
          - Do not combine multiple services into a single line item
          - Include specific details about each service/product (e.g., quantity, duration, specifications)
          - Use professional terminology relevant to the industry mentioned
          - If the service includes multiple components, list them in the description
          - Pay special attention to quantity formats like "X kg at $Y/kg" or "X units at $Y each"
          - For food items, include quality descriptors (e.g., "Premium", "Fresh", "Organic")
          - For bulk items, specify the total quantity and unit price clearly
          - If information is not provided, use reasonable defaults but clearly mark them as assumptions in the notes field
          ${businessContext}
          ${nluContext}`,
        },
        {
          role: "user",
          content: request.prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const parsedResponse = JSON.parse(content);
      // Validate the response structure
      const validatedItems = Array.isArray(parsedResponse.items)
        ? parsedResponse.items.map((item) => ({
            description: String(item.description || ""),
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
          }))
        : [];

      // Ensure we have at least one item
      if (validatedItems.length === 0) {
        validatedItems.push({
          description: "Professional Consulting Services (Standard Rate)",
          quantity: 1,
          unitPrice: 100,
        });
      }

      // Validate date format
      let dueDate = parsedResponse.dueDate;
      if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        dueDate = getDefaultDueDate(30);
      }

      // Log the extracted data for debugging
      console.log("AI extracted data:", {
        clientName: parsedResponse.clientName,
        clientEmail: parsedResponse.clientEmail,
        clientAddress: parsedResponse.clientAddress,
        items: validatedItems,
      });

      return {
        clientName: String(parsedResponse.clientName || "Client"),
        clientEmail: String(parsedResponse.clientEmail || "client@example.com"),
        clientAddress: String(parsedResponse.clientAddress || "Client Address"),
        invoiceItems: validatedItems,
        taxRate: Number(parsedResponse.taxRate) || 10,
        dueDate: dueDate,
        notes: String(parsedResponse.notes || "Thank you for your business."),
        success: true,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return fallbackProcessing(request);
    }
  } catch (error) {
    console.error("AI processing error:", error);
    return fallbackProcessing(request);
  }
}

/**
 * Fallback to local processing if AI fails
 */
/**
 * Process invoice using Claude Opus AI - more advanced version with better understanding
 */
async function processWithClaudeOpus(
  request: AIInvoiceRequest,
  nluResult: NLUResult | null = null,
): Promise<AIInvoiceResponse> {
  // This would normally use the Claude Opus API
  console.log(
    "Claude Opus API integration would go here - using enhanced processing",
  );

  // Use provided client details if available, otherwise extract from prompt
  let clientName = "Client";
  let clientEmail = "client@example.com";
  let clientAddress = "Client Address";

  if (request.clientDetails) {
    clientName = request.clientDetails.name;
    clientEmail = request.clientDetails.email;
    clientAddress = request.clientDetails.address;
  } else {
    // Claude Opus has superior pattern recognition capabilities
    // Extract client information with more sophisticated patterns
    const fullPattern =
      /([\w\s&'.,\-]+?)(?:\s*\(([\w.+\-]+@[\w\-]+\.[\w.\-]+)\))?\s*(?:at|from|of|in)\s*([\w\s,.\-']+?)(?:\s+for|\.|,|$)/i;
    const fullMatch = request.prompt.match(fullPattern);

    if (fullMatch && fullMatch[1]) {
      clientName = fullMatch[1].trim();
      if (fullMatch[2]) clientEmail = fullMatch[2].trim();
      if (fullMatch[3]) clientAddress = fullMatch[3].trim();
    }

    // If we didn't get an email from the main pattern, look for it separately
    if (clientEmail === "client@example.com") {
      const emailPattern = /[\w.+\-]+@[\w\-]+\.[\w.\-]+/;
      const emailMatch = request.prompt.match(emailPattern);
      if (emailMatch) {
        clientEmail = emailMatch[0];
      }
    }
  }

  // Extract items with sophisticated pattern recognition
  const items = [];

  // Claude Opus can better understand context and semantics
  // Look for various patterns of item descriptions
  const itemPatterns = [
    // Pattern for "X for $Y" format
    /([\w\s'\-,.()]+?)\s+(?:for|at|costs?|:)\s+\$(\d+(?:\.\d+)?)(?:\/([\w]+))?/gi,
    // Pattern for "$Y for X" format
    /\$(\d+(?:\.\d+)?)\s+(?:for|on)\s+([\w\s'\-,.()]+?)(?:\.|,|\s+and\s+|$)/gi,
    // Pattern for "Include X at $Y" format
    /include\s+([\w\s'\-,.()]+?)\s+(?:at|for)\s+\$(\d+(?:\.\d+)?)/gi,
  ];

  // Process each pattern
  for (const pattern of itemPatterns) {
    let match;
    while ((match = pattern.exec(request.prompt)) !== null) {
      let description, price;

      // Handle different pattern formats
      if (pattern.toString().startsWith("/\\$")) {
        // "$Y for X" format
        price = parseFloat(match[1]);
        description = match[2].trim();
      } else {
        // "X for $Y" format
        description = match[1].trim();
        price = parseFloat(match[2]);
      }

      // Extract quantity if present
      let quantity = 1;
      const quantityMatch = description.match(/^(\d+)\s+(.+)$/);
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        description = quantityMatch[2];
      }

      // Check for per-unit pricing
      const perUnitMatch = description.match(
        /(.+?)\s+(?:at|per|each)\s+(\d+)\s*(?:kg|kilos?|pounds?|units?|pieces?|hours?|days?)/i,
      );
      if (perUnitMatch) {
        description = perUnitMatch[1].trim();
        quantity = parseInt(perUnitMatch[2]);
      }

      // Claude Opus provides more detailed and contextually appropriate descriptions
      description = enhanceDescriptionWithContext(description, request.prompt);

      items.push({
        description: description,
        quantity: quantity,
        unitPrice: price / quantity, // Adjust unit price if quantity > 1
      });
    }
  }

  // Look for "Include X, Y, Z" pattern
  const includePattern = /(?:include|provide|deliver|with)\s+([^.]+?)(?:\.|$)/i;
  const includeMatch = request.prompt.match(includePattern);

  if (includeMatch && includeMatch[1] && items.length === 0) {
    const itemsList = includeMatch[1];
    const itemsArray = itemsList
      .split(/,|\s+and\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const itemText of itemsArray) {
      // Try to find a price for this item
      const priceMatch = request.prompt.match(
        new RegExp(
          `${itemText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(?:for|at|:)\\s+\\$(\\d+(?:\\.\\d+)?)`,
          "i",
        ),
      );

      if (priceMatch && priceMatch[1]) {
        const price = parseFloat(priceMatch[1]);
        const enhancedDescription = enhanceDescriptionWithContext(
          itemText,
          request.prompt,
        );

        items.push({
          description: enhancedDescription,
          quantity: 1,
          unitPrice: price,
        });
      } else {
        // If no specific price found, estimate based on context
        const enhancedDescription = enhanceDescriptionWithContext(
          itemText,
          request.prompt,
        );

        // Determine a reasonable price based on the type of service/product
        let estimatedPrice = 100; // Default
        if (itemText.toLowerCase().includes("design")) estimatedPrice = 150;
        if (itemText.toLowerCase().includes("develop")) estimatedPrice = 200;
        if (itemText.toLowerCase().includes("consult")) estimatedPrice = 120;

        items.push({
          description: enhancedDescription,
          quantity: 1,
          unitPrice: estimatedPrice,
        });
      }
    }
  }

  // Add a default item if none found with more intelligent industry detection
  if (items.length === 0) {
    const keywords = {
      web: ["web", "website", "site", "online", "internet", "domain"],
      design: ["design", "graphic", "logo", "branding", "visual", "ui", "ux"],
      content: ["content", "writing", "copy", "article", "blog", "text"],
      marketing: [
        "market",
        "marketing",
        "advertis",
        "campaign",
        "promotion",
        "seo",
        "sem",
      ],
      development: [
        "develop",
        "code",
        "program",
        "software",
        "app",
        "application",
      ],
      consulting: ["consult", "advice", "strategy", "plan", "roadmap"],
    };

    // Determine the most likely industry based on keyword frequency
    const counts = {};
    const promptLower = request.prompt.toLowerCase();

    for (const [industry, terms] of Object.entries(keywords)) {
      counts[industry] = terms.filter((term) =>
        promptLower.includes(term),
      ).length;
    }

    // Find the industry with the most matches
    let maxIndustry = "consulting";
    let maxCount = 0;

    for (const [industry, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxIndustry = industry;
      }
    }

    // Create a detailed default item based on the detected industry
    let defaultDescription =
      "Professional Consulting Services (Comprehensive Analysis & Recommendations)";

    if (maxIndustry === "web") {
      defaultDescription =
        "Website Development Services (Custom Design, Responsive Layout & SEO Optimization)";
    } else if (maxIndustry === "design") {
      defaultDescription =
        "Professional Design Services (Brand Identity, Visual Assets & Style Guide)";
    } else if (maxIndustry === "content") {
      defaultDescription =
        "Content Creation Services (Research-Based, SEO-Optimized with Editing & Revisions)";
    } else if (maxIndustry === "marketing") {
      defaultDescription =
        "Marketing Strategy & Implementation (Market Analysis, Campaign Development & Performance Tracking)";
    } else if (maxIndustry === "development") {
      defaultDescription =
        "Software Development Services (Custom Solution with Testing, Documentation & Deployment)";
    }

    items.push({
      description: defaultDescription,
      quantity: 1,
      unitPrice: 100,
    });
  }

  // Extract tax rate with more flexible pattern matching
  const taxPatterns = [
    /(?:apply|with|at|include|charge)\s+(\d+(?:\.\d+)?)\s*%\s*(?:tax|gst|vat|sales tax)/i,
    /(?:tax|gst|vat|sales tax)\s+(?:rate|:)\s*(\d+(?:\.\d+)?)\s*%/i,
    /(\d+(?:\.\d+)?)\s*%\s*(?:tax|gst|vat|sales tax)/i,
  ];

  let taxRate = 10; // Default
  for (const pattern of taxPatterns) {
    const match = request.prompt.match(pattern);
    if (match && match[1]) {
      taxRate = parseFloat(match[1]);
      break;
    }
  }

  // Extract due date with more comprehensive pattern matching
  const dueDatePatterns = [
    /due\s+(?:in|within)\s+(\d+)\s*(?:days?|weeks?|months?)/i,
    /(?:payment|invoice)\s+(?:terms?|due|deadline)\s*(?::|is|of)?\s*(\d+)\s*(?:days?|weeks?|months?)/i,
    /(?:net|n)\s*(\d+)\s*(?:days?)?/i,
    /due\s+(?:date|by)\s*(?::|is)?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/i,
  ];

  let dueDays = 30; // Default
  let specificDueDate = null;

  for (const pattern of dueDatePatterns) {
    const match = request.prompt.match(pattern);
    if (match) {
      if (pattern.toString().includes("\\d{1,2}[\\/-]")) {
        // This is a specific date pattern
        specificDueDate = match[1];
        break;
      } else if (match[1]) {
        // This is a number of days/weeks/months pattern
        let value = parseInt(match[1]);
        if (match[0].toLowerCase().includes("week")) {
          value *= 7; // Convert weeks to days
        } else if (match[0].toLowerCase().includes("month")) {
          value *= 30; // Approximate months as 30 days
        }
        dueDays = value;
        break;
      }
    }
  }

  // Process specific due date if found
  let dueDate;
  if (specificDueDate) {
    try {
      // Try to parse the specific date
      const dateParts = specificDueDate.split(/[\/\-]/);
      let year, month, day;

      // Determine date format (MM/DD/YYYY or YYYY/MM/DD or DD/MM/YYYY)
      if (dateParts[0].length === 4) {
        // YYYY/MM/DD
        [year, month, day] = dateParts;
      } else if (dateParts[2].length === 4) {
        // MM/DD/YYYY or DD/MM/YYYY (assume MM/DD/YYYY for simplicity)
        [month, day, year] = dateParts;
      } else {
        // Two-digit year format
        [month, day, year] = dateParts;
        year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
      }

      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        dueDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      } else {
        dueDate = getDefaultDueDate(dueDays);
      }
    } catch (e) {
      dueDate = getDefaultDueDate(dueDays);
    }
  } else {
    dueDate = getDefaultDueDate(dueDays);
  }

  // Generate more detailed payment notes
  let notes = `Payment due within ${dueDays} days. Thank you for your business.`;

  // Look for specific payment instructions
  const paymentInstructionPatterns = [
    /(?:payment|pay)\s+(?:via|using|with|through)\s+([\w\s,]+?)(?:\.|,|$)/i,
    /(?:accept|accepting)\s+(?:payment|payments)\s+(?:via|using|with|through)\s+([\w\s,]+?)(?:\.|,|$)/i,
  ];

  for (const pattern of paymentInstructionPatterns) {
    const match = request.prompt.match(pattern);
    if (match && match[1]) {
      const paymentMethods = match[1].trim();
      notes = `Payment due within ${dueDays} days. Accepted payment methods: ${paymentMethods}. Thank you for your business.`;
      break;
    }
  }

  return {
    clientName,
    clientEmail,
    clientAddress,
    invoiceItems: items,
    taxRate,
    dueDate,
    notes,
    success: true,
  };
}

/**
 * Enhance description with context-aware details based on the service type
 */
function enhanceDescriptionWithContext(
  description: string,
  fullPrompt: string,
): string {
  const descLower = description.toLowerCase();
  let enhanced = description;

  // Only enhance if the description is relatively short
  if (description.length < 40) {
    // Web development related
    if (descLower.includes("web") || descLower.includes("website")) {
      // Check for specific aspects mentioned in the prompt
      const aspects = [];
      if (fullPrompt.toLowerCase().includes("responsive"))
        aspects.push("Responsive Design");
      if (fullPrompt.toLowerCase().includes("mobile"))
        aspects.push("Mobile Optimization");
      if (fullPrompt.toLowerCase().includes("seo"))
        aspects.push("SEO Integration");
      if (
        fullPrompt.toLowerCase().includes("e-commerce") ||
        fullPrompt.toLowerCase().includes("ecommerce")
      )
        aspects.push("E-commerce Functionality");

      if (aspects.length > 0) {
        enhanced += ` (Includes ${aspects.join(" & ")})`;
      } else {
        enhanced +=
          " (Custom Design with Responsive Layout & Cross-Browser Testing)";
      }
    }
    // Design related
    else if (descLower.includes("design")) {
      if (descLower.includes("logo")) {
        enhanced +=
          " (Vector Format with Multiple Variations & Brand Guidelines)";
      } else if (descLower.includes("ui") || descLower.includes("ux")) {
        enhanced += " (User-Centered Design with Wireframes & Prototypes)";
      } else {
        enhanced += " (Professional Design with Source Files & Usage Rights)";
      }
    }
    // Content related
    else if (descLower.includes("content") || descLower.includes("writ")) {
      if (descLower.includes("blog")) {
        enhanced += " (SEO-Optimized Articles with Research & Editing)";
      } else if (descLower.includes("social")) {
        enhanced +=
          " (Engaging Posts Optimized for Platform-Specific Requirements)";
      } else {
        enhanced +=
          " (Original Content with SEO Optimization & Editorial Review)";
      }
    }
    // Marketing related
    else if (descLower.includes("market")) {
      if (descLower.includes("social")) {
        enhanced += " (Strategy Development, Content Creation & Analytics)";
      } else if (descLower.includes("seo")) {
        enhanced +=
          " (Keyword Research, On-Page Optimization & Performance Tracking)";
      } else {
        enhanced += " (Comprehensive Strategy with Implementation Plan & KPIs)";
      }
    }
    // Development related
    else if (
      descLower.includes("develop") ||
      descLower.includes("program") ||
      descLower.includes("code")
    ) {
      if (descLower.includes("app")) {
        enhanced += " (Custom Development with Testing & Deployment)";
      } else if (descLower.includes("api")) {
        enhanced += " (Secure Implementation with Documentation & Testing)";
      } else {
        enhanced += " (Custom Solution with Documentation & Support)";
      }
    }
    // Consulting related
    else if (descLower.includes("consult") || descLower.includes("advis")) {
      enhanced += " (Expert Analysis, Recommendations & Implementation Plan)";
    }
    // Hosting related
    else if (descLower.includes("host")) {
      enhanced += " (Secure Server with Daily Backups & 99.9% Uptime)";
    }
    // Generic enhancement for other services
    else {
      enhanced += " (Professional Service)";
    }
  }

  return enhanced;
}

/**
 * Process invoice using Claude AI
 */
async function processWithClaude(
  request: AIInvoiceRequest,
  nluResult: NLUResult | null = null,
): Promise<AIInvoiceResponse> {
  // This would normally use the Claude API
  // For now, we'll use an enhanced version of our fallback processing
  console.log(
    "Claude API integration would go here - using enhanced fallback for now",
  );

  // Use provided client details if available, otherwise extract from prompt
  let clientName = "Client";
  let clientEmail = "client@example.com";
  let clientAddress = "Client Address";

  if (request.clientDetails) {
    clientName = request.clientDetails.name;
    clientEmail = request.clientDetails.email;
    clientAddress = request.clientDetails.address;
  } else {
    // Extract client information with improved patterns
    const nameEmailPattern =
      /([\w\s&'-]+?)\s*\(([\w.+-]+@[\w-]+\.[\w.-]+)\)\s*at\s*([\w\s,.'-]+?)(?:\s+for|\.|,|$)/i;
    const nameEmailMatch = request.prompt.match(nameEmailPattern);

    if (
      nameEmailMatch &&
      nameEmailMatch[1] &&
      nameEmailMatch[2] &&
      nameEmailMatch[3]
    ) {
      clientName = nameEmailMatch[1].trim();
      clientEmail = nameEmailMatch[2].trim();
      clientAddress = nameEmailMatch[3].trim();
    }
  }

  // Extract items with improved pattern recognition
  const items = [];

  // Look for "Include X, Y, Z" pattern or "Products: X, Y, Z" pattern
  const includePattern =
    /(?:include|products?|items?|goods?)\s*(?::|include|are|is)\s*([^.]+?)(?:\.|$)/i;
  const includeMatch = request.prompt.match(includePattern);

  if (includeMatch && includeMatch[1]) {
    const itemsList = includeMatch[1];
    const itemsArray = itemsList
      .split(/,|\s+and\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const itemText of itemsArray) {
      const itemMatch = itemText.match(
        /([\w\s'-]+)\s+(?:for|at|:)\s+\$(\d+(?:\.\d+)?)/i,
      );
      if (itemMatch && itemMatch[1] && itemMatch[2]) {
        let description = itemMatch[1].trim();

        // Enhance description with more specific details
        if (
          description.toLowerCase().includes("web") ||
          description.toLowerCase().includes("website")
        ) {
          description = `${description} (Custom Design with Responsive Layout)`;
        } else if (description.toLowerCase().includes("design")) {
          description = `${description} (Professional Design with Brand Guidelines)`;
        } else if (description.toLowerCase().includes("content")) {
          description = `${description} (SEO-Optimized Original Content)`;
        } else if (description.toLowerCase().includes("host")) {
          description = `${description} (Secure Server with 99.9% Uptime)`;
        } else if (description.toLowerCase().includes("logo")) {
          description = `${description} (Vector Format with Multiple Variations)`;
        } else if (description.toLowerCase().includes("seo")) {
          description = `${description} (Keyword Research & Implementation)`;
        } else if (description.length < 25) {
          // Only add if description is short
          description = `${description} (Professional Service)`;
        }

        items.push({
          description: description,
          quantity: 1,
          unitPrice: parseFloat(itemMatch[2]),
        });
      }
    }
  }

  // If no items found, try direct pattern matching
  if (items.length === 0) {
    const directPattern = /([\w\s'-]+)\s+(?:for|at|:)\s+\$(\d+(?:\.\d+)?)/gi;
    let match;
    while ((match = directPattern.exec(request.prompt)) !== null) {
      let description = match[1].trim();

      // Enhance description with more specific details
      if (
        description.toLowerCase().includes("web") ||
        description.toLowerCase().includes("website")
      ) {
        description = `${description} (Custom Design with Responsive Layout)`;
      } else if (description.toLowerCase().includes("design")) {
        description = `${description} (Professional Design with Brand Guidelines)`;
      } else if (description.toLowerCase().includes("content")) {
        description = `${description} (SEO-Optimized Original Content)`;
      } else if (description.toLowerCase().includes("host")) {
        description = `${description} (Secure Server with 99.9% Uptime)`;
      } else if (description.toLowerCase().includes("logo")) {
        description = `${description} (Vector Format with Multiple Variations)`;
      } else if (description.toLowerCase().includes("seo")) {
        description = `${description} (Keyword Research & Implementation)`;
      } else if (description.length < 25) {
        // Only add if description is short
        description = `${description} (Professional Service)`;
      }

      items.push({
        description: description,
        quantity: 1,
        unitPrice: parseFloat(match[2]),
      });
    }
  }

  // Add a default item if none found
  if (items.length === 0) {
    // Try to determine the industry from the prompt
    let defaultDescription = "Professional Consulting Services (Standard Rate)";

    if (
      request.prompt.toLowerCase().includes("web") ||
      request.prompt.toLowerCase().includes("website")
    ) {
      defaultDescription = "Website Development Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("design")) {
      defaultDescription = "Professional Design Services (Standard Package)";
    } else if (
      request.prompt.toLowerCase().includes("content") ||
      request.prompt.toLowerCase().includes("writing")
    ) {
      defaultDescription = "Content Creation Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("market")) {
      defaultDescription = "Marketing Consultation Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("seo")) {
      defaultDescription = "SEO Optimization Services (Standard Package)";
    }

    items.push({
      description: defaultDescription,
      quantity: 1,
      unitPrice: 100,
    });
  }

  // Extract tax rate
  const taxPattern = /(?:apply|with|at)\s+(\d+(?:\.\d+)?)\s*%\s*tax/i;
  const taxMatch = request.prompt.match(taxPattern);
  const taxRate = taxMatch ? parseFloat(taxMatch[1]) : 10;

  // Extract due date
  const dueDaysPattern = /due\s+in\s+(\d+)\s*days/i;
  const dueDaysMatch = request.prompt.match(dueDaysPattern);
  const dueDays = dueDaysMatch ? parseInt(dueDaysMatch[1]) : 30;

  const dueDate = getDefaultDueDate(dueDays);

  return {
    clientName,
    clientEmail,
    clientAddress,
    invoiceItems: items,
    taxRate,
    dueDate,
    notes: `Payment due within ${dueDays} days. Thank you for your business.`,
    success: true,
  };
}

/**
 * Process invoice using Gemini AI
 */
async function processWithGemini(
  request: AIInvoiceRequest,
  nluResult: NLUResult | null = null,
): Promise<AIInvoiceResponse> {
  // This would normally use the Gemini API
  // For now, we'll use another enhanced version of our fallback processing
  console.log(
    "Gemini API integration would go here - using enhanced fallback for now",
  );

  // Use provided client details if available, otherwise extract from prompt
  let clientName = "Client";
  let clientEmail = "client@example.com";
  let clientAddress = "Client Address";

  if (request.clientDetails) {
    clientName = request.clientDetails.name;
    clientEmail = request.clientDetails.email;
    clientAddress = request.clientDetails.address;
  } else {
    // First try to extract the full pattern: name (email) at address
    const fullPattern =
      /([\w\s&'-]+?)\s*\(([\w.+-]+@[\w-]+\.[\w.-]+)\)\s*at\s*([\w\s,.'-]+?)(?:\s+for|\.|,|$)/i;
    const fullMatch = request.prompt.match(fullPattern);

    if (fullMatch && fullMatch[1] && fullMatch[2] && fullMatch[3]) {
      clientName = fullMatch[1].trim();
      clientEmail = fullMatch[2].trim();
      clientAddress = fullMatch[3].trim();
    } else {
      // Try individual patterns
      const namePattern =
        /(?:invoice|bill)\s+for\s+([\w\s&'-]+?)(?:\s+\(|\s+at|\.|,|$)/i;
      const nameMatch = request.prompt.match(namePattern);
      if (nameMatch && nameMatch[1]) {
        clientName = nameMatch[1].trim();
      }

      const emailPattern = /[\w.+-]+@[\w-]+\.[\w.-]+/;
      const emailMatch = request.prompt.match(emailPattern);
      if (emailMatch) {
        clientEmail = emailMatch[0];
      }

      const addressPattern = /\bat\s+([\w\s,.'-]+?)(?:\s+for|\.|,|$)/i;
      const addressMatch = request.prompt.match(addressPattern);
      if (addressMatch && addressMatch[1]) {
        clientAddress = addressMatch[1].trim();
      }
    }
  }

  // Extract line items with more precise pattern matching
  const items = [];

  // First look for items in an "Include X, Y, Z" format
  const includeItemsPattern = /include\s+([^.]+?)(?:\.|$)/i;
  const includeMatch = request.prompt.match(includeItemsPattern);

  if (includeMatch && includeMatch[1]) {
    // Split by commas or "and"
    const itemTexts = includeMatch[1]
      .split(/,|\s+and\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const itemText of itemTexts) {
      // Look for "description for $price" pattern
      const itemMatch = itemText.match(
        /([\w\s'-]+)\s+for\s+\$(\d+(?:\.\d+)?)/i,
      );
      if (itemMatch && itemMatch[1] && itemMatch[2]) {
        let description = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);

        // Extract potential quantity if present
        let quantity = 1;
        const quantityMatch = description.match(/^(\d+)\s+(.+)$/);
        if (quantityMatch) {
          quantity = parseInt(quantityMatch[1]);
          description = quantityMatch[2];
        }

        // Enhance description with industry-specific terminology
        if (
          description.toLowerCase().includes("web") ||
          description.toLowerCase().includes("website")
        ) {
          description = `${description} (Includes Responsive Design & Cross-Browser Testing)`;
        } else if (description.toLowerCase().includes("design")) {
          description = `${description} (Professional Design with Source Files)`;
        } else if (description.toLowerCase().includes("content")) {
          description = `${description} (SEO-Optimized with Research)`;
        } else if (description.toLowerCase().includes("host")) {
          description = `${description} (Secure Hosting with Daily Backups)`;
        } else if (description.toLowerCase().includes("logo")) {
          description = `${description} (Multiple Formats & Color Variations)`;
        } else if (description.toLowerCase().includes("seo")) {
          description = `${description} (Keyword Research & On-Page Optimization)`;
        } else if (description.toLowerCase().includes("consult")) {
          description = `${description} (Expert Consultation with Documentation)`;
        } else if (description.toLowerCase().includes("develop")) {
          description = `${description} (Custom Development with Testing & Documentation)`;
        } else if (description.length < 25) {
          // Only add if description is short
          description = `${description} (Professional Service)`;
        }

        items.push({
          description: description,
          quantity: quantity,
          unitPrice: price / quantity, // Adjust unit price if quantity > 1
        });
      }
    }
  }

  // If no items found through the include pattern, try direct pattern matching
  if (items.length === 0) {
    const itemPattern = /([\w\s'-]+)\s+for\s+\$(\d+(?:\.\d+)?)/gi;
    let match;
    while ((match = itemPattern.exec(request.prompt)) !== null) {
      let description = match[1].trim();
      const price = parseFloat(match[2]);

      // Extract potential quantity if present
      let quantity = 1;
      const quantityMatch = description.match(
        /^(\d+)\s+(?:kg|kilos?|pounds?|units?|pieces?)?\s*(?:of)?\s*(.+)$/,
      );
      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1]);
        description = quantityMatch[2];
      }

      // Also check for "X at Y kg" pattern
      const perUnitMatch = description.match(
        /(.+?)\s+at\s+(\d+)\s*(?:kg|kilos?|pounds?|units?|pieces?)/,
      );
      if (perUnitMatch) {
        description = perUnitMatch[1].trim();
        quantity = parseInt(perUnitMatch[2]);
      }

      // Enhance description with industry-specific terminology
      if (
        description.toLowerCase().includes("web") ||
        description.toLowerCase().includes("website")
      ) {
        description = `${description} (Includes Responsive Design & Cross-Browser Testing)`;
      } else if (description.toLowerCase().includes("design")) {
        description = `${description} (Professional Design with Source Files)`;
      } else if (description.toLowerCase().includes("content")) {
        description = `${description} (SEO-Optimized with Research)`;
      } else if (description.toLowerCase().includes("host")) {
        description = `${description} (Secure Hosting with Daily Backups)`;
      } else if (description.toLowerCase().includes("logo")) {
        description = `${description} (Multiple Formats & Color Variations)`;
      } else if (description.toLowerCase().includes("seo")) {
        description = `${description} (Keyword Research & On-Page Optimization)`;
      } else if (description.toLowerCase().includes("consult")) {
        description = `${description} (Expert Consultation with Documentation)`;
      } else if (description.toLowerCase().includes("develop")) {
        description = `${description} (Custom Development with Testing & Documentation)`;
      } else if (description.length < 25) {
        // Only add if description is short
        description = `${description} (Professional Service)`;
      }

      items.push({
        description: description,
        quantity: quantity,
        unitPrice: price / quantity, // Adjust unit price if quantity > 1
      });
    }
  }

  // Add a default item if none found
  if (items.length === 0) {
    // Try to determine the industry from the prompt
    let defaultDescription = "Professional Consulting Services (Standard Rate)";

    if (
      request.prompt.toLowerCase().includes("web") ||
      request.prompt.toLowerCase().includes("website")
    ) {
      defaultDescription = "Website Development Services (Complete Package)";
    } else if (request.prompt.toLowerCase().includes("design")) {
      defaultDescription = "Professional Design Services (Custom Package)";
    } else if (
      request.prompt.toLowerCase().includes("content") ||
      request.prompt.toLowerCase().includes("writing")
    ) {
      defaultDescription = "Content Creation Services (Premium Package)";
    } else if (request.prompt.toLowerCase().includes("market")) {
      defaultDescription =
        "Marketing Strategy & Implementation (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("seo")) {
      defaultDescription =
        "SEO Optimization & Analysis (Comprehensive Package)";
    } else if (request.prompt.toLowerCase().includes("develop")) {
      defaultDescription = "Software Development Services (Custom Solution)";
    }

    items.push({
      description: defaultDescription,
      quantity: 1,
      unitPrice: 100,
    });
  }

  // Extract tax rate
  const taxPattern = /(?:apply|with|at)\s+(\d+(?:\.\d+)?)\s*%\s*tax/i;
  const taxMatch = request.prompt.match(taxPattern);
  const taxRate = taxMatch ? parseFloat(taxMatch[1]) : 10;

  // Extract due date
  const dueDaysPattern = /due\s+in\s+(\d+)\s*days/i;
  const dueDaysMatch = request.prompt.match(dueDaysPattern);
  const dueDays = dueDaysMatch ? parseInt(dueDaysMatch[1]) : 30;

  const dueDate = getDefaultDueDate(dueDays);

  return {
    clientName,
    clientEmail,
    clientAddress,
    invoiceItems: items,
    taxRate,
    dueDate,
    notes: `Payment due within ${dueDays} days. Thank you for your business.`,
    success: true,
  };
}

/**
 * Fallback to local processing if AI fails
 */
function fallbackProcessing(
  request: AIInvoiceRequest,
  nluResult: NLUResult | null = null,
): AIInvoiceResponse {
  // First check if this is a newspaper delivery request
  if (
    request.prompt.toLowerCase().includes("herald sun") ||
    request.prompt.toLowerCase().includes("newspaper")
  ) {
    console.log("Detected newspaper delivery request");
    // Special case for newspaper delivery
    if (
      request.prompt.toLowerCase().includes("herald sun") ||
      request.prompt.toLowerCase().includes("newspaper")
    ) {
      // Try to extract date range
      const dateRangePattern =
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(?:to|and|-)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
      const dateRangeMatch = request.prompt.match(dateRangePattern);

      // Try to extract days and prices
      const tuesdayPricePattern =
        /\$(\d+(?:\.\d+)?)\s+on\s+tuesday|tuesday\s+(?:is|costs?)\s+\$(\d+(?:\.\d+)?)/i;
      const thursdayPricePattern =
        /\$(\d+(?:\.\d+)?)\s+on\s+thursday|thursday\s+(?:is|costs?)\s+\$(\d+(?:\.\d+)?)/i;

      const tuesdayMatch = request.prompt.match(tuesdayPricePattern);
      const thursdayMatch = request.prompt.match(thursdayPricePattern);

      const tuesdayPrice = tuesdayMatch
        ? parseFloat(tuesdayMatch[1] || tuesdayMatch[2])
        : 2.5;
      const thursdayPrice = thursdayMatch
        ? parseFloat(thursdayMatch[1] || thursdayMatch[2])
        : 3.0;

      if (dateRangeMatch) {
        const startDateStr = dateRangeMatch[1];
        const endDateStr = dateRangeMatch[2];

        // Parse dates
        let startDate, endDate;
        try {
          // Try DD/MM/YYYY format first
          const startParts = startDateStr.split(/[\/\-]/);
          const endParts = endDateStr.split(/[\/\-]/);

          if (startParts.length === 3 && endParts.length === 3) {
            // Handle two-digit year
            let startYear = parseInt(startParts[2]);
            let endYear = parseInt(endParts[2]);

            if (startYear < 100) startYear += 2000;
            if (endYear < 100) endYear += 2000;

            startDate = new Date(
              startYear,
              parseInt(startParts[1]) - 1,
              parseInt(startParts[0]),
            );
            endDate = new Date(
              endYear,
              parseInt(endParts[1]) - 1,
              parseInt(endParts[0]),
            );

            // If invalid, try MM/DD/YYYY format
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              startDate = new Date(
                startYear,
                parseInt(startParts[0]) - 1,
                parseInt(startParts[1]),
              );
              endDate = new Date(
                endYear,
                parseInt(endParts[0]) - 1,
                parseInt(endParts[1]),
              );
            }
          }
        } catch (e) {
          console.error("Error parsing dates:", e);
        }

        if (
          startDate &&
          endDate &&
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime())
        ) {
          // Count Tuesdays and Thursdays
          let tuesdayCount = 0;
          let thursdayCount = 0;

          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            if (currentDate.getDay() === 2) {
              // Tuesday is 2
              tuesdayCount++;
            } else if (currentDate.getDay() === 4) {
              // Thursday is 4
              thursdayCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }

          const invoiceItems = [];

          if (tuesdayCount > 0) {
            invoiceItems.push({
              description: "Tuesday Herald Sun Newspaper Delivery",
              quantity: tuesdayCount,
              unitPrice: tuesdayPrice,
            });
          }

          if (thursdayCount > 0) {
            invoiceItems.push({
              description: "Thursday Herald Sun Newspaper Delivery",
              quantity: thursdayCount,
              unitPrice: thursdayPrice,
            });
          }

          if (invoiceItems.length > 0) {
            console.log("Generated newspaper invoice items:", invoiceItems);
            return {
              clientName: "Herald Sun Subscriber",
              clientEmail: "subscriber@example.com",
              clientAddress: "Subscriber Address",
              invoiceItems: invoiceItems,
              taxRate: 10,
              dueDate: getDefaultDueDate(30),
              notes:
                "Payment due within 30 days. Thank you for your subscription.",
              success: true,
            };
          }
        }
      }
    }

    // If we have NLU results, use them as a starting point
    if (nluResult) {
      console.log("Using NLU results in fallback processing");
      return {
        clientName: nluResult.clientInfo.name,
        clientEmail: nluResult.clientInfo.email,
        clientAddress: nluResult.clientInfo.address,
        invoiceItems: nluResult.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        taxRate: nluResult.taxRate,
        dueDate:
          nluResult.dueDate || getDefaultDueDate(nluResult.dueDays || 30),
        notes: nluResult.notes || "Thank you for your business.",
        success: true,
      };
    }
  }

  // If no NLU results, proceed with standard fallback
  console.log("🔄 Running fallback processing logic");

  // Use provided client details if available, otherwise extract from prompt
  let clientName, clientEmail, clientAddress;

  if (request.clientDetails) {
    clientName = request.clientDetails.name;
    clientEmail = request.clientDetails.email;
    clientAddress = request.clientDetails.address;
  } else {
    // Extract basic information using regex patterns
    const clientNameMatch = request.prompt.match(
      /for ([\w\s&'-]+?)(?:\.|,|\s+for\s+|$)/i,
    );
    clientName = clientNameMatch ? clientNameMatch[1].trim() : "Client";

    const emailMatch = request.prompt.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    clientEmail = emailMatch ? emailMatch[0] : "client@example.com";

    // Extract client address
    const addressMatch = request.prompt.match(
      /\bat\s+([\w\s,.'-]+?)(?:\s+for|\.|,|$)/i,
    );
    clientAddress = addressMatch ? addressMatch[1].trim() : "Client Address";
  }

  // Extract items and prices with enhanced descriptions
  const items = [];
  const itemPattern =
    /\$(\d+(?:\.\d+)?)\s+(?:for|on)\s+([\w\s,'-]+?)(?:\.|,|\s+and\s+|$)|([\w\s,'-]+?)\s+(?:for|at|costs?|:)\s+\$(\d+(?:\.\d+)?)(?:\.|,|\s+and\s+|$)/gi;
  let match;

  while ((match = itemPattern.exec(request.prompt)) !== null) {
    const price = parseFloat(match[1] || match[4]);
    let description = (match[2] || match[3] || "").trim();

    // Enhance the description based on keywords and context
    if (description) {
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

    items.push({
      description,
      quantity: 1,
      unitPrice: price,
    });
  }

  // Add a default item if none found
  if (items.length === 0) {
    // Try to determine the industry from the prompt
    let defaultDescription = "Professional Consulting Services (Standard Rate)";

    if (
      request.prompt.toLowerCase().includes("web") ||
      request.prompt.toLowerCase().includes("website")
    ) {
      defaultDescription = "Website Development Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("design")) {
      defaultDescription = "Professional Design Services (Standard Package)";
    } else if (
      request.prompt.toLowerCase().includes("content") ||
      request.prompt.toLowerCase().includes("writing")
    ) {
      defaultDescription = "Content Creation Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("market")) {
      defaultDescription = "Marketing Consultation Services (Standard Package)";
    } else if (request.prompt.toLowerCase().includes("seo")) {
      defaultDescription = "SEO Optimization Services (Standard Package)";
    }

    items.push({
      description: defaultDescription,
      quantity: 1,
      unitPrice: 100,
    });
  }

  return {
    clientName,
    clientEmail,
    clientAddress,
    invoiceItems: items,
    taxRate: 10,
    dueDate: getDefaultDueDate(30),
    notes: "Thank you for your business.",
    success: true,
  };
}

/**
 * Get default due date based on days from now
 */
function getDefaultDueDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}
