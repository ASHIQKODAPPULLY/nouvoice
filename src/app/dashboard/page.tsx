"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSummary from "@/components/DashboardSummary";
import InvoiceTracker from "@/components/InvoiceTracker";
import { GeneratedInvoice } from "@/lib/invoiceGenerator";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [generatedInvoices, setGeneratedInvoices] = useState<
    GeneratedInvoice[]
  >([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
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

  // Load saved invoices from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedInvoices = localStorage.getItem("generatedInvoices");
        if (savedInvoices) {
          setGeneratedInvoices(JSON.parse(savedInvoices));
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    };

    loadData();
  }, []);

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

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Invoice Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor your invoices, track payments, and manage your business
              finances
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="summary">Dashboard Summary</TabsTrigger>
              <TabsTrigger value="tracker">Invoice Tracker</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-8">
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
                isPremium={true}
              />
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
