"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { InvoiceData } from "./InvoicePreview";

interface EditInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: "company" | "client" | "invoice" | "notes" | "tax" | null;
  invoiceData: InvoiceData;
  onSave: (updatedData: Partial<InvoiceData>) => void;
}

export default function EditInvoiceDialog({
  open,
  onOpenChange,
  section,
  invoiceData,
  onSave,
}: EditInvoiceDialogProps) {
  const [formData, setFormData] = useState<Partial<InvoiceData>>({});

  // Initialize form data when dialog opens
  useEffect(() => {
    if (section === "company") {
      setFormData({
        companyName: invoiceData.companyName,
        companyAddress: invoiceData.companyAddress,
        companyEmail: invoiceData.companyEmail,
        companyABN: invoiceData.companyABN,
      });
    } else if (section === "client") {
      setFormData({
        clientName: invoiceData.clientName,
        clientAddress: invoiceData.clientAddress,
        clientEmail: invoiceData.clientEmail,
      });
    } else if (section === "invoice") {
      setFormData({
        invoiceNumber: invoiceData.invoiceNumber,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate,
      });
    } else if (section === "notes") {
      setFormData({
        notes: invoiceData.notes,
      });
    } else if (section === "tax") {
      setFormData({
        taxRate: invoiceData.taxRate,
      });
    }
  }, [section, invoiceData]);

  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Validate form data
    if (section === "invoice" && !formData.invoiceNumber?.trim()) {
      alert("Invoice number cannot be empty");
      return;
    }
    // Check for duplicate invoice numbers if we're editing the invoice section
    if (section === "invoice" && formData.invoiceNumber) {
      // Check localStorage for previously used invoice numbers
      const usedInvoiceNumbers = JSON.parse(
        localStorage.getItem("usedInvoiceNumbers") || "[]",
      );

      if (
        usedInvoiceNumbers.includes(formData.invoiceNumber) &&
        formData.invoiceNumber !== invoiceData.invoiceNumber
      ) {
        if (
          !confirm(
            `Warning: Invoice number "${formData.invoiceNumber}" has been used before. Using duplicate invoice numbers may cause confusion. Continue anyway?`,
          )
        ) {
          return;
        }
      }

      // Add current invoice number to used numbers if it's new
      if (!usedInvoiceNumbers.includes(formData.invoiceNumber)) {
        usedInvoiceNumbers.push(formData.invoiceNumber);
        localStorage.setItem(
          "usedInvoiceNumbers",
          JSON.stringify(usedInvoiceNumbers),
        );
      }
    }

    onSave(formData);
    onOpenChange(false);
  };

  const renderFields = () => {
    if (section === "company") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName || ""}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Textarea
              id="companyAddress"
              value={formData.companyAddress || ""}
              onChange={(e) =>
                handleInputChange("companyAddress", e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={formData.companyEmail || ""}
              onChange={(e) =>
                handleInputChange("companyEmail", e.target.value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyABN">ABN/Tax ID</Label>
            <Input
              id="companyABN"
              value={formData.companyABN || ""}
              onChange={(e) => handleInputChange("companyABN", e.target.value)}
            />
          </div>
        </div>
      );
    } else if (section === "client") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName || ""}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clientAddress">Address</Label>
            <Textarea
              id="clientAddress"
              value={formData.clientAddress || ""}
              onChange={(e) =>
                handleInputChange("clientAddress", e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail || ""}
              onChange={(e) => handleInputChange("clientEmail", e.target.value)}
            />
          </div>
        </div>
      );
    } else if (section === "invoice") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber || ""}
              onChange={(e) =>
                handleInputChange("invoiceNumber", e.target.value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Invoice Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date ? formData.date.split("T")[0] : ""}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate ? formData.dueDate.split("T")[0] : ""}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />
          </div>
        </div>
      );
    } else if (section === "notes") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={5}
            />
          </div>
        </div>
      );
    } else if (section === "tax") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              step="0.1"
              value={formData.taxRate || 0}
              onChange={(e) =>
                handleInputChange("taxRate", parseFloat(e.target.value))
              }
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const getDialogTitle = () => {
    switch (section) {
      case "company":
        return "Edit Company Details";
      case "client":
        return "Edit Client Details";
      case "invoice":
        return "Edit Invoice Details";
      case "notes":
        return "Edit Notes";
      case "tax":
        return "Edit Tax Rate";
      default:
        return "Edit";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {renderFields()}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
