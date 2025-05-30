import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Guides | InvoiceGen",
  description:
    "Step-by-step guides to help you get the most out of InvoiceGen.",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Guides</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Step-by-step guides to help you get the most out of InvoiceGen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with InvoiceGen</CardTitle>
              <CardDescription>
                Learn the basics of creating your first AI-powered invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This guide covers everything you need to know to create your
                first invoice using our AI assistant. Learn how to describe your
                work in natural language and get a perfectly formatted invoice
                in seconds.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customizing Your Invoice Templates</CardTitle>
              <CardDescription>
                Make your invoices match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Learn how to customize the look and feel of your invoices with
                our template editor. Add your logo, change colors, and create a
                professional look that represents your brand.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setting Up Recurring Invoices</CardTitle>
              <CardDescription>Automate your billing process</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Save time by setting up recurring invoices for your regular
                clients. This guide shows you how to configure payment
                schedules, automatic reminders, and more.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Payments and Managing Clients</CardTitle>
              <CardDescription>Keep your finances organized</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Learn how to use InvoiceGen's dashboard to track payments,
                manage client information, and get insights into your business
                finances.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read Guide <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
