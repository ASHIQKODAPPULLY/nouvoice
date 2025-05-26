"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function StripeKeysTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [priceId, setPriceId] = useState("");
  const [amount, setAmount] = useState("2000"); // Default to $20.00
  const [currency, setCurrency] = useState("aud"); // Default to AUD

  const testApiKeys = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "validateKeys",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to test API keys");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while testing API keys");
      console.error("Error testing API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTestPaymentIntent = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate amount
      const amountNum = parseInt(amount, 10);
      if (isNaN(amountNum) || amountNum < 50) {
        setError("Amount must be at least 50 cents");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createPaymentIntent",
          amount: amountNum,
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to create test payment intent";
        console.error("API response error:", data);
        throw new Error(errorMsg);
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while creating test payment intent",
      );
      console.error("Error creating test payment intent:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTestSubscription = async () => {
    if (!customerId || !priceId) {
      setError("Customer ID and Price ID are required");
      return;
    }

    // Validate customerId format
    const validCustomerIdPattern = /^cus_[a-zA-Z0-9]+$/;
    if (!validCustomerIdPattern.test(customerId)) {
      setError("Invalid customer ID format. Should start with 'cus_'");
      return;
    }

    // Validate priceId format
    const validPriceIdPattern = /^price_[a-zA-Z0-9_]+$/;
    if (!validPriceIdPattern.test(priceId)) {
      setError("Invalid price ID format. Should start with 'price_'");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createSubscription",
          customerId,
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to create test subscription";
        console.error("API response error:", data);
        throw new Error(errorMsg);
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while creating test subscription",
      );
      console.error("Error creating test subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Test Stripe API Keys</CardTitle>
          <CardDescription>
            Validate your Stripe API keys by making an authenticated request to
            list customers.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={testApiKeys} disabled={loading}>
            {loading ? "Testing..." : "Test API Keys"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Payment Intent</CardTitle>
          <CardDescription>
            Create a test payment intent to verify your Stripe API keys are
            working. This is the recommended first test for new API keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (in cents)</Label>
            <Input
              id="amount"
              placeholder="2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              placeholder="aud"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createTestPaymentIntent} disabled={loading}>
            {loading ? "Creating..." : "Create Test Payment Intent"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Subscription</CardTitle>
          <CardDescription>
            Create a test subscription using a customer ID and price ID from
            your Stripe test mode.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              placeholder="cus_..."
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceId">Price ID</Label>
            <Input
              id="priceId"
              placeholder="price_..."
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={createTestSubscription}
            disabled={loading || !customerId || !priceId}
          >
            {loading ? "Creating..." : "Create Test Subscription"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-500">
              {result.success ? "Success" : "Error"}
            </CardTitle>
            {result.message && (
              <CardDescription>{result.message}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result.data || result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
