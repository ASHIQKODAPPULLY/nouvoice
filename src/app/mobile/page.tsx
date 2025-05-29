"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowRight, FileText, Clock, Settings } from "lucide-react";
import MobileHeader from "@/components/MobileHeader";
import InvoicePromptInput from "@/components/InvoicePromptInput";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("create");
  const [invoiceData, setInvoiceData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set active tab based on URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["create", "history", "settings"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleGenerateInvoice = async (promptText) => {
    setIsProcessing(true);
    // Clear any previous invoice data
    setInvoiceData(null);

    // Simulate invoice generation
    setTimeout(() => {
      setInvoiceData({
        /* mock data would go here */
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />

      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-gradient-blue/10 to-gradient-purple/10 py-6 px-4">
        <div className="text-center space-y-3">
          <Badge className="bg-gradient-to-r from-gradient-blue to-gradient-purple text-white px-3 py-1 rounded-full">
            Mobile App
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Create professional invoices on the go
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-gradient-blue to-gradient-purple hover:opacity-90 h-12 touch-manipulation"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <main className="flex-1 container mx-auto py-4 px-2 overflow-hidden max-w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full mb-4 gap-1 p-1 h-14">
            <TabsTrigger
              value="create"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 h-12 touch-manipulation"
              onClick={() => (window.location.hash = "create")}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Create</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 h-12 touch-manipulation"
              onClick={() => (window.location.hash = "history")}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-2 h-12 touch-manipulation"
              onClick={() => (window.location.hash = "settings")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardContent className="pt-4 px-2 sm:px-4">
                <InvoicePromptInput
                  onGenerateInvoice={handleGenerateInvoice}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Mobile-optimized preview placeholder */}
            <Card>
              <CardContent className="p-4 text-center">
                {invoiceData ? (
                  <div>Invoice Preview Content</div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Invoice Preview
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate an invoice to see the preview here
                    </p>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex items-center gap-2 h-12 touch-manipulation"
                    >
                      <Sparkles className="h-5 w-5" />
                      Generate Sample
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center py-8">
                  <Clock className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first invoice to see it here
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      setActiveTab("create");
                      window.location.hash = "create";
                    }}
                    className="flex items-center gap-2 h-12 touch-manipulation"
                  >
                    <FileText className="h-5 w-5" />
                    Create Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      50 invoices per month
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 touch-manipulation"
                    >
                      Upgrade
                    </Button>
                  </Link>
                </div>

                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gradient-blue to-gradient-purple"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  15 of 50 invoices used this month
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 grid gap-3">
              <Button
                variant="outline"
                className="justify-start h-14 text-base touch-manipulation"
              >
                Account Settings
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 text-base touch-manipulation"
              >
                Business Details
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 text-base touch-manipulation"
              >
                Invoice Templates
              </Button>
              <Button
                variant="outline"
                className="justify-start h-14 text-base touch-manipulation"
              >
                Help & Support
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile App Footer */}
      <footer className="border-t py-4 px-4 text-center mt-4">
        <p className="text-xs text-muted-foreground">
          © 2023 Nouvoice. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
