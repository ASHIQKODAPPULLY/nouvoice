"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicePromptInput from "@/components/InvoicePromptInput";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceExportOptions from "@/components/InvoiceExportOptions";
import InvoiceTracker from "@/components/InvoiceTracker";

import { UserIcon, Sparkles, ArrowRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MobileAppBanner from "@/components/MobileAppBanner";
import {
  generateInvoiceFromPrompt,
  GeneratedInvoice,
  BusinessDetails,
} from "@/lib/invoiceGenerator";
import { InvoiceModel, InvoiceController, InvoicePresenter } from "@/lib/mcp";

// Dynamic text options for hero section
const heroTexts = [
  "Transform your invoicing process with AI",
  "Create professional invoices in seconds",
  "Streamline your billing workflow effortlessly",
  "Generate perfect invoices from simple text",
];

// Catchphrases for the platform
const catchphrases = [
  "Your words, our invoices, zero hassle.",
  "Billing made brilliant, business made simple.",
  "From text to invoice, in a heartbeat.",
  "Smart invoicing for the modern business.",
];

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoiceData, setInvoiceData] = useState<GeneratedInvoice | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);
  const [businessDetails, setBusinessDetails] = useState<
    BusinessDetails | undefined
  >();
  const [generatedInvoices, setGeneratedInvoices] = useState<
    GeneratedInvoice[]
  >([]);
  const [activeMainTab, setActiveMainTab] = useState("create");
  const [heroTextIndex, setHeroTextIndex] = useState(0);
  const [catchphraseIndex, setCatchphraseIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Rotate hero text and catchphrase every 5 seconds
  useEffect(() => {
    // Only run on client side after hydration
    const timeoutId = setTimeout(() => {
      const interval = setInterval(() => {
        setHeroTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
        setCatchphraseIndex(
          (prevIndex) => (prevIndex + 1) % catchphrases.length,
        );
      }, 5000);
      return () => clearInterval(interval);
    }, 3000); // Longer delay to ensure hydration is complete

    return () => clearTimeout(timeoutId);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setIsAuthenticated(!!session);
        setIsClient(true);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsClient(true);
      }
    };

    checkAuth();
  }, []);

  // Load business details from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedDetails = localStorage.getItem("businessDetails");
        if (savedDetails) {
          const parsedDetails = JSON.parse(savedDetails);
          setBusinessDetails(parsedDetails);
          console.log(
            "✅ Loaded saved business details:",
            parsedDetails.businessName,
          );
        }

        // Load saved invoices
        const savedInvoices = localStorage.getItem("generatedInvoices");
        if (savedInvoices) {
          setGeneratedInvoices(JSON.parse(savedInvoices));
        }

        // Load usage count
        const savedUsageCount = localStorage.getItem("usageCount");
        if (savedUsageCount) {
          setUsageCount(parseInt(savedUsageCount, 10) || 0);
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    };

    // Load data after hydration
    loadData();
  }, []);

  const handleGenerateInvoice = async (
    promptText: string,
    details?: BusinessDetails,
    aiProvider?: "openai" | "claude" | "gemini",
    clientDetails?: {
      name: string;
      email: string;
      address: string;
    },
  ) => {
    // If business details are provided, save them to localStorage
    if (details) {
      setBusinessDetails(details);
      localStorage.setItem("businessDetails", JSON.stringify(details));
      console.log("✅ Business details saved to localStorage");
    }
    try {
      setIsProcessing(true);
      // Clear any previous invoice data
      setInvoiceData(null);

      // Check if user has reached free usage limit
      if (usageCount >= 10 && !isPremium) {
        alert(
          "You've reached your free usage limit. Please upgrade to premium to continue using all features.",
        );
        setIsProcessing(false);
        return;
      }

      // Create MCP components for more intelligent invoice generation
      const invoiceModel = new InvoiceModel();
      if (details || businessDetails) {
        invoiceModel.setBusinessDetails(details || businessDetails);
      }
      if (aiProvider) {
        invoiceModel.setAIProvider(aiProvider);
      }
      if (clientDetails) {
        invoiceModel.setClientDetails(clientDetails);
      }

      const invoicePresenter = new InvoicePresenter(
        (data) => setInvoiceData(data),
        (isProcessing) => setIsProcessing(isProcessing),
        (error) => console.error(error),
      );

      const invoiceController = new InvoiceController(
        invoiceModel,
        invoicePresenter,
      );

      // Generate invoice from prompt using AI through the controller
      const generatedInvoice = await generateInvoiceFromPrompt(
        promptText,
        details || businessDetails,
        aiProvider,
        clientDetails,
      );
      setInvoiceData(generatedInvoice);

      // Add to generated invoices list
      const newInvoices = [...generatedInvoices, generatedInvoice];
      setGeneratedInvoices(newInvoices);

      // Increment usage count if not premium
      if (!isPremium) {
        const newUsageCount = usageCount + 1;
        setUsageCount(newUsageCount);
        localStorage.setItem("usageCount", newUsageCount.toString());
      }

      // Save to localStorage
      localStorage.setItem("generatedInvoices", JSON.stringify(newInvoices));

      // Success notification
      alert("Invoice Generated: Your invoice has been successfully created.");
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Error: Failed to generate invoice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const updatedInvoices = generatedInvoices.map((invoice) => {
      if (invoice.invoiceNumber === invoiceId) {
        return { ...invoice, status: "paid" as const };
      }
      return invoice;
    });

    setGeneratedInvoices(updatedInvoices);
    localStorage.setItem("generatedInvoices", JSON.stringify(updatedInvoices));
    alert(`Invoice ${invoiceId} has been marked as paid.`);
  };

  const handleSendReminder = (invoiceId: string) => {
    const updatedInvoices = generatedInvoices.map((invoice) => {
      if (invoice.invoiceNumber === invoiceId) {
        return { ...invoice, reminderSent: true };
      }
      return invoice;
    });

    setGeneratedInvoices(updatedInvoices);
    localStorage.setItem("generatedInvoices", JSON.stringify(updatedInvoices));
    alert(`Payment reminder sent for invoice ${invoiceId}.`);
  };

  const handleExport = (format: "pdf" | "csv" | "image") => {
    // Check if user has reached free usage limit
    if (usageCount >= 10 && !isPremium) {
      alert(
        "You've reached your free usage limit. Please upgrade to premium to continue using all features.",
      );
      return;
    }

    // If not premium, increment usage count
    if (!isPremium) {
      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      localStorage.setItem("usageCount", newUsageCount.toString());
    }

    alert(
      `Exporting as ${format.toUpperCase()}: Your invoice is being prepared for download.`,
    );
  };

  const handleShare = () => {
    alert("Share Invoice: Sharing functionality will be available soon.");
  };

  const handleUpgrade = async () => {
    try {
      // Check if user is authenticated first
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to sign in if not authenticated with return URL to pricing
        window.location.href = `/auth/signin?redirect=${encodeURIComponent("/pricing")}`;
        return;
      }

      // If authenticated, redirect to pricing page
      window.location.href = "/pricing";
    } catch (error) {
      console.error("Error checking authentication:", error);
      // Still redirect to pricing page, authentication will be checked there again
      window.location.href = "/pricing";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileAppBanner />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm">
              AI-Powered Invoice Generator
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              {heroTexts[heroTextIndex]}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {catchphrases[catchphraseIndex]}
            </p>
            {isClient && !isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 relative overflow-hidden group"
                  onClick={() => {
                    window.location.href = "/auth/signup";
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2">
                    Get Started{" "}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-6 md:py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Tabs */}
          <Tabs
            value={activeMainTab}
            onValueChange={setActiveMainTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-4 md:mb-8 overflow-x-auto">
              <TabsTrigger value="create">Create Invoice</TabsTrigger>
              <TabsTrigger value="tracker">Invoice Tracker</TabsTrigger>
              <TabsTrigger value="history">Invoice History</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Dashboard Overview</h3>
                <p className="text-muted-foreground mb-6">
                  Get detailed insights about your invoices and business
                  performance
                </p>
                <Button
                  size="lg"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                >
                  Go to Dashboard
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-8">
              {/* Prompt Input */}
              <Card>
                <CardContent className="pt-6">
                  <InvoicePromptInput
                    onGenerateInvoice={handleGenerateInvoice}
                    isProcessing={isProcessing}
                    savedBusinessDetails={businessDetails}
                  />
                </CardContent>
              </Card>

              {/* Invoice Preview */}
              <InvoicePreview
                invoiceData={invoiceData || undefined}
                isPremium={isPremium || usageCount < 10}
              />

              {/* Export Options */}
              <Card>
                <CardContent className="pt-6">
                  <InvoiceExportOptions
                    isPremiumUser={isPremium}
                    onExport={handleExport}
                    onShare={handleShare}
                    invoiceData={invoiceData || undefined}
                  />
                  {!isPremium && usageCount > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-800">
                        {usageCount >= 10
                          ? "You've reached your free usage limit. Please upgrade to premium to continue using all features."
                          : `You have used ${usageCount} of 10 free generations. Upgrade to premium for unlimited usage.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracker" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <InvoiceTracker
                    invoices={generatedInvoices.map((invoice) => ({
                      id: invoice.invoiceNumber,
                      invoiceNumber: invoice.invoiceNumber,
                      clientName: invoice.clientName,
                      amount: invoice.total,
                      date: invoice.date,
                      dueDate: invoice.dueDate,
                      status: invoice.status || "unpaid",
                      reminderSent: invoice.reminderSent || false,
                    }))}
                    onMarkAsPaid={handleMarkAsPaid}
                    onSendReminder={handleSendReminder}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              {generatedInvoices.length > 0 ? (
                <div className="space-y-6">
                  {generatedInvoices.map((invoice, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="p-4 border-b flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">
                              {invoice.invoiceNumber}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {invoice.clientName} -{" "}
                              {new Date(invoice.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInvoiceData(invoice);
                                setActiveMainTab("create");
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 min-h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p className="mb-2">No invoice history yet</p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveMainTab("create")}
                      >
                        Create your first invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Features Section */}
          <div className="py-8 md:py-12">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                Why Choose Nouvoice?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform transforms how you create and manage
                invoices
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    AI-Powered Generation
                  </h3>
                  <p className="text-muted-foreground">
                    Simply describe your invoice in plain text and our AI will
                    extract all the necessary details.
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-white"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <line x1="3" x2="21" y1="9" y2="9" />
                      <path d="m9 16 2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Beautiful Templates
                  </h3>
                  <p className="text-muted-foreground">
                    Choose from a variety of professionally designed templates
                    to match your brand identity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-white"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Your data is encrypted and securely stored. Access your
                    invoices anytime, anywhere.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Ready to transform your invoicing process?
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                Join thousands of businesses that use Nouvoice to streamline
                their billing workflow.
              </p>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-500 hover:bg-white/90"
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
