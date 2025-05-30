import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support Center | Nouvoice",
  description:
    "Get help with Nouvoice. Browse our knowledge base or contact our support team.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container px-4 py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          Support Center
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get help with Nouvoice. Browse our knowledge base or contact our
          support team.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>
                Need help? Want to share feedback? Our team is here for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email us directly</h3>
                    <a
                      href="mailto:contact@nouvoice.com.au"
                      className="text-blue-600 hover:underline"
                    >
                      contact@nouvoice.com.au
                    </a>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    We aim to respond within 24 hours, Monday to Friday.
                  </p>
                </div>

                <div className="pt-4">
                  <Link href="/about" passHref>
                    <Button variant="outline">About Our Company</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about Nouvoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How do I create my first invoice?
                  </AccordionTrigger>
                  <AccordionContent>
                    To create your first invoice, simply navigate to the
                    dashboard and click on the "Create Invoice" tab. You can
                    then enter a description of your work in natural language,
                    and our AI will generate a professional invoice for you. You
                    can also edit any details manually if needed.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    What payment methods do you support?
                  </AccordionTrigger>
                  <AccordionContent>
                    Nouvoice supports various payment methods including
                    credit/debit cards, PayPal, bank transfers, and
                    cryptocurrency payments. You can configure your preferred
                    payment methods in your account settings.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How do I upgrade to a premium plan?
                  </AccordionTrigger>
                  <AccordionContent>
                    To upgrade to a premium plan, go to the "Pricing" page and
                    select the plan that best suits your needs. You can pay
                    monthly or annually, with annual plans offering a
                    significant discount.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Can I customize my invoice templates?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, Nouvoice offers extensive customization options for
                    your invoice templates. You can add your logo, change
                    colors, adjust layouts, and more. Premium users have access
                    to additional customization features.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I track payments?</AccordionTrigger>
                  <AccordionContent>
                    Nouvoice provides a comprehensive dashboard where you can
                    track the status of all your invoices. You'll receive
                    notifications when invoices are viewed, paid, or become
                    overdue. You can also generate reports to analyze your
                    payment history.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
