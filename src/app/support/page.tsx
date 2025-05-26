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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Support Center | InvoiceGen",
  description:
    "Get help with InvoiceGen. Browse our knowledge base or contact our support team.",
};

export default function SupportPage() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-6">Support Center</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Get help with InvoiceGen. Browse our knowledge base or contact our
        support team.
      </p>

      <Tabs defaultValue="faq" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about InvoiceGen
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
                    dashboard and click on the "New Invoice" button. You can
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
                    InvoiceGen supports various payment methods including
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
                    Yes, InvoiceGen offers extensive customization options for
                    your invoice templates. You can add your logo, change
                    colors, adjust layouts, and more. Premium users have access
                    to additional customization features.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I track payments?</AccordionTrigger>
                  <AccordionContent>
                    InvoiceGen provides a comprehensive dashboard where you can
                    track the status of all your invoices. You'll receive
                    notifications when invoices are viewed, paid, or become
                    overdue. You can also generate reports to analyze your
                    payment history.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Our support team is here to help you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="What is your inquiry about?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="w-full min-h-[150px] p-3 border rounded-md"
                    placeholder="Please describe your issue in detail"
                  ></textarea>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit Support Request</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video Tutorial</p>
              </div>
              <CardHeader>
                <CardTitle>Getting Started with InvoiceGen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn the basics of creating and managing invoices with
                  InvoiceGen in this comprehensive tutorial.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video Tutorial</p>
              </div>
              <CardHeader>
                <CardTitle>Advanced Invoice Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover how to create custom invoice templates that match
                  your brand identity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video Tutorial</p>
              </div>
              <CardHeader>
                <CardTitle>Setting Up Recurring Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn how to automate your billing process with recurring
                  invoices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video Tutorial</p>
              </div>
              <CardHeader>
                <CardTitle>Integrating with Accounting Software</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  See how to connect InvoiceGen with popular accounting software
                  for seamless workflow.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
