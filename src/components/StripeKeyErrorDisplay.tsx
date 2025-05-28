"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StripeKeyErrorDisplay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const showExampleError = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "showExpiredKeyError",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
      } else {
        setError(data);
      }
    } catch (err: any) {
      setError({
        error: err.message || "An unexpected error occurred",
        details: {
          errorType: "Client Error",
          suggestion: "Check your network connection and try again",
          details: err.toString(),
        },
      });
      console.error("Error showing example error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Stripe API Error Examples</CardTitle>
          <CardDescription>
            View examples of common Stripe API errors and how to resolve them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Click the button below to see an example of a Stripe API error
              response. This can help you understand how to handle errors in
              your application.
            </p>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error.error}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    <strong>Error Type:</strong>{" "}
                    {error.details?.errorType || "Unknown Error"}
                  </p>
                  <p>
                    <strong>Suggestion:</strong>{" "}
                    {error.details?.suggestion || "No suggestion available"}
                  </p>
                  {error.details?.details?.error?.doc_url && (
                    <p>
                      <a
                        href={error.details.details.error.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        View Documentation
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  )}
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                    {JSON.stringify(error.details?.details || {}, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={showExampleError}
            disabled={loading}
          >
            {loading ? "Loading..." : "Show Example Error"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
