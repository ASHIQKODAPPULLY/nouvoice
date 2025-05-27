"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

// Explicitly mark as client-side only to prevent prerendering issues
export const dynamic = "force-dynamic";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          throw new Error("No session ID found");
        }

        const response = await fetch(
          `/api/verify-payment?sessionId=${sessionId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }

        const data = await response.json();
        setSessionData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to verify payment");
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Verifying your payment...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-muted-foreground">
              Please wait while we confirm your subscription
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Payment Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/pricing">Return to Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xl font-medium">
              Thank you for your subscription!
            </p>
            <p className="text-muted-foreground">
              Your Nouvoice Pro account is now active.
            </p>
          </div>

          <div className="space-y-4 w-full">
            <h3 className="font-medium">What's next?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Access to all premium templates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited invoices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <span>Custom branding options</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/">Create an Invoice</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the client component in a parent component with Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                Loading payment details...
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
