"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

export default function StripeWebhookTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testWebhookEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/webhook-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list_webhooks",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to test webhook endpoints");
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while testing webhook endpoints",
      );
      console.error("Error testing webhook endpoints:", err);
    } finally {
      setLoading(false);
    }
  };

  const createWebhookEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/webhook-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_webhook",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create webhook endpoint");
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "An error occurred while creating webhook endpoint",
      );
      console.error("Error creating webhook endpoint:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Webhook Configuration</CardTitle>
          <CardDescription>
            Test and manage your Stripe webhook endpoints to ensure proper
            integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Webhook configuration is essential for Stripe to communicate
              events back to your application. Missing or misconfigured webhooks
              can cause payment processing issues.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button
            onClick={testWebhookEndpoint}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Testing..." : "List Webhook Endpoints"}
          </Button>
          <Button onClick={createWebhookEndpoint} disabled={loading}>
            {loading ? "Creating..." : "Create Webhook Endpoint"}
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
              {result.success !== false ? "Success" : "Error"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
