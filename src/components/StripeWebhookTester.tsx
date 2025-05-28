"use client";

import { useState } from "react";
// Using native button element instead of Button component to isolate potential issues
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
import { AlertCircle, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type WebhookEvent = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export default function StripeWebhookTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([
    {
      id: "payment_intent.succeeded",
      name: "Payment Intent Succeeded",
      description: "Triggered when a payment intent succeeds",
      enabled: true,
    },
    {
      id: "payment_intent.payment_failed",
      name: "Payment Intent Failed",
      description: "Triggered when a payment intent fails",
      enabled: true,
    },
    {
      id: "customer.subscription.created",
      name: "Subscription Created",
      description: "Triggered when a subscription is created",
      enabled: false,
    },
    {
      id: "customer.subscription.updated",
      name: "Subscription Updated",
      description: "Triggered when a subscription is updated",
      enabled: false,
    },
    {
      id: "customer.subscription.deleted",
      name: "Subscription Deleted",
      description: "Triggered when a subscription is canceled",
      enabled: false,
    },
  ]);

  const toggleEventEnabled = (eventId: string) => {
    setWebhookEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, enabled: !event.enabled } : event,
      ),
    );
  };

  const createWebhook = async () => {
    if (!webhookUrl) {
      setError("Please enter a webhook URL");
      return;
    }

    const enabledEvents = webhookEvents
      .filter((event) => event.enabled)
      .map((event) => event.id);

    if (enabledEvents.length === 0) {
      setError("Please select at least one webhook event");
      return;
    }

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
          url: webhookUrl,
          events: enabledEvents,
          secret: webhookSecret || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create webhook");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating webhook");
      console.error("Error creating webhook:", err);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      setError("Please enter a webhook URL");
      return;
    }

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
          action: "test_webhook",
          url: webhookUrl,
          secret: webhookSecret || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to test webhook");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while testing webhook");
      console.error("Error testing webhook:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Webhook Management</CardTitle>
          <CardDescription>
            Create and test Stripe webhooks for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-domain.com/api/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
            <Input
              id="webhookSecret"
              type="password"
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Webhook Events</Label>
            <div className="space-y-2">
              {webhookEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-2 border p-2 rounded"
                >
                  <Checkbox
                    id={event.id}
                    checked={event.enabled}
                    onCheckedChange={() => toggleEventEnabled(event.id)}
                  />
                  <div>
                    <Label
                      htmlFor={event.id}
                      className="font-medium cursor-pointer"
                    >
                      {event.name}
                    </Label>
                    <p className="text-xs text-gray-500">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <button
            onClick={createWebhook}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md w-full sm:w-auto"
            type="button"
          >
            {loading && (
              <RefreshCw className="h-4 w-4 mr-2 inline animate-spin" />
            )}
            {loading ? "Creating..." : "Create Webhook"}
          </button>
          <button
            onClick={testWebhook}
            disabled={loading}
            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md w-full sm:w-auto"
            type="button"
          >
            {loading && (
              <RefreshCw className="h-4 w-4 mr-2 inline animate-spin" />
            )}
            {loading ? "Testing..." : "Test Webhook"}
          </button>
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
