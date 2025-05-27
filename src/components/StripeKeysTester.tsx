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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StripeKeysTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [priceId, setPriceId] = useState("");
  const [amount, setAmount] = useState("2000"); // Default to $20.00
  const [currency, setCurrency] = useState("aud"); // Default to AUD
  const [newSecretKey, setNewSecretKey] = useState("");
  const [rotatingKey, setRotatingKey] = useState(false);

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

  const rotateStripeKey = async () => {
    if (!newSecretKey) {
      setError("Please enter a new Stripe Secret Key");
      return;
    }

    // Validate key format
    const secretKeyPattern = /^sk_(test|live)_[a-zA-Z0-9]{24,}$/;
    if (!secretKeyPattern.test(newSecretKey)) {
      setError(
        "Invalid Stripe Secret Key format. Should start with 'sk_test_' or 'sk_live_'",
      );
      return;
    }

    setRotatingKey(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/stripe-key-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rotateKey",
          newKey: newSecretKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rotate Stripe key");
      }

      setResult(data);
      // Clear the input field after successful rotation
      setNewSecretKey("");
    } catch (err: any) {
      setError(
        err.message || "An error occurred while rotating the Stripe key",
      );
      console.error("Error rotating Stripe key:", err);
    } finally {
      setRotatingKey(false);
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
          <CardTitle>Rotate Stripe Secret Key</CardTitle>
          <CardDescription>
            Update your Stripe Secret Key in the environment. This will update
            the key in your Vercel environment variables.
            <Alert className="mt-4" variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Only administrators can perform this action. Make sure you have
                already created a new key in the Stripe Dashboard.
              </AlertDescription>
            </Alert>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newSecretKey">New Stripe Secret Key</Label>
            <Input
              id="newSecretKey"
              type="password"
              placeholder="sk_test_..."
              value={newSecretKey}
              onChange={(e) => setNewSecretKey(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={rotateStripeKey}
            disabled={rotatingKey || !newSecretKey}
          >
            {rotatingKey ? "Updating..." : "Update Stripe Secret Key"}
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
