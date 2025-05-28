"use client";

import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader />

      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-gradient-blue/10 to-gradient-purple/10 py-8 px-4">
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-to-r from-gradient-blue to-gradient-purple text-white px-3 py-1 rounded-full">
            Mobile App
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Create professional invoices on the go
          </p>
          <Button
            size="sm"
            className="bg-gradient-to-r from-gradient-blue to-gradient-purple hover:opacity-90"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <main className="flex-1 container mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap w-full mb-6 gap-1">
            <TabsTrigger
              value="create"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-1"
            >
              <FileText className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Create</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-1"
            >
              <Clock className="h-4 w-4" />
              <span className="text-xs sm:text-sm">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 min-w-[100px] flex items-center justify-center gap-1"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <InvoicePromptInput
                  onGenerateInvoice={() => {}}
                  isProcessing={false}
                />
              </CardContent>
            </Card>

            {/* Mobile-optimized preview placeholder */}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Invoice Preview</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate an invoice to see the preview here
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Sample
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first invoice to see it here
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
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
                    <Button size="sm" variant="outline">
                      Upgrade
                    </Button>
                  </Link>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
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

            <div className="mt-4 grid gap-4">
              <Button variant="outline" className="justify-start">
                Account Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Business Details
              </Button>
              <Button variant="outline" className="justify-start">
                Invoice Templates
              </Button>
              <Button variant="outline" className="justify-start">
                Help & Support
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile App Footer */}
      <footer className="border-t py-4 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © 2023 Nouvoice. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
