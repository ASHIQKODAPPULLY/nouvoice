"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoadingPriceId(priceId);

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = `/auth/signin?redirect=${encodeURIComponent("/pricing")}`;
        return;
      }

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout-session",
        {
          body: {
            priceId,
            returnUrl: window.location.origin,
            userId: session.user.id,
          },
        },
      );

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to create checkout session");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Unable to process your request. Please try again later.");
    } finally {
      setLoadingPriceId(null);
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">I</span>
            </div>
            <h1 className="text-xl font-bold">Nouvoice</h1>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/" passHref>
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/pricing" passHref>
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Button variant="outline">Sign In</Button>
            <Button>Get Started</Button>
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="outline" size="sm" className="mr-2">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-3 md:space-y-4">
            <Badge className="bg-gradient-to-r from-gradient-blue to-gradient-purple text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm">
              Pricing Plans
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Choose the perfect plan for your business
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, transparent pricing that grows with your business. No
              hidden fees or surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6 md:pt-8">
            {/* Free Plan */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl md:text-2xl font-bold">Free</span>
                  <Badge variant="outline" className="text-xs md:text-sm">
                    Limited
                  </Badge>
                </CardTitle>
                <div className="mt-3 md:mt-4">
                  <span className="text-3xl md:text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2 text-sm md:text-base">
                    /month
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm md:text-base">
                  Perfect for individuals just getting started
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Up to 50 invoices per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Basic invoice templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>PDF & CSV exports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>AI-powered invoice generation</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="pt-2 md:pt-4">
                <Button
                  className="w-full py-2 md:py-2.5 text-sm md:text-base"
                  variant="outline"
                  onClick={() => {
                    // For free plan, redirect to signup directly
                    window.location.href = `/auth/signup?plan=free`;
                  }}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Annual Discount Plan */}
            <Card className="border-2 border-gradient-purple shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 md:w-24 h-20 md:h-24 overflow-hidden">
                <div className="absolute transform rotate-45 bg-gradient-to-r from-gradient-pink to-gradient-purple text-white font-medium py-1 right-[-35px] top-[28px] md:top-[32px] w-[150px] md:w-[170px] text-center text-[10px] md:text-xs">
                  SPECIAL OFFER
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Annual Access</span>
                  <Badge className="bg-gradient-to-r from-gradient-pink to-gradient-purple text-white">
                    Best Value
                  </Badge>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$50</span>
                  <span className="text-muted-foreground ml-2">/year</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Full access for an entire year at a discounted flat rate
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Unlimited invoices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>All premium templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom branding options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Client management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Team access (1 team, up to 3 members)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-gradient-pink to-gradient-purple hover:opacity-90"
                  onClick={() => handleSubscribe("price_annual_discount_50")}
                  disabled={loadingPriceId === "price_annual_discount_50"}
                >
                  {loadingPriceId === "price_annual_discount_50"
                    ? "Processing..."
                    : "Get Annual Access"}{" "}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Pro</span>
                  <Badge variant="outline">Monthly</Badge>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  For growing businesses and professionals
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Unlimited invoices</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>All premium templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom branding options</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Client management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Team access (1 team, up to 3 members)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSubscribe("price_monthly_pro")}
                  disabled={loadingPriceId === "price_monthly_pro"}
                >
                  {loadingPriceId === "price_monthly_pro"
                    ? "Processing..."
                    : "Upgrade to Pro"}{" "}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Team Plan */}
            <Card className="border-2 border-blue-300 shadow-lg hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Team</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Collaboration
                  </Badge>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  For teams that need to collaborate efficiently
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Everything in Pro plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Unlimited team members</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced role management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Team activity dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Shared invoice templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    handleSubscribe("price_1RPG53BHa6CDK7TJGyBiQwM2")
                  }
                  disabled={loadingPriceId === "price_1RPG53BHa6CDK7TJGyBiQwM2"}
                >
                  {loadingPriceId === "price_1RPG53BHa6CDK7TJGyBiQwM2"
                    ? "Processing..."
                    : "Upgrade to Team"}{" "}
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold">Enterprise</span>
                  <Badge variant="secondary">Custom</Badge>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  For large organizations with specific needs
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Everything in Team plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced security features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>SLA guarantees</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    (window.location.href =
                      "mailto:sales@nouvoice.com?subject=Enterprise%20Plan%20Inquiry")
                  }
                >
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Team Features Section */}
          <div className="py-8 md:py-12 border-t border-b">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                Team Collaboration Features
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Streamline your team's workflow with our powerful collaboration
                tools
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Role-Based Access</h3>
                <p className="text-muted-foreground">
                  Assign different roles to team members with specific
                  permissions for viewing, editing, and managing invoices.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-600"
                  >
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Simple Invitations</h3>
                <p className="text-muted-foreground">
                  Invite team members via email or shareable link. New members
                  can join with just a click.
                </p>
              </div>

              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-600"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="3"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="3" x2="21" y1="9" y2="9"></line>
                    <line x1="9" x2="9" y1="21" y2="9"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Shared Templates</h3>
                <p className="text-muted-foreground">
                  Create and share invoice templates across your team to
                  maintain consistent branding and formatting.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 md:mt-24 space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-medium">
                  Can I switch plans later?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Yes, you can upgrade, downgrade, or cancel your plan at any
                  time. Changes take effect at the start of your next billing
                  cycle.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 14-day money-back guarantee for all paid plans. If
                  you're not satisfied, contact our support team within 14 days
                  of your purchase.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, PayPal, and bank transfers
                  for annual plans. Cryptocurrency payments are available upon
                  request.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium">
                  How many team members can I add?
                </h3>
                <p className="text-muted-foreground">
                  The Free plan doesn't include team features. The Pro plan
                  allows up to 3 team members. The Team plan supports unlimited
                  team members. For larger organizations, our Enterprise plan
                  offers custom team structures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2023 Nouvoice. All rights reserved.
            </p>
            <div className="flex gap-4 md:gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
