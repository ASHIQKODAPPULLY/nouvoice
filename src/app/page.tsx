"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicePromptInput from "@/components/InvoicePromptInput";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceExportOptions from "@/components/InvoiceExportOptions";
import InvoiceTracker from "@/components/InvoiceTracker";
import DashboardSummary from "@/components/DashboardSummary";
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
  const [activeMainTab, setActiveMainTab] = useState("dashboard");
  const [heroTextIndex, setHeroTextIndex] = useState(0);
  const [catchphraseIndex, setCatchphraseIndex] = useState(0);

  // Rotate hero text and catchphrase every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroTextIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
      setCatchphraseIndex((prevIndex) => (prevIndex + 1) % catchphrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load business details from localStorage on component mount
  useEffect(() => {
    const savedDetails = localStorage.getItem("businessDetails");
    if (savedDetails) {
      try {
        const parsedDetails = JSON.parse(savedDetails);
        setBusinessDetails(parsedDetails);
        console.log(
          "✅ Loaded saved business details:",
          parsedDetails.businessName,
        );
      } catch (e) {
        console.error("Error parsing saved business details", e);
      }
    } else {
      console.log("ℹ️ No saved business details found");
    }

    // Load saved invoices
    const savedInvoices = localStorage.getItem("generatedInvoices");
    if (savedInvoices) {
      try {
        setGeneratedInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        console.error("Error parsing saved invoices", e);
      }
    }

    // Load usage count
    const savedUsageCount = localStorage.getItem("usageCount");
    if (savedUsageCount) {
      try {
        setUsageCount(parseInt(savedUsageCount, 10));
      } catch (e) {
        console.error("Error parsing usage count", e);
      }
    }
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
      if (usageCount >= 50 && !isPremium) {
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
    if (usageCount >= 50 && !isPremium) {
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

  const handleUpgrade = () => {
    setIsPremium(true);
    alert(
      "Welcome to Premium! You now have access to unlimited usage and all premium features.",
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileAppBanner />
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold">I</span>
            </div>
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/pricing" passHref>
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/team" passHref>
              <Button variant="ghost">Teams</Button>
            </Link>
            <ThemeSwitcher />

            <Button variant="outline" className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Account</span>
            </Button>

            <Button
              onClick={handleUpgrade}
              className={
                isPremium
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                  : ""
              }
            >
              {isPremium
                ? "Premium Active"
                : `Upgrade to Pro ${!isPremium && usageCount >= 50 ? "(Required)" : ""}`}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full">
              AI-Powered Invoice Generator
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {heroTexts[heroTextIndex]}
            </h1>
            <p className="text-xl text-muted-foreground">
              {catchphrases[catchphraseIndex]}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/signup" passHref>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center transition-transform duration-300 group-hover:translate-x-2">
                    Get Started{" "}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Tabs */}
          <Tabs
            value={activeMainTab}
            onValueChange={setActiveMainTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="create">Create Invoice</TabsTrigger>
              <TabsTrigger value="tracker">Invoice Tracker</TabsTrigger>
              <TabsTrigger value="history">Invoice History</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <DashboardSummary
                invoices={generatedInvoices.map((invoice) => ({
                  id: invoice.invoiceNumber || "",
                  invoiceNumber: invoice.invoiceNumber || "",
                  clientName: invoice.clientName || "",
                  amount: invoice.total || 0,
                  date: invoice.date || "",
                  dueDate: invoice.dueDate || "",
                  status: invoice.status || "unpaid",
                  reminderSent: invoice.reminderSent || false,
                }))}
                isPremium={isPremium}
              />
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
                isPremium={isPremium || usageCount < 50}
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
                        {usageCount >= 50
                          ? "You've reached your free usage limit. Please upgrade to premium to continue using all features."
                          : `You have used ${usageCount} of 50 free generations. Upgrade to premium for unlimited usage.`}
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

          {/* About Section */}
          <div className="py-12 bg-muted/30 rounded-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">About Nouvoice</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Melbourne-Brewed Innovation for Smarter Business
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4 px-4">
              <p>
                Nouvoice was born out of a simple but frustrating reality: small
                business owners and freelancers were wasting countless hours
                manually creating invoices, cross-checking numbers, and managing
                outdated templates.
              </p>
              <p>
                Built in Melbourne, Nouvoice is the solution to this common pain
                point. We provide an AI-powered platform that lets you generate
                professional, compliant invoices in seconds—saving you time,
                improving accuracy, and letting you focus on what truly matters:
                your business.
              </p>
              <div className="mt-6 text-center">
                <Link href="/about" passHref>
                  <Button variant="outline">Learn More About Us</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Nouvoice?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform transforms how you create and manage
                invoices
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">
                Ready to transform your invoicing process?
              </h2>
              <p className="text-xl opacity-90">
                Join thousands of businesses that use Nouvoice to streamline
                their billing workflow.
              </p>
              <div className="pt-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-500 hover:bg-white/90"
                  onClick={handleUpgrade}
                >
                  Upgrade to Pro <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold">I</span>
                </div>
                <h1 className="text-xl font-bold">Nouvoice</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered invoice generation platform that simplifies your
                billing process.
              </p>
              <p className="text-sm text-muted-foreground">
                © 2023 Nouvoice. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cookies
              </a>
            </div>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
