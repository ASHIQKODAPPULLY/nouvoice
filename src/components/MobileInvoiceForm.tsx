"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function MobileInvoiceForm() {
  const [promptText, setPromptText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt");
  const [clientDetails, setClientDetails] = useState({
    name: "",
    email: "",
    address: "",
  });

  const handleGenerateInvoice = () => {
    if (!promptText.trim()) return;

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      // Handle success
    }, 2000);
  };

  const handleClientDetailsChange = (
    field: "name" | "email" | "address",
    value: string,
  ) => {
    setClientDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="prompt">Invoice Details</TabsTrigger>
          <TabsTrigger value="client">Client Info</TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="space-y-4">
          <div className="bg-muted/30 p-3 rounded-md">
            <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI-Powered Invoice
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Describe your invoice in natural language
            </p>
          </div>

          <Textarea
            placeholder="E.g., Website design for $1500, content creation for $500, and hosting setup for $200. Due in 14 days."
            className="min-h-[120px] resize-none"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={isProcessing}
          />
        </TabsContent>

        <TabsContent value="client" className="space-y-4">
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
                placeholder="John Smith"
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
                placeholder="john@example.com"
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
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleGenerateInvoice}
        disabled={isProcessing || !promptText.trim()}
        className="w-full flex items-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate Invoice</span>
          </>
        )}
      </Button>
    </div>
  );
}
