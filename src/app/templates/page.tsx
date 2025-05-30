"use client";

import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Invoice Templates | InvoiceGen",
  description:
    "Browse our collection of professional invoice templates for your business.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12 mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          Invoice Templates
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Browse our collection of professional invoice templates for your
          business.
        </p>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="industry">By Industry</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Template cards */}
              <TemplateCard
                name="Classic"
                type="free"
                description="A clean, professional template suitable for any business"
              />
              <TemplateCard
                name="Modern"
                type="free"
                description="Contemporary design with a minimalist aesthetic"
              />
              <TemplateCard
                name="Creative"
                type="premium"
                description="Bold design for creative professionals and agencies"
              />
              <TemplateCard
                name="Corporate"
                type="premium"
                description="Formal template ideal for corporate businesses"
              />
              <TemplateCard
                name="Freelancer"
                type="free"
                description="Simple template designed specifically for freelancers"
              />
              <TemplateCard
                name="Consultant"
                type="premium"
                description="Professional template for consultants and advisors"
              />
            </div>
          </TabsContent>

          <TabsContent value="free" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TemplateCard
                name="Classic"
                type="free"
                description="A clean, professional template suitable for any business"
              />
              <TemplateCard
                name="Modern"
                type="free"
                description="Contemporary design with a minimalist aesthetic"
              />
              <TemplateCard
                name="Freelancer"
                type="free"
                description="Simple template designed specifically for freelancers"
              />
            </div>
          </TabsContent>

          <TabsContent value="premium" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TemplateCard
                name="Creative"
                type="premium"
                description="Bold design for creative professionals and agencies"
              />
              <TemplateCard
                name="Corporate"
                type="premium"
                description="Formal template ideal for corporate businesses"
              />
              <TemplateCard
                name="Consultant"
                type="premium"
                description="Professional template for consultants and advisors"
              />
            </div>
          </TabsContent>

          <TabsContent value="industry" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <TemplateCard
                name="IT Services"
                type="premium"
                description="Specialized template for IT consultants and service providers"
              />
              <TemplateCard
                name="Construction"
                type="premium"
                description="Detailed template for construction and contracting businesses"
              />
              <TemplateCard
                name="Creative Agency"
                type="premium"
                description="Showcase your creative work with this agency-focused template"
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TemplateCard({
  name,
  type,
  description,
}: {
  name: string;
  type: "free" | "premium";
  description: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted flex items-center justify-center border-b">
        <p className="text-muted-foreground">Template Preview</p>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full ${type === "premium" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}
          >
            {type === "premium" ? "Premium" : "Free"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          {type === "premium" ? "Upgrade to Access" : "Use Template"}
        </Button>
      </CardFooter>
    </Card>
  );
}
