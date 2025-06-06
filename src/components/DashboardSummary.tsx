"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ArrowUpRight,
  DollarSign,
  FileText,
  Users,
  Clock,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { Invoice } from "./InvoiceTracker";

interface DashboardSummaryProps {
  invoices: Invoice[];
  isPremium: boolean;
}

interface SummaryStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  overdueInvoices: number;
  topClients: { name: string; amount: number }[];
}

interface ApiSummaryData {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  overdueInvoices: number;
  topClients: { name: string; amount: number }[];
  recentInvoices?: any[];
  summary?: {
    totalRevenue: number;
    pendingRevenue: number;
    collectionRate: number;
    averageInvoiceValue: number;
  };
}

export default function DashboardSummary({
  invoices,
  isPremium,
}: DashboardSummaryProps) {
  const [stats, setStats] = useState<SummaryStats>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    overdueInvoices: 0,
    topClients: [],
  });
  const [apiData, setApiData] = useState<ApiSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from API for premium users
  useEffect(() => {
    if (!isPremium) return;

    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/invoices-summary");
        if (response.ok) {
          const data = await response.json();
          setApiData(data);
          setStats({
            totalInvoices: data.totalInvoices,
            totalAmount: data.totalAmount,
            paidAmount: data.paidAmount,
            unpaidAmount: data.unpaidAmount,
            overdueAmount: data.overdueAmount,
            overdueInvoices: data.overdueInvoices,
            topClients: data.topClients,
          });
        } else {
          // Fallback to local calculation
          calculateLocalStats();
        }
      } catch (error) {
        console.error("Error fetching summary data:", error);
        // Fallback to local calculation
        calculateLocalStats();
      } finally {
        setIsLoading(false);
      }
    };

    const calculateLocalStats = () => {
      // Calculate summary statistics from invoices
      const totalInvoices = invoices.length;
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const paidAmount = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.amount, 0);
      const unpaidAmount = invoices
        .filter((inv) => inv.status === "unpaid")
        .reduce((sum, inv) => sum + inv.amount, 0);
      const overdueInvoices = invoices.filter(
        (inv) => inv.status === "overdue",
      ).length;
      const overdueAmount = invoices
        .filter((inv) => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Calculate top clients
      const clientMap = new Map<string, number>();
      invoices.forEach((inv) => {
        const currentAmount = clientMap.get(inv.clientName) || 0;
        clientMap.set(inv.clientName, currentAmount + inv.amount);
      });

      const topClients = Array.from(clientMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setStats({
        totalInvoices,
        totalAmount,
        paidAmount,
        unpaidAmount,
        overdueAmount,
        overdueInvoices,
        topClients,
      });
    };

    fetchSummaryData();
  }, [invoices, isPremium]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const downloadAsCSV = () => {
    const csvData = [
      ["Metric", "Value"],
      ["Total Invoices", stats.totalInvoices.toString()],
      ["Total Amount", stats.totalAmount.toString()],
      ["Paid Amount", stats.paidAmount.toString()],
      ["Unpaid Amount", stats.unpaidAmount.toString()],
      ["Overdue Amount", stats.overdueAmount.toString()],
      ["Overdue Invoices", stats.overdueInvoices.toString()],
      [""],
      ["Top Clients", ""],
      ...stats.topClients.map((client) => [
        client.name,
        client.amount.toString(),
      ]),
      [""],
      ["Invoice Details", ""],
      ["Invoice Number", "Client", "Amount", "Date", "Due Date", "Status"],
      ...invoices.map((inv) => [
        inv.invoiceNumber || "",
        inv.clientName || "",
        inv.amount.toString(),
        inv.date || "",
        inv.dueDate || "",
        inv.status || "",
      ]),
    ];

    const csvContent = csvData
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoice-summary-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsExcel = () => {
    // For Excel format, we'll create a more structured CSV that Excel can interpret
    const excelData = [
      ["Invoice Summary Report"],
      ["Generated on: " + new Date().toLocaleDateString()],
      [""],
      ["SUMMARY STATISTICS"],
      ["Total Invoices", stats.totalInvoices],
      ["Total Amount", stats.totalAmount],
      ["Paid Amount", stats.paidAmount],
      ["Unpaid Amount", stats.unpaidAmount],
      ["Overdue Amount", stats.overdueAmount],
      ["Overdue Invoices", stats.overdueInvoices],
      [""],
      ["TOP CLIENTS"],
      ["Client Name", "Total Amount"],
      ...stats.topClients.map((client) => [client.name, client.amount]),
      [""],
      ["DETAILED INVOICE LIST"],
      ["Invoice Number", "Client Name", "Amount", "Date", "Due Date", "Status"],
      ...invoices.map((inv) => [
        inv.invoiceNumber || "",
        inv.clientName || "",
        inv.amount,
        inv.date || "",
        inv.dueDate || "",
        inv.status || "",
      ]),
    ];

    const csvContent = excelData
      .map((row) =>
        row
          .map((field) => (typeof field === "string" ? `"${field}"` : field))
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `invoice-summary-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isPremium) {
    return (
      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="mb-2">
              Premium Feature
            </Badge>
            <h3 className="text-xl font-medium">Dashboard Analytics</h3>
            <p className="text-muted-foreground max-w-md">
              Unlock detailed invoice analytics, payment tracking, and business
              insights with our Premium plan.
            </p>
            <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Summary</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={downloadAsCSV}
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={downloadAsExcel}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Download Excel</span>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Invoiced
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.totalAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalInvoices} invoices
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.unpaidAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {invoices.filter((inv) => inv.status === "unpaid").length}{" "}
                  unpaid invoices
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Overdue
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.overdueAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overdueInvoices} overdue invoices
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Collected
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.paidAmount)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {invoices.filter((inv) => inv.status === "paid").length} paid
                  invoices
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Summary Cards */}
      {apiData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Collection Rate
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {apiData.summary.collectionRate}%
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Payment success rate
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg Invoice Value
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatCurrency(apiData.summary.averageInvoiceValue)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per invoice average
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatCurrency(apiData.summary.totalRevenue)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Collected payments
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Revenue
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {formatCurrency(apiData.summary.pendingRevenue)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting payment
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topClients.length > 0 ? (
              <div className="space-y-4">
                {stats.topClients.map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {
                            invoices.filter(
                              (inv) => inv.clientName === client.name,
                            ).length
                          }{" "}
                          invoices
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(client.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No client data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Paid</p>
                  <p className="text-sm font-medium">
                    {stats.totalAmount > 0
                      ? Math.round((stats.paidAmount / stats.totalAmount) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${stats.totalAmount > 0 ? (stats.paidAmount / stats.totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Unpaid</p>
                  <p className="text-sm font-medium">
                    {stats.totalAmount > 0
                      ? Math.round(
                          (stats.unpaidAmount / stats.totalAmount) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${stats.totalAmount > 0 ? (stats.unpaidAmount / stats.totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Overdue</p>
                  <p className="text-sm font-medium">
                    {stats.totalAmount > 0
                      ? Math.round(
                          (stats.overdueAmount / stats.totalAmount) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${stats.totalAmount > 0 ? (stats.overdueAmount / stats.totalAmount) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
