"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import {
  Edit2,
  Trash2,
  Upload,
  Plus,
  Save,
  FileEdit,
  User,
  FileText,
  Calculator,
} from "lucide-react";
import InvoiceExportOptions from "./InvoiceExportOptions";
import EditInvoiceDialog from "./EditInvoiceDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isEditing?: boolean;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyLogo?: string;
  companyABN?: string;
  companyBankDetails?: {
    bankName: string;
    bsb: string;
    accountNumber: string;
  };
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
}

interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  abn?: string;
  bankDetails?: {
    bankName: string;
    bsb: string;
    accountNumber: string;
  };
}

interface InvoicePreviewProps {
  invoiceData?: InvoiceData;
  isPremium?: boolean;
  onInvoiceUpdate?: (updatedInvoice: InvoiceData) => void;
}

const defaultInvoiceData: InvoiceData = {
  invoiceNumber: "INV-20230515-001",
  date: "2023-05-15",
  dueDate: "2023-06-15",
  clientName: "Acme Corporation",
  clientEmail: "billing@acmecorp.com",
  clientAddress: "123 Business Ave, Suite 100, San Francisco, CA 94107",
  companyName: "Your Company Name",
  companyAddress: "456 Commerce St, New York, NY 10001",
  companyEmail: "invoices@yourcompany.com",
  lineItems: [
    {
      id: "1",
      description: "Web Design Services",
      quantity: 1,
      unitPrice: 1200,
      amount: 1200,
    },
    {
      id: "2",
      description: "Hosting (Annual)",
      quantity: 1,
      unitPrice: 300,
      amount: 300,
    },
    {
      id: "3",
      description: "Content Creation",
      quantity: 5,
      unitPrice: 100,
      amount: 500,
    },
  ],
  subtotal: 2000,
  taxRate: 10,
  taxAmount: 200,
  total: 2200,
  notes:
    "Payment due within 30 days. Please include invoice number with payment.",
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoiceData = defaultInvoiceData,
  isPremium = false,
  onInvoiceUpdate = () => {},
}) => {
  // Use client-side only rendering for components that cause hydration errors
  const [isClient, setIsClient] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>("standard");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [editableInvoice, setEditableInvoice] = useState<InvoiceData>({
    ...invoiceData,
  });
  // Initialize animation state variables
  const [animateChanges, setAnimateChanges] = useState(false);
  const [lastUpdatedField, setLastUpdatedField] = useState<string | null>(null);

  // Dialog states
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isCompanyDetailsDialogOpen, setIsCompanyDetailsDialogOpen] =
    useState(false);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null,
  );
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoSize, setLogoSize] = useState<number>(100); // Default size 100%

  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<
    "company" | "client" | "invoice" | "notes" | "tax" | null
  >(null);

  // Function to open edit dialog for different sections
  const openEditDialog = (
    section: "company" | "client" | "invoice" | "notes" | "tax",
  ) => {
    setEditSection(section);
    setEditDialogOpen(true);
  };

  // Handle invoice updates from edit dialog
  const handleInvoiceUpdate = (updatedData: Partial<InvoiceData>) => {
    const updated = { ...editableInvoice, ...updatedData };
    setEditableInvoice(updated);

    // Trigger animation for updated fields
    if (
      updatedData.clientName ||
      updatedData.clientAddress ||
      updatedData.clientEmail
    ) {
      setLastUpdatedField("clientInfo");
      setAnimateChanges(true);
      setTimeout(() => setAnimateChanges(false), 1500);
    }

    if (onInvoiceUpdate) onInvoiceUpdate(updated);
  };

  // Initialize client-side state and load logo from localStorage
  useEffect(() => {
    setIsClient(true);

    // Load saved logo from localStorage if available
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("invoiceLogoImage");
      if (savedLogo) {
        setLogoImage(savedLogo);
        // Also update the invoice data with the logo for PDF export
        setEditableInvoice((prev) => ({
          ...prev,
          companyLogo: savedLogo,
        }));
      }

      // Load saved logo size from localStorage if available
      const savedLogoSize = localStorage.getItem("invoiceLogoSize");
      if (savedLogoSize) {
        setLogoSize(parseInt(savedLogoSize, 10) || 100);
      }

      // Load saved company details if available
      const savedCompanyDetails = localStorage.getItem("invoiceCompanyDetails");
      if (savedCompanyDetails) {
        try {
          const parsedDetails = JSON.parse(savedCompanyDetails);
          setCompanyDetails(parsedDetails);

          // Update invoice with saved company details
          setEditableInvoice((prev) => ({
            ...prev,
            companyName: parsedDetails.name || prev.companyName,
            companyAddress: parsedDetails.address || prev.companyAddress,
            companyEmail: parsedDetails.email || prev.companyEmail,
            companyABN: parsedDetails.abn || prev.companyABN,
            companyBankDetails:
              parsedDetails.bankDetails || prev.companyBankDetails,
          }));
        } catch (e) {
          console.error("Failed to parse saved company details:", e);
        }
      }
    }
  }, []);

  // Update editableInvoice when invoiceData changes
  useEffect(() => {
    setEditableInvoice({ ...invoiceData });
  }, [invoiceData]);

  // Mock function for drag and drop functionality
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setIsDragging(true);
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  // Line item editing functions
  const handleEditLineItem = (id: string) => {
    const item = editableInvoice.lineItems.find((item) => item.id === id);
    if (item) {
      setEditingItem({ ...item });
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteLineItem = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLineItem = () => {
    if (!itemToDelete) return;

    const updatedItems = editableInvoice.lineItems.filter(
      (item) => item.id !== itemToDelete,
    );

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * editableInvoice.taxRate) / 100;
    const total = subtotal + taxAmount;

    const updatedInvoice = {
      ...editableInvoice,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total,
    };

    setEditableInvoice(updatedInvoice);
    if (onInvoiceUpdate) onInvoiceUpdate(updatedInvoice);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleSaveLineItem = () => {
    if (!editingItem) return;

    let updatedItems = [...editableInvoice.lineItems];

    // Check if this is an existing item or a new one
    const existingItemIndex = updatedItems.findIndex(
      (item) => item.id === editingItem.id,
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems[existingItemIndex] = editingItem;
    } else {
      // Add new item
      updatedItems.push(editingItem);
    }

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * editableInvoice.taxRate) / 100;
    const total = subtotal + taxAmount;

    const updatedInvoice = {
      ...editableInvoice,
      lineItems: updatedItems,
      subtotal,
      taxAmount,
      total,
    };

    setEditableInvoice(updatedInvoice);
    if (onInvoiceUpdate) onInvoiceUpdate(updatedInvoice);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const updateEditingItemField = (
    field: keyof LineItem,
    value: string | number,
  ) => {
    if (!editingItem) return;

    let updatedItem: LineItem;

    if (field === "quantity" || field === "unitPrice") {
      const numValue = parseFloat(value as string) || 0;

      if (field === "quantity") {
        const amount = numValue * editingItem.unitPrice;
        updatedItem = { ...editingItem, quantity: numValue, amount };
      } else {
        // unitPrice
        const amount = editingItem.quantity * numValue;
        updatedItem = { ...editingItem, unitPrice: numValue, amount };
      }
    } else {
      updatedItem = { ...editingItem, [field]: value };
    }

    setEditingItem(updatedItem);
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "New Item",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };

    setEditingItem(newItem);
    setIsEditDialogOpen(true);
  };

  // Open company details dialog
  const openCompanyDetailsDialog = () => {
    // Initialize with current invoice data
    setCompanyDetails({
      name: editableInvoice.companyName,
      address: editableInvoice.companyAddress,
      email: editableInvoice.companyEmail,
      abn: editableInvoice.companyABN,
      bankDetails: editableInvoice.companyBankDetails,
    });
    setIsCompanyDetailsDialogOpen(true);
  };

  // Save company details
  const saveCompanyDetails = () => {
    if (!companyDetails) return;

    // Update invoice with company details
    const updatedInvoice = {
      ...editableInvoice,
      companyName: companyDetails.name,
      companyAddress: companyDetails.address,
      companyEmail: companyDetails.email,
      companyABN: companyDetails.abn,
      companyBankDetails: companyDetails.bankDetails,
    };

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "invoiceCompanyDetails",
        JSON.stringify(companyDetails),
      );
    }

    setEditableInvoice(updatedInvoice);
    if (onInvoiceUpdate) onInvoiceUpdate(updatedInvoice);
    setIsCompanyDetailsDialogOpen(false);
    alert("Company details saved successfully!");
  };

  // Update company details field
  const updateCompanyDetailsField = (
    field: keyof CompanyDetails,
    value: string,
  ) => {
    if (!companyDetails) return;

    setCompanyDetails({
      ...companyDetails,
      [field]: value,
    });
  };

  // Update bank details field
  const updateBankDetailsField = (
    field: keyof CompanyDetails["bankDetails"],
    value: string,
  ) => {
    if (!companyDetails) return;

    setCompanyDetails({
      ...companyDetails,
      bankDetails: {
        ...companyDetails.bankDetails,
        [field]: value,
      } as CompanyDetails["bankDetails"],
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoImage(result);
        // Save to localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("invoiceLogoImage", result);
        }

        // Update invoice data
        const updatedInvoice = {
          ...editableInvoice,
          companyLogo: result,
        };
        setEditableInvoice(updatedInvoice);
        if (onInvoiceUpdate) onInvoiceUpdate(updatedInvoice);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open logo resize dialog
  const openLogoResizeDialog = () => {
    setIsLogoDialogOpen(true);
  };

  // Apply logo size
  const applyLogoSize = () => {
    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("invoiceLogoSize", logoSize.toString());
    }
    setIsLogoDialogOpen(false);
  };

  // If not client-side yet, show a simple loading state
  if (!isClient) {
    return <div className="p-8">Loading invoice preview...</div>;
  }

  return (
    <Card className="border-dashed w-full">
      <CardContent className="pt-6">
        {isClient ? (
          <div className="w-full max-w-6xl mx-auto bg-background rounded-xl shadow-sm border border-border">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Invoice Preview</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openCompanyDetailsDialog}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save Company Details
                </Button>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Badge
                      variant={
                        editableInvoice.clientName &&
                        editableInvoice.clientName !== "Client"
                          ? "default"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {editableInvoice.clientName &&
                      editableInvoice.clientName !== "Client"
                        ? "✓"
                        : "✗"}{" "}
                      Client
                    </Badge>
                    <Badge
                      variant={
                        editableInvoice.lineItems.length > 0
                          ? "default"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {editableInvoice.lineItems.length > 0 ? "✓" : "✗"} Items
                    </Badge>
                    <Badge
                      variant={
                        editableInvoice.taxRate > 0 ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {editableInvoice.taxRate > 0 ? "✓" : "✗"} Tax
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddLineItem}
                    className="mr-4"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="w-full sm:w-[600px]">
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={activeTemplate}
                    onChange={(e) => setActiveTemplate(e.target.value)}
                  >
                    <option value="standard">Standard</option>
                    <option value="gradient">Gradient (NEW)</option>
                    <option value="bold">Bold (NEW)</option>
                    <option value="vibrant">Vibrant (NEW)</option>
                    <option value="modern" disabled={!isPremium}>
                      Modern {!isPremium ? "(PRO)" : ""}
                    </option>
                    <option value="minimal" disabled={!isPremium}>
                      Minimal {!isPremium ? "(PRO)" : ""}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              <Tabs value={activeTemplate} onValueChange={setActiveTemplate}>
                {/* Standard Template */}
                <TabsContent value="standard" className="mt-0">
                  <Card className="border shadow-sm">
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start pb-2 gap-4">
                      <div>
                        <CardTitle
                          className="text-2xl font-bold"
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, "company-name")
                          }
                          onDragEnd={handleDragEnd}
                        >
                          {editableInvoice.companyName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editableInvoice.companyAddress}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {editableInvoice.companyEmail}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {/* Logo upload area */}
                        <div className="mb-4">
                          {logoImage || editableInvoice.companyLogo ? (
                            <div className="relative group">
                              <img
                                src={logoImage || editableInvoice.companyLogo}
                                alt="Company Logo"
                                className="h-24 w-auto object-contain max-w-[200px]"
                                style={{
                                  transform: `scale(${logoSize / 100})`,
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={() =>
                                      document
                                        .getElementById("logo-upload")
                                        ?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-1" /> Change
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={openLogoResizeDialog}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Resize
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="h-24 w-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <div className="flex flex-col items-center">
                                <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Logo
                                </span>
                              </div>
                            </div>
                          )}
                          <Input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </div>
                        <h2 className="text-3xl font-bold text-primary">
                          INVOICE
                        </h2>
                        <div className="relative group">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium mt-2">
                                Invoice #: {editableInvoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Date: {formatDate(editableInvoice.date)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Due Date: {formatDate(editableInvoice.dueDate)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openEditDialog("invoice")}
                            >
                              <FileEdit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1 relative group">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-muted-foreground">
                              Bill To:
                            </h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openEditDialog("client")}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </div>
                          <p
                            className={`font-medium ${animateChanges && lastUpdatedField === "clientInfo" ? "animate-pulse bg-blue-50 dark:bg-blue-900/20 px-2 rounded" : ""}`}
                          >
                            {editableInvoice.clientName || "Client"}
                          </p>
                          <p
                            className={`text-sm ${animateChanges && lastUpdatedField === "clientInfo" ? "animate-pulse bg-blue-50 dark:bg-blue-900/20 px-2 rounded" : ""}`}
                          >
                            {editableInvoice.clientAddress || "Client Address"}
                          </p>
                          <p
                            className={`text-sm ${animateChanges && lastUpdatedField === "clientInfo" ? "animate-pulse bg-blue-50 dark:bg-blue-900/20 px-2 rounded" : ""}`}
                          >
                            {editableInvoice.clientEmail ||
                              "client@example.com"}
                          </p>
                        </div>
                      </div>

                      <div className="relative overflow-x-auto mt-6 w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Unit Price
                              </TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editableInvoice.lineItems.map((item) => (
                              <TableRow key={item.id} className="group">
                                <TableCell>
                                  <div className="cursor-move opacity-50 group-hover:opacity-100">
                                    <DragHandleDots2Icon className="h-5 w-5" />
                                  </div>
                                </TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleEditLineItem(item.id)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() =>
                                        handleDeleteLineItem(item.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-end mt-6">
                        <div className="w-full sm:w-1/2 md:w-1/3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Subtotal:
                            </span>
                            <span>
                              {formatCurrency(editableInvoice.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between relative group">
                            <div className="flex items-center">
                              <span className="text-muted-foreground">
                                Tax ({editableInvoice.taxRate}%):
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => openEditDialog("tax")}
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                            </div>
                            <span>
                              {formatCurrency(editableInvoice.taxAmount)}
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span className="text-lg">
                              {formatCurrency(editableInvoice.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t relative group">
                        <div className="flex items-center">
                          <h4 className="font-medium mb-2">Notes</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => openEditDialog("notes")}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                        <p
                          className={`text-sm text-muted-foreground ${animateChanges && lastUpdatedField === "notes" ? "animate-pulse bg-blue-50 dark:bg-blue-900/20 px-2 rounded" : ""}`}
                        >
                          {editableInvoice.notes}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Modern Template */}
                <TabsContent value="modern" className="mt-0">
                  {isPremium ? (
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-secondary/5">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h1 className="text-3xl font-bold">
                              {editableInvoice.companyName}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                              {editableInvoice.companyAddress}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {editableInvoice.companyEmail}
                            </p>
                          </div>
                          <div className="text-right">
                            {/* Logo display for modern template */}
                            {(logoImage || editableInvoice.companyLogo) && (
                              <div className="mb-4 relative group">
                                <img
                                  src={logoImage || editableInvoice.companyLogo}
                                  alt="Company Logo"
                                  className="h-24 w-auto max-w-[200px] ml-auto object-contain"
                                  style={{
                                    transform: `scale(${logoSize / 100})`,
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-white"
                                      onClick={() =>
                                        document
                                          .getElementById("logo-upload")
                                          ?.click()
                                      }
                                    >
                                      <Upload className="h-4 w-4 mr-1" /> Change
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-white"
                                      onClick={openLogoResizeDialog}
                                    >
                                      <Edit2 className="h-4 w-4 mr-1" /> Resize
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                              <h2 className="text-xl font-bold">
                                INVOICE #{editableInvoice.invoiceNumber}
                              </h2>
                            </div>
                            <p className="text-sm mt-4">
                              Issued: {formatDate(editableInvoice.date)}
                            </p>
                            <p className="text-sm">
                              Due: {formatDate(editableInvoice.dueDate)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">
                              Bill To
                            </h3>
                            <p className="font-medium">
                              {editableInvoice.clientName}
                            </p>
                            <p className="text-sm">
                              {editableInvoice.clientAddress}
                            </p>
                            <p className="text-sm">
                              {editableInvoice.clientEmail}
                            </p>
                          </div>
                        </div>

                        {/* Similar table structure as standard but with modern styling */}
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Unit Price
                              </TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editableInvoice.lineItems.map((item) => (
                              <TableRow key={item.id} className="group">
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleEditLineItem(item.id)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() =>
                                        handleDeleteLineItem(item.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="flex justify-end mt-8">
                          <div className="w-1/3 bg-muted/50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span>Subtotal:</span>
                              <span>
                                {formatCurrency(editableInvoice.subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span>Tax ({editableInvoice.taxRate}%):</span>
                              <span>
                                {formatCurrency(editableInvoice.taxAmount)}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span>
                                {formatCurrency(editableInvoice.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm">{editableInvoice.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                      <Badge variant="secondary" className="mb-4">
                        Premium Feature
                      </Badge>
                      <h3 className="text-xl font-semibold mb-2">
                        Modern Template
                      </h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Upgrade to access premium templates with advanced
                        styling and layouts.
                      </p>
                      <Button>Upgrade to Pro</Button>
                    </div>
                  )}
                </TabsContent>

                {/* Minimal Template */}
                <TabsContent value="minimal" className="mt-0">
                  {isPremium ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-12">
                          <div>
                            <h1 className="text-2xl font-light tracking-tight">
                              {editableInvoice.companyName}
                            </h1>
                            {/* Logo display for minimal template */}
                            {(logoImage || editableInvoice.companyLogo) && (
                              <div className="mt-2 relative group">
                                <img
                                  src={logoImage || editableInvoice.companyLogo}
                                  alt="Company Logo"
                                  className="h-24 w-auto max-w-[200px] object-contain"
                                  style={{
                                    transform: `scale(${logoSize / 100})`,
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-white"
                                      onClick={() =>
                                        document
                                          .getElementById("logo-upload")
                                          ?.click()
                                      }
                                    >
                                      <Upload className="h-4 w-4 mr-1" /> Change
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-white"
                                      onClick={openLogoResizeDialog}
                                    >
                                      <Edit2 className="h-4 w-4 mr-1" /> Resize
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <h2 className="text-xl font-light">INVOICE</h2>
                            <p className="text-sm mt-1">
                              {editableInvoice.invoiceNumber}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              From
                            </h3>
                            <p className="text-sm">
                              {editableInvoice.companyAddress}
                            </p>
                            <p className="text-sm">
                              {editableInvoice.companyEmail}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              To
                            </h3>
                            <p className="text-sm font-medium">
                              {editableInvoice.clientName}
                            </p>
                            <p className="text-sm">
                              {editableInvoice.clientAddress}
                            </p>
                            <p className="text-sm">
                              {editableInvoice.clientEmail}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Issue Date
                            </h3>
                            <p className="text-sm">
                              {formatDate(editableInvoice.date)}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                              Due Date
                            </h3>
                            <p className="text-sm">
                              {formatDate(editableInvoice.dueDate)}
                            </p>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-normal">
                                Description
                              </TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-normal text-right">
                                Qty
                              </TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-normal text-right">
                                Unit
                              </TableHead>
                              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-normal text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editableInvoice.lineItems.map((item) => (
                              <TableRow
                                key={item.id}
                                className="border-b-0 group"
                              >
                                <TableCell className="py-4">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleEditLineItem(item.id)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() =>
                                        handleDeleteLineItem(item.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="flex justify-end mt-12">
                          <div className="w-1/3">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Subtotal</span>
                              <span>
                                {formatCurrency(editableInvoice.subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">
                                Tax ({editableInvoice.taxRate}%)
                              </span>
                              <span>
                                {formatCurrency(editableInvoice.taxAmount)}
                              </span>
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-medium">
                                {formatCurrency(editableInvoice.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-12 pt-6 border-t text-sm">
                          <p className="text-muted-foreground">
                            {editableInvoice.notes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                      <Badge variant="secondary" className="mb-4">
                        Premium Feature
                      </Badge>
                      <h3 className="text-xl font-semibold mb-2">
                        Minimal Template
                      </h3>
                      <p className="text-center text-muted-foreground mb-4">
                        Upgrade to access premium templates with clean,
                        minimalist designs.
                      </p>
                      <Button>Upgrade to Pro</Button>
                    </div>
                  )}
                </TabsContent>

                {/* Gradient Template */}
                <TabsContent value="gradient" className="mt-0">
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                    <div className="flex flex-col gap-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            INVOICE
                          </h1>
                          <p className="text-muted-foreground">
                            #{editableInvoice.invoiceNumber}
                          </p>
                        </div>
                        <div className="relative">
                          {logoImage || editableInvoice.companyLogo ? (
                            <div className="relative group">
                              <img
                                src={logoImage || editableInvoice.companyLogo}
                                alt="Company Logo"
                                className="h-24 w-auto max-w-[200px] object-contain"
                                style={{
                                  transform: `scale(${logoSize / 100})`,
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={() =>
                                      document
                                        .getElementById("logo-upload")
                                        ?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-1" /> Change
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={openLogoResizeDialog}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Resize
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="h-24 w-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <div className="flex flex-col items-center">
                                <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Logo
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-sm font-medium mb-2 text-blue-600">
                            From
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.companyName}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.companyAddress}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.companyEmail}
                          </p>
                          {editableInvoice.companyABN && (
                            <p className="text-muted-foreground">
                              ABN: {editableInvoice.companyABN}
                            </p>
                          )}
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-sm font-medium mb-2 text-blue-600">
                            Bill To
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.clientName}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.clientAddress}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.clientEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-muted-foreground mb-1">
                            Invoice Number
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.invoiceNumber}
                          </p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-muted-foreground mb-1">
                            Date Issued
                          </h3>
                          <p className="font-medium">
                            {formatDate(editableInvoice.date)}
                          </p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-muted-foreground mb-1">
                            Due Date
                          </h3>
                          <p className="font-medium">
                            {formatDate(editableInvoice.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/50 rounded-lg shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Unit Price
                              </TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editableInvoice.lineItems.map((item) => (
                              <TableRow key={item.id} className="group">
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleEditLineItem(item.id)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() =>
                                        handleDeleteLineItem(item.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-end">
                        <div className="w-1/3 bg-white/50 p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Subtotal:
                            </span>
                            <span>
                              {formatCurrency(editableInvoice.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Tax ({editableInvoice.taxRate}%):
                            </span>
                            <span>
                              {formatCurrency(editableInvoice.taxAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-t">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold text-blue-600">
                              {formatCurrency(editableInvoice.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {editableInvoice.companyBankDetails && (
                        <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                          <h3 className="text-sm font-medium mb-2 text-blue-600">
                            Payment Details
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Bank
                              </p>
                              <p>
                                {editableInvoice.companyBankDetails.bankName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                BSB
                              </p>
                              <p>{editableInvoice.companyBankDetails.bsb}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Account Number
                              </p>
                              <p>
                                {
                                  editableInvoice.companyBankDetails
                                    .accountNumber
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-white/50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium mb-2 text-blue-600">
                          Notes
                        </h3>
                        <p className="text-muted-foreground">
                          {editableInvoice.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Bold Template */}
                <TabsContent value="bold" className="mt-0">
                  <div className="p-8 bg-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-full h-24 bg-slate-800 rounded-t-lg"></div>

                    <div className="relative z-10 flex justify-between items-start mb-8 pt-6 px-6">
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h1 className="text-3xl font-black tracking-tight">
                          {editableInvoice.companyName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editableInvoice.companyAddress}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {editableInvoice.companyEmail}
                        </p>
                        <div className="mt-2">
                          {logoImage || editableInvoice.companyLogo ? (
                            <div className="relative group">
                              <img
                                src={logoImage || editableInvoice.companyLogo}
                                alt="Company Logo"
                                className="h-24 w-auto max-w-[180px] object-contain"
                                style={{
                                  transform: `scale(${logoSize / 100})`,
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={() =>
                                      document
                                        .getElementById("logo-upload")
                                        ?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-1" /> Change
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={openLogoResizeDialog}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Resize
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="h-24 w-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <div className="flex flex-col items-center">
                                <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Logo
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-4xl font-black text-slate-800">
                          INVOICE
                        </h2>
                        <p className="text-sm font-medium mt-2">
                          #{editableInvoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Issued: {formatDate(editableInvoice.date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(editableInvoice.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8">
                      <div className="p-6 bg-slate-50 rounded-lg">
                        <h3 className="text-lg font-bold mb-3 text-slate-800">
                          Bill To
                        </h3>
                        <p className="font-medium">
                          {editableInvoice.clientName}
                        </p>
                        <p className="text-muted-foreground">
                          {editableInvoice.clientAddress}
                        </p>
                        <p className="text-muted-foreground">
                          {editableInvoice.clientEmail}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-800 text-white">
                            <TableHead className="text-white">
                              Description
                            </TableHead>
                            <TableHead className="text-white text-right">
                              Qty
                            </TableHead>
                            <TableHead className="text-white text-right">
                              Unit Price
                            </TableHead>
                            <TableHead className="text-white text-right">
                              Amount
                            </TableHead>
                            <TableHead className="w-[80px] text-white"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editableInvoice.lineItems.map((item) => (
                            <TableRow key={item.id} className="group">
                              <TableCell className="font-medium">
                                {item.description}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.amount)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEditLineItem(item.id)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() =>
                                      handleDeleteLineItem(item.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end mt-8">
                      <div className="w-1/3 p-6 bg-slate-50 rounded-lg">
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">
                            Subtotal:
                          </span>
                          <span>
                            {formatCurrency(editableInvoice.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">
                            Tax ({editableInvoice.taxRate}%):
                          </span>
                          <span>
                            {formatCurrency(editableInvoice.taxAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-slate-300 mt-2">
                          <span className="font-bold">Total:</span>
                          <span className="text-xl font-bold text-slate-800">
                            {formatCurrency(editableInvoice.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 p-6 bg-slate-50 rounded-lg">
                      <h3 className="text-lg font-bold mb-3 text-slate-800">
                        Notes
                      </h3>
                      <p className="text-muted-foreground">
                        {editableInvoice.notes}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Vibrant Template */}
                <TabsContent value="vibrant" className="mt-0">
                  <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
                    <div className="flex flex-col gap-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            INVOICE
                          </h1>
                          <p className="text-muted-foreground">
                            #{editableInvoice.invoiceNumber}
                          </p>
                        </div>
                        <div className="relative">
                          {logoImage || editableInvoice.companyLogo ? (
                            <div className="relative group">
                              <img
                                src={logoImage || editableInvoice.companyLogo}
                                alt="Company Logo"
                                className="h-24 w-auto max-w-[200px] object-contain"
                                style={{
                                  transform: `scale(${logoSize / 100})`,
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={() =>
                                      document
                                        .getElementById("logo-upload")
                                        ?.click()
                                    }
                                  >
                                    <Upload className="h-4 w-4 mr-1" /> Change
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white"
                                    onClick={openLogoResizeDialog}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" /> Resize
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="h-24 w-48 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                document.getElementById("logo-upload")?.click()
                              }
                            >
                              <div className="flex flex-col items-center">
                                <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Upload Logo
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white/70 p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                          <h3 className="text-sm font-medium mb-2 text-purple-600">
                            From
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.companyName}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.companyAddress}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.companyEmail}
                          </p>
                          {editableInvoice.companyABN && (
                            <p className="text-muted-foreground">
                              ABN: {editableInvoice.companyABN}
                            </p>
                          )}
                        </div>
                        <div className="bg-white/70 p-4 rounded-lg shadow-sm border-l-4 border-pink-500">
                          <h3 className="text-sm font-medium mb-2 text-pink-600">
                            Bill To
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.clientName}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.clientAddress}
                          </p>
                          <p className="text-muted-foreground">
                            {editableInvoice.clientEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-purple-600 font-medium mb-1">
                            Invoice Number
                          </h3>
                          <p className="font-medium">
                            {editableInvoice.invoiceNumber}
                          </p>
                        </div>
                        <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-purple-600 font-medium mb-1">
                            Date Issued
                          </h3>
                          <p className="font-medium">
                            {formatDate(editableInvoice.date)}
                          </p>
                        </div>
                        <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                          <h3 className="text-xs text-purple-600 font-medium mb-1">
                            Due Date
                          </h3>
                          <p className="font-medium">
                            {formatDate(editableInvoice.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/70 rounded-lg shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Unit Price
                              </TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {editableInvoice.lineItems.map((item) => (
                              <TableRow key={item.id} className="group">
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        handleEditLineItem(item.id)
                                      }
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() =>
                                        handleDeleteLineItem(item.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-end">
                        <div className="w-1/3 bg-white/70 p-4 rounded-lg shadow-sm border-t-4 border-purple-500">
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Subtotal:
                            </span>
                            <span>
                              {formatCurrency(editableInvoice.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Tax ({editableInvoice.taxRate}%):
                            </span>
                            <span>
                              {formatCurrency(editableInvoice.taxAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-t">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {formatCurrency(editableInvoice.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                        <h3 className="text-sm font-medium mb-2 text-purple-600">
                          Notes
                        </h3>
                        <p className="text-muted-foreground">
                          {editableInvoice.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="border-t border-border p-4 mt-4">
                <InvoiceExportOptions
                  isPremiumUser={isPremium}
                  invoiceData={editableInvoice}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading invoice preview...</p>
          </div>
        )}
      </CardContent>

      {/* Hidden file input for logo upload */}
      <Input
        id="logo-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleLogoUpload}
      />

      {/* Edit Invoice Dialog */}
      <EditInvoiceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        section={editSection}
        invoiceData={editableInvoice}
        onSave={handleInvoiceUpdate}
      />

      {/* Edit Line Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id.startsWith("item-") &&
              !editableInvoice.lineItems.some(
                (item) => item.id === editingItem.id,
              )
                ? "Add New Item"
                : "Edit Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={editingItem?.description || ""}
                onChange={(e) =>
                  updateEditingItemField("description", e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={editingItem?.quantity || 0}
                  onChange={(e) =>
                    updateEditingItemField("quantity", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem?.unitPrice || 0}
                  onChange={(e) =>
                    updateEditingItemField("unitPrice", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <div className="p-2 bg-muted rounded-md">
                {formatCurrency(editingItem?.amount || 0)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveLineItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteLineItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog
        open={isCompanyDetailsDialogOpen}
        onOpenChange={setIsCompanyDetailsDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyDetails?.name || ""}
                onChange={(e) =>
                  updateCompanyDetailsField("name", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input
                id="companyAddress"
                value={companyDetails?.address || ""}
                onChange={(e) =>
                  updateCompanyDetailsField("address", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyDetails?.email || ""}
                onChange={(e) =>
                  updateCompanyDetailsField("email", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyABN">ABN/Tax ID</Label>
              <Input
                id="companyABN"
                value={companyDetails?.abn || ""}
                onChange={(e) =>
                  updateCompanyDetailsField("abn", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Bank Details</Label>
              <div className="grid grid-cols-1 gap-2 p-3 border rounded-md">
                <div className="grid gap-2">
                  <Label htmlFor="bankName" className="text-sm">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    value={companyDetails?.bankDetails?.bankName || ""}
                    onChange={(e) =>
                      updateBankDetailsField("bankName", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="bsb" className="text-sm">
                      BSB/Routing
                    </Label>
                    <Input
                      id="bsb"
                      value={companyDetails?.bankDetails?.bsb || ""}
                      onChange={(e) =>
                        updateBankDetailsField("bsb", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accountNumber" className="text-sm">
                      Account Number
                    </Label>
                    <Input
                      id="accountNumber"
                      value={companyDetails?.bankDetails?.accountNumber || ""}
                      onChange={(e) =>
                        updateBankDetailsField("accountNumber", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompanyDetailsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveCompanyDetails}>Save Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logo Resize Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resize Logo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="logoSize">Size: {logoSize}%</Label>
                <span className="text-sm text-muted-foreground">
                  {logoSize}%
                </span>
              </div>
              <Slider
                id="logoSize"
                min={10}
                max={200}
                step={5}
                value={[logoSize]}
                onValueChange={(value) => setLogoSize(value[0])}
              />
            </div>
            <div className="flex justify-center p-4 bg-muted/30 rounded-md">
              {(logoImage || editableInvoice.companyLogo) && (
                <img
                  src={logoImage || editableInvoice.companyLogo}
                  alt="Logo Preview"
                  className="max-h-32 max-w-full object-contain"
                  style={{ transform: `scale(${logoSize / 100})` }}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLogoDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyLogoSize}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InvoicePreview;
export type { LineItem, InvoiceData };
