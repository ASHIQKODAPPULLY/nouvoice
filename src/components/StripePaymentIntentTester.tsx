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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function StripePaymentIntentTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("2000"); // Default to $20.00
  const [currency, setCurrency] = useState("aud"); // Default to AUD
  const [edgeFunctionDeployed, setEdgeFunctionDeployed] = useState(true);

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

      if (!data.success) {
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

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
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
          <Button
            onClick={createTestPaymentIntent}
            disabled={loading || !edgeFunctionDeployed}
          >
            {loading ? "Creating..." : "Create Test Payment Intent"}
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
