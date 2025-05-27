"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertCircle,
  Sparkles,
  Loader2,
  Bot,
  User,
  Mic,
  MicOff,
  Calendar,
  Tag,
  DollarSign,
  Clock,
  Percent,
  Database,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import BusinessSetupForm from "./BusinessSetupForm";
import { BusinessDetails } from "@/lib/invoiceGenerator";
import { AIProvider, getCurrentAIProvider, setAIProvider } from "@/lib/ai";
import { InvoiceModel, InvoiceController, InvoicePresenter } from "@/lib/mcp";
import { processWithNLU } from "@/lib/nlu";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";

interface InvoicePromptInputProps {
  onGenerateInvoice?: (
    promptText: string,
    businessDetails?: BusinessDetails,
    aiProvider?: "openai" | "claude" | "gemini",
    clientDetails?: {
      name: string;
      email: string;
      address: string;
    },
  ) => void;
  isProcessing?: boolean;
  savedBusinessDetails?: BusinessDetails;
}

export default function InvoicePromptInput({
  onGenerateInvoice = () => {},
  isProcessing = false,
  savedBusinessDetails,
}: InvoicePromptInputProps) {
  const [promptText, setPromptText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [businessDetails, setBusinessDetails] = useState<
    BusinessDetails | undefined
  >(savedBusinessDetails);
  const [activeTab, setActiveTab] = useState<string>(
    businessDetails ? "create" : "setup",
  );
  const [showBusinessChoice, setShowBusinessChoice] =
    useState<boolean>(!!savedBusinessDetails);
  const [aiProvider, setAiProviderState] = useState<AIProvider>(
    getCurrentAIProvider(),
  );
  const [examples, setExamples] = useState<string[]>([
    "Create an invoice for website development. Include website design for $1500, content creation for $500, and hosting setup for $200. Due in 14 days. Apply 8% tax.",
    "Invoice for monthly consulting services at $2000, with an additional workshop session for $800. Include my business details and set net 30 payment terms.",
    "Bill for logo design ($350), business card design ($150), and social media graphics ($300). Apply 10% tax and make it due by the end of the month.",
    "Create an invoice for Herald Sun newspaper deliveries on Tuesdays ($2.50) and Thursdays ($3) between 01/04/2025 and 30/04/2025. Payment due in 30 days.",
  ]);
  const [selectedExample, setSelectedExample] = useState<string>("");
  const [clientDetails, setClientDetails] = useState({
    name: "John Smith",
    email: "john@example.com",
    address: "123 Main St, New York",
  });
  const [mainTabValue, setMainTabValue] = useState("prompt");
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Smart input state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [lastProcessedText, setLastProcessedText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track which dropdown is currently open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Recent inputs memory
  const [recentInputs, setRecentInputs] = useState<string[]>([]);

  // Suggestion data
  const productSuggestions = [
    { name: "Website Design", price: 1500 },
    { name: "Logo Design", price: 350 },
    { name: "Content Creation", price: 500 },
    { name: "SEO Optimization", price: 800 },
    { name: "Hosting Setup", price: 200 },
    { name: "Consulting Services", price: 2000 },
    { name: "Social Media Graphics", price: 300 },
    { name: "Herald Sun Newspaper Delivery", price: 2.5 },
  ];

  const taxRateSuggestions = ["5%", "8%", "10%", "15%", "20%"];
  const paymentTermSuggestions = [
    "7 days",
    "14 days",
    "30 days",
    "45 days",
    "60 days",
    "net 30",
  ];

  // Date suggestions - next few months
  const dateSuggestions = [
    {
      label: "Today",
      value: formatDate(new Date()),
    },
    {
      label: "End of month",
      value: formatDate(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      ),
    },
    {
      label: "Next month",
      value: formatDate(
        new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0),
      ),
    },
    {
      label: "In 30 days",
      value: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    },
  ];

  function formatDate(date: Date): string {
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
  }

  // Load client details and recent inputs from localStorage on component mount
  useEffect(() => {
    const savedClientDetails = localStorage.getItem("lastClientDetails");
    if (savedClientDetails) {
      try {
        setClientDetails(JSON.parse(savedClientDetails));
      } catch (e) {
        console.error("Error parsing saved client details", e);
      }
    }

    const savedRecentInputs = localStorage.getItem("recentInvoiceInputs");
    if (savedRecentInputs) {
      try {
        setRecentInputs(JSON.parse(savedRecentInputs));
      } catch (e) {
        console.error("Error parsing saved recent inputs", e);
      }
    }
  }, []);

  useEffect(() => {
    // Update the global AI provider when the local state changes
    setAIProvider(aiProvider);
  }, [aiProvider]);

  // Check if browser supports SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
    }
  }, []);

  // Generate preview as user types with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (
        promptText &&
        promptText !== lastProcessedText &&
        promptText.length > 10
      ) {
        generatePreview(promptText);
        setLastProcessedText(promptText);
      }
    }, 1200);

    return () => clearTimeout(debounceTimeout);
  }, [promptText, lastProcessedText]);

  // Function to generate preview data
  const generatePreview = async (text: string) => {
    if (!text || isGeneratingPreview) return;

    try {
      setIsGeneratingPreview(true);

      // Use NLU to process the text and extract structured data
      const nluResult = await processWithNLU(text);

      // Store the full NLU result for consistency with invoice generation
      setPreviewData({
        items: nluResult.items,
        clientInfo: nluResult.clientInfo,
        taxRate: nluResult.taxRate,
        dueDays: nluResult.dueDays,
        dueDate: nluResult.dueDate,
        notes: nluResult.notes,
        confidence: nluResult.confidence,
      });

      // Log the preview data for debugging
      console.log("Live Preview Data:", nluResult);
      console.log(
        "Live Preview Items with descriptions:",
        nluResult.items.map((item) => ({
          description: item.description,
          amount: item.amount,
        })),
      );
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!promptText.trim()) {
      setError("Please enter invoice details before generating.");
      return;
    }

    setError(null);

    // Save to recent inputs if not already there
    if (!recentInputs.includes(promptText)) {
      const updatedInputs = [promptText, ...recentInputs.slice(0, 4)]; // Keep last 5 inputs
      setRecentInputs(updatedInputs);
      localStorage.setItem(
        "recentInvoiceInputs",
        JSON.stringify(updatedInputs),
      );
    }

    // Create MCP components
    const invoiceModel = new InvoiceModel();
    if (businessDetails) {
      invoiceModel.setBusinessDetails(businessDetails);
    }
    invoiceModel.setAIProvider(aiProvider as "openai" | "claude" | "gemini");
    invoiceModel.setClientDetails(clientDetails);

    const invoicePresenter = new InvoicePresenter(
      (data) => {}, // We'll handle this through the callback
      (isProcessing) => {}, // We're managing this state already
      (error) => setError(error),
    );

    const invoiceController = new InvoiceController(
      invoiceModel,
      invoicePresenter,
    );

    // Enhance the prompt with intelligent context
    const enhancedPrompt = invoiceController.enhancePrompt(promptText);
    console.log("Enhanced prompt:", enhancedPrompt);

    // Call the onGenerateInvoice callback with the enhanced prompt
    onGenerateInvoice(
      enhancedPrompt,
      businessDetails,
      aiProvider,
      clientDetails,
    );
  };

  const handleAIProviderChange = (value: string) => {
    setAiProviderState(value as AIProvider);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
    if (error) setError(null);

    // Track cursor position for suggestions
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Show suggestions on specific key combinations
    if (e.key === " " && e.ctrlKey) {
      e.preventDefault();
      setShowSuggestions(true);
    }

    // Close suggestions on escape
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setOpenDropdown(null);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    // Close any open dropdowns
    setShowSuggestions(false);
    setOpenDropdown(null);

    if (textareaRef.current) {
      const currentText = promptText;
      const beforeCursor = currentText.substring(0, cursorPosition);
      const afterCursor = currentText.substring(cursorPosition);

      // Insert the suggestion at cursor position
      const newText = `${beforeCursor}${suggestion}${afterCursor}`;
      setPromptText(newText);

      // Focus back on textarea and set cursor position after the inserted suggestion
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = cursorPosition + suggestion.length;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPosition(newPosition);
        }
      }, 0);
    }
  };

  const insertProduct = (product: { name: string; price: number }) => {
    // Close dropdown after selection
    setShowSuggestions(false);
    setOpenDropdown(null);

    const suggestion = `${product.name} for $${product.price}`;
    insertSuggestion(suggestion);
  };

  const insertDate = (date: { label: string; value: string }) => {
    // Close dropdown after selection
    setShowSuggestions(false);
    setOpenDropdown(null);

    insertSuggestion(date.value);
  };

  const insertTaxRate = (rate: string) => {
    // Close dropdown after selection
    setShowSuggestions(false);
    setOpenDropdown(null);

    insertSuggestion(`Apply ${rate} tax`);
  };

  const insertPaymentTerm = (term: string) => {
    // Close dropdown after selection
    setShowSuggestions(false);
    setOpenDropdown(null);

    insertSuggestion(`Due in ${term}`);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in your browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setPromptText((prev) => {
          // If there's already text, add a space before the new transcript
          const prefix = prev.trim() ? prev.trim() + " " : "";
          return prefix + transcript;
        });
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError(`Voice recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setError("Failed to start voice recognition. Please try again.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSaveBusinessDetails = (details: BusinessDetails) => {
    setBusinessDetails(details);
    setActiveTab("create");
    setShowBusinessChoice(false);
    // Save to localStorage
    localStorage.setItem("businessDetails", JSON.stringify(details));
  };

  const handleUseNewBusinessDetails = () => {
    setActiveTab("setup");
    setShowBusinessChoice(false);
  };

  const handleUseSavedBusinessDetails = () => {
    setActiveTab("create");
    setShowBusinessChoice(false);
  };

  const handleClientDetailsChange = (
    field: "name" | "email" | "address",
    value: string,
  ) => {
    setClientDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Save to localStorage
    localStorage.setItem(
      "lastClientDetails",
      JSON.stringify({
        ...clientDetails,
        [field]: value,
      }),
    );
  };

  // Handle dropdown toggle
  const toggleDropdown = (dropdownName: string) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
      setShowSuggestions(false);
    } else {
      setOpenDropdown(dropdownName);
      setShowSuggestions(true);
    }
  };

  const placeholderText =
    "Enter your invoice details in natural language. For best results, include:\n\n" +
    "1. Services/products with quantities and prices\n" +
    "2. Tax rate\n" +
    "3. Due date or payment terms\n\n" +
    "Example: Website design for $1500, content creation for $500, and hosting setup for $200. " +
    "Apply 8% tax. Due in 14 days.";

  return (
    <Card className="w-full bg-card border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {activeTab === "setup"
            ? "Business Setup"
            : "Generate Invoice from Text"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showBusinessChoice && savedBusinessDetails ? (
          <div className="mb-6 p-4 bg-muted/30 rounded-md">
            <h3 className="text-lg font-medium mb-3">Business Details</h3>
            <div className="mb-4 p-3 bg-muted/50 rounded-md">
              <p className="font-medium">{savedBusinessDetails.businessName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                ABN: {savedBusinessDetails.abn} | {savedBusinessDetails.address}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUseSavedBusinessDetails}
                className="flex-1"
              >
                Use Saved Details
              </Button>
              <Button
                onClick={handleUseNewBusinessDetails}
                variant="outline"
                className="flex-1"
              >
                Enter New Details
              </Button>
            </div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="setup">Business Setup</TabsTrigger>
              <TabsTrigger value="create" disabled={!businessDetails}>
                Create Invoice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="mt-0">
              <BusinessSetupForm
                onSaveDetails={handleSaveBusinessDetails}
                initialDetails={businessDetails}
              />
            </TabsContent>

            <TabsContent value="create" className="mt-0">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {businessDetails && (
                <div className="mb-4 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm font-medium">
                    Using business details for: {businessDetails.businessName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ABN: {businessDetails.abn} | {businessDetails.address}
                  </p>
                  <Button
                    variant="link"
                    className="px-0 py-0 h-auto text-xs"
                    onClick={() => setActiveTab("setup")}
                  >
                    Edit Details
                  </Button>
                </div>
              )}

              <Tabs
                value={mainTabValue}
                onValueChange={setMainTabValue}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="prompt">Invoice Details</TabsTrigger>
                  <TabsTrigger value="client">Bill To</TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        AI-Powered Invoice Generation
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300"
                        >
                          BETA
                        </Badge>
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Describe your invoice in natural language. Our AI will
                        extract all the necessary details.
                      </p>

                      <div className="mb-4">
                        <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                          <Bot className="h-3 w-3" /> Select AI Provider
                        </h5>
                        <RadioGroup
                          value={aiProvider}
                          onValueChange={handleAIProviderChange}
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="openai" id="openai" />
                            <label
                              htmlFor="openai"
                              className="text-xs cursor-pointer"
                            >
                              OpenAI
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="claude" id="claude" />
                            <label
                              htmlFor="claude"
                              className="text-xs cursor-pointer"
                            >
                              Claude
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="claude-opus"
                              id="claude-opus"
                            />
                            <label
                              htmlFor="claude-opus"
                              className="text-xs cursor-pointer font-medium text-purple-600 dark:text-purple-400"
                            >
                              Claude Opus
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gemini" id="gemini" />
                            <label
                              htmlFor="gemini"
                              className="text-xs cursor-pointer"
                            >
                              Gemini
                            </label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        {examples.map((example, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs justify-start h-auto py-1 px-2 text-left whitespace-normal"
                            onClick={() => {
                              setSelectedExample(example);
                              setPromptText(example);
                            }}
                          >
                            {example.length > 60
                              ? example.substring(0, 60) + "..."
                              : example}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Popover
                          open={openDropdown === "products"}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdown("products");
                              setShowSuggestions(true);
                            } else {
                              setOpenDropdown(null);
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${openDropdown === "products" ? "bg-accent text-accent-foreground" : ""}`}
                              onClick={() => toggleDropdown("products")}
                            >
                              <Tag className="h-3 w-3" /> Products
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[200px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput placeholder="Search products..." />
                              <CommandList>
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup heading="Products">
                                  {productSuggestions.map((product) => (
                                    <CommandItem
                                      key={product.name}
                                      value={product.name}
                                      onSelect={() => insertProduct(product)}
                                      className="flex justify-between cursor-pointer hover:bg-accent"
                                    >
                                      <span>{product.name}</span>
                                      <span className="text-muted-foreground">
                                        ${product.price}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Popover
                          open={openDropdown === "dates"}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdown("dates");
                              setShowSuggestions(true);
                            } else {
                              setOpenDropdown(null);
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${openDropdown === "dates" ? "bg-accent text-accent-foreground" : ""}`}
                              onClick={() => toggleDropdown("dates")}
                            >
                              <Calendar className="h-3 w-3" /> Dates
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[200px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup heading="Common Dates">
                                  {dateSuggestions.map((date) => (
                                    <CommandItem
                                      key={date.label}
                                      value={date.label}
                                      onSelect={() => insertDate(date)}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      {date.label} ({date.value})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Popover
                          open={openDropdown === "tax"}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdown("tax");
                              setShowSuggestions(true);
                            } else {
                              setOpenDropdown(null);
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${openDropdown === "tax" ? "bg-accent text-accent-foreground" : ""}`}
                              onClick={() => toggleDropdown("tax")}
                            >
                              <Percent className="h-3 w-3" /> Tax Rates
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[150px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup heading="Tax Rates">
                                  {taxRateSuggestions.map((rate) => (
                                    <CommandItem
                                      key={rate}
                                      value={rate}
                                      onSelect={() => insertTaxRate(rate)}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      {rate}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Popover
                          open={openDropdown === "payment"}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdown("payment");
                              setShowSuggestions(true);
                            } else {
                              setOpenDropdown(null);
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${openDropdown === "payment" ? "bg-accent text-accent-foreground" : ""}`}
                              onClick={() => toggleDropdown("payment")}
                            >
                              <Clock className="h-3 w-3" /> Payment Terms
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[150px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup heading="Payment Terms">
                                  {paymentTermSuggestions.map((term) => (
                                    <CommandItem
                                      key={term}
                                      value={term}
                                      onSelect={() => insertPaymentTerm(term)}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      {term}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Popover
                          open={openDropdown === "examples"}
                          onOpenChange={(open) => {
                            if (open) {
                              setOpenDropdown("examples");
                              setShowSuggestions(true);
                            } else {
                              setOpenDropdown(null);
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${openDropdown === "examples" ? "bg-accent text-accent-foreground" : ""}`}
                              onClick={() => toggleDropdown("examples")}
                            >
                              <Sparkles className="h-3 w-3" /> Examples
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandList>
                                <CommandGroup heading="Recent Inputs">
                                  {recentInputs.length > 0 ? (
                                    recentInputs.map((input, index) => (
                                      <CommandItem
                                        key={`recent-${index}`}
                                        value={`recent-${index}`}
                                        onSelect={() => {
                                          setPromptText(input);
                                          setOpenDropdown(null);
                                          setShowSuggestions(false);
                                        }}
                                        className="cursor-pointer hover:bg-accent"
                                      >
                                        {input.length > 40
                                          ? input.substring(0, 40) + "..."
                                          : input}
                                      </CommandItem>
                                    ))
                                  ) : (
                                    <CommandItem disabled>
                                      No recent inputs
                                    </CommandItem>
                                  )}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup heading="Example Templates">
                                  {examples.map((example, index) => (
                                    <CommandItem
                                      key={`example-${index}`}
                                      value={`example-${index}`}
                                      onSelect={() => {
                                        setPromptText(example);
                                        setOpenDropdown(null);
                                        setShowSuggestions(false);
                                      }}
                                      className="cursor-pointer hover:bg-accent"
                                    >
                                      {example.length > 40
                                        ? example.substring(0, 40) + "..."
                                        : example}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() =>
                            window.open("/admin/fine-tuning", "_blank")
                          }
                        >
                          <Database className="h-3 w-3" /> Fine-Tuning
                        </Button>
                      </div>

                      <div className="relative">
                        <Textarea
                          ref={textareaRef}
                          placeholder={placeholderText}
                          className="min-h-[120px] resize-none text-base p-4 pr-12"
                          value={promptText}
                          onChange={handlePromptChange}
                          onKeyDown={handleKeyDown}
                          disabled={isProcessing}
                          onClick={() => {
                            if (textareaRef.current) {
                              setCursorPosition(
                                textareaRef.current.selectionStart,
                              );
                            }
                          }}
                        />
                        <div className="absolute right-2 bottom-2 flex gap-1">
                          {isGeneratingPreview && (
                            <div className="flex items-center justify-center h-8 w-8">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {voiceSupported && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`${isListening ? "text-red-500" : ""}`}
                              onClick={toggleVoiceRecognition}
                              disabled={isProcessing}
                              title={
                                isListening
                                  ? "Stop voice typing"
                                  : "Start voice typing"
                              }
                            >
                              {isListening ? (
                                <MicOff className="h-5 w-5" />
                              ) : (
                                <Mic className="h-5 w-5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Dynamic Live Preview */}
                      {previewData && (
                        <div className="border rounded-md p-3 bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">
                              Live Preview
                            </h4>
                            <div className="flex items-center gap-2">
                              {/* Completeness indicator */}
                              <div className="flex items-center gap-1">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${previewData.completenessScore >= 80 ? "bg-green-500" : previewData.completenessScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{
                                      width: `${previewData.completenessScore}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(previewData.completenessScore)}%
                                </span>
                              </div>
                              <Badge
                                variant={
                                  previewData.confidence > 0.7
                                    ? "default"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {previewData.confidence > 0.7
                                  ? "High Confidence"
                                  : "Low Confidence"}
                              </Badge>
                            </div>
                          </div>

                          {/* Dynamic field detection indicators */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                              variant={
                                previewData.detectedFields?.hasClientInfo
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {previewData.detectedFields?.hasClientInfo
                                ? "✓"
                                : "✗"}{" "}
                              Client Info
                            </Badge>
                            <Badge
                              variant={
                                previewData.detectedFields?.hasItems
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {previewData.detectedFields?.hasItems ? "✓" : "✗"}{" "}
                              Items
                            </Badge>
                            <Badge
                              variant={
                                previewData.detectedFields?.hasTaxInfo
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {previewData.detectedFields?.hasTaxInfo
                                ? "✓"
                                : "✗"}{" "}
                              Tax
                            </Badge>
                            <Badge
                              variant={
                                previewData.detectedFields?.hasDueDate
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {previewData.detectedFields?.hasDueDate
                                ? "✓"
                                : "✗"}{" "}
                              Due Date
                            </Badge>
                          </div>

                          {previewData.items && previewData.items.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                Items:
                              </div>
                              <div className="grid gap-1">
                                {previewData.items.map(
                                  (item: any, index: number) => (
                                    <div
                                      key={index}
                                      className="text-sm flex justify-between items-center py-1 px-2 hover:bg-muted/50 rounded-sm transition-colors"
                                    >
                                      <span>{item.description}</span>
                                      <span className="font-medium">
                                        ${item.amount.toFixed(2)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>

                              <div className="flex justify-between text-sm pt-1 border-t">
                                <span>Tax ({previewData.taxRate}%):</span>
                                <span>
                                  $
                                  {(
                                    (previewData.items.reduce(
                                      (sum: number, item: any) =>
                                        sum + item.amount,
                                      0,
                                    ) *
                                      previewData.taxRate) /
                                    100
                                  ).toFixed(2)}
                                </span>
                              </div>

                              <div className="flex justify-between text-sm font-medium">
                                <span>Total:</span>
                                <span>
                                  $
                                  {(
                                    previewData.items.reduce(
                                      (sum: number, item: any) =>
                                        sum + item.amount,
                                      0,
                                    ) *
                                    (1 + previewData.taxRate / 100)
                                  ).toFixed(2)}
                                </span>
                              </div>

                              {previewData.dueDays && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  Payment due in {previewData.dueDays} days
                                </div>
                              )}

                              {previewData.detectedFields?.hasClientInfo && (
                                <div className="text-xs text-muted-foreground mt-2 pt-1 border-t">
                                  <span className="font-medium">Client:</span>{" "}
                                  {previewData.clientInfo?.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-3 text-center text-muted-foreground">
                              <p>No items detected yet.</p>
                              <p className="text-xs mt-1">
                                Try adding product or service details with
                                prices.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Card className="bg-muted/40">
                    <CardContent className="pt-4 pb-2">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-sm">Bill To:</h3>
                          <p className="text-sm">{clientDetails.name}</p>
                          <p className="text-sm">{clientDetails.email}</p>
                          <p className="text-sm">{clientDetails.address}</p>
                          <Button
                            variant="link"
                            className="px-0 py-0 h-auto text-xs"
                            onClick={() => setMainTabValue("client")}
                          >
                            Edit Client Details
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">From:</h3>
                          <p className="text-sm">
                            {businessDetails?.businessName}
                          </p>
                          <p className="text-sm">{businessDetails?.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="client" className="mt-0 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <h3 className="text-base font-medium">Client Details</h3>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          value={clientDetails.name}
                          onChange={(e) =>
                            handleClientDetailsChange("name", e.target.value)
                          }
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="clientEmail">Client Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={clientDetails.email}
                          onChange={(e) =>
                            handleClientDetailsChange("email", e.target.value)
                          }
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="clientAddress">Client Address</Label>
                        <Textarea
                          id="clientAddress"
                          value={clientDetails.address}
                          onChange={(e) =>
                            handleClientDetailsChange("address", e.target.value)
                          }
                          disabled={isProcessing}
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setMainTabValue("prompt")}
                      className="w-full"
                      disabled={isProcessing}
                    >
                      Save Client Details
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleGenerateInvoice}
                  disabled={isProcessing || !promptText.trim()}
                  className="px-6 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Invoice with AI</span>
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
