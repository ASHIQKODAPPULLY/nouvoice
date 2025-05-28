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

export default function StripeKeysTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testKey, setTestKey] = useState("");

  const testStripeKey = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate key format if provided
      if (testKey) {
        const secretKeyPattern = /^sk_(test|live)_[a-zA-Z0-9]{24,}$/;
        if (!secretKeyPattern.test(testKey)) {
          setError(
            "Invalid Stripe Secret Key format. Should start with 'sk_test_' or 'sk_live_'",
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "validateKeys",
          testKey: testKey || undefined,
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

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Test Stripe API Keys</CardTitle>
          <CardDescription>
            Validate your Stripe API keys by testing connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testKey">
              Test Key (Optional - uses environment variable if not provided)
            </Label>
            <Input
              id="testKey"
              type="password"
              placeholder="sk_test_..."
              value={testKey}
              onChange={(e) => setTestKey(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testStripeKey} disabled={loading}>
            {loading ? "Testing..." : "Test API Key"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card
          className={result.success ? "border-green-500" : "border-red-500"}
        >
          <CardHeader>
            <CardTitle
              className={result.success ? "text-green-500" : "text-red-500"}
            >
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
