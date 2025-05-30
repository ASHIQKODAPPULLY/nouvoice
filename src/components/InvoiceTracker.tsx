"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { AlertCircle, Bell, Check, Clock, DollarSign, X } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  reminderSent: boolean;
}

interface InvoiceTrackerProps {
  invoices?: Invoice[];
  onMarkAsPaid?: (invoiceId: string) => void;
  onSendReminder?: (invoiceId: string) => void;
}

const defaultInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2023-001",
    clientName: "Acme Corporation",
    amount: 2200,
    date: "2023-05-15",
    dueDate: "2023-06-15",
    status: "paid",
    reminderSent: false,
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-002",
    clientName: "Globex Inc",
    amount: 1500,
    date: "2023-06-01",
    dueDate: "2023-07-01",
    status: "unpaid",
    reminderSent: true,
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-003",
    clientName: "Stark Industries",
    amount: 3500,
    date: "2023-06-15",
    dueDate: "2023-06-30",
    status: "overdue",
    reminderSent: false,
  },
];

export default function InvoiceTracker({
  invoices = defaultInvoices,
  onMarkAsPaid = () => {},
  onSendReminder = () => {},
}: InvoiceTrackerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);

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
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMarkAsPaid = () => {
    if (selectedInvoice) {
      onMarkAsPaid(selectedInvoice.id);
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
    }
  };

  const handleSendReminder = () => {
    if (selectedInvoice) {
      onSendReminder(selectedInvoice.id);
      setShowReminderDialog(false);
      setSelectedInvoice(null);
    }
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="h-3 w-3 mr-1" /> Paid
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Unpaid
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Overdue
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="w-full bg-card border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Invoice Tracker
          </CardTitle>
          <CardDescription>
            Monitor payment status and send reminders for unpaid invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No invoices to track yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const daysRemaining = getDaysRemaining(invoice.dueDate);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(invoice.dueDate)}</span>
                            {invoice.status !== "paid" && (
                              <span
                                className={`text-xs ${daysRemaining < 0 ? "text-destructive" : daysRemaining <= 7 ? "text-amber-600" : "text-muted-foreground"}`}
                              >
                                {daysRemaining < 0
                                  ? `${Math.abs(daysRemaining)} days overdue`
                                  : daysRemaining === 0
                                    ? "Due today"
                                    : `${daysRemaining} days remaining`}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {invoice.status !== "paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentDialog(true);
                                }}
                              >
                                <DollarSign className="h-3 w-3" />
                                <span>Mark Paid</span>
                              </Button>
                            )}
                            {invoice.status !== "paid" &&
                              !invoice.reminderSent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setShowReminderDialog(true);
                                  }}
                                >
                                  <Bell className="h-3 w-3" />
                                  <span>Send Reminder</span>
                                </Button>
                              )}
                            {invoice.reminderSent && (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground"
                              >
                                Reminder Sent
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this invoice as paid?
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4">
              <p>
                <strong>Invoice:</strong> {selectedInvoice.invoiceNumber}
              </p>
              <p>
                <strong>Client:</strong> {selectedInvoice.clientName}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatCurrency(selectedInvoice.amount)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder to the client for this invoice?
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4">
              <p>
                <strong>Invoice:</strong> {selectedInvoice.invoiceNumber}
              </p>
              <p>
                <strong>Client:</strong> {selectedInvoice.clientName}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatCurrency(selectedInvoice.amount)}
              </p>
              <p>
                <strong>Due Date:</strong> {formatDate(selectedInvoice.dueDate)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReminderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>Send Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
