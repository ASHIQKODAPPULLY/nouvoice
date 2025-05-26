"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function StripeKeyErrorDisplay() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testActions = [
    { name: "Validate Keys", action: "validateKeys" },
    { name: "Create Payment Intent", action: "createPaymentIntent" },
    { name: "Check Connectivity", action: "checkConnectivity" },
    { name: "Show Expired Key Error", action: "showExpiredKeyError" },
  ];

  const runTest = async (action: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Stripe API Key Error Diagnostics</CardTitle>
        <CardDescription>
          Test your Stripe API keys and see detailed error information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-6">
          {testActions.map((test) => (
            <Button
              key={test.action}
              onClick={() => runTest(test.action)}
              disabled={loading}
              variant={
                test.action === "showExpiredKeyError" ? "outline" : "default"
              }
            >
              {test.name}
            </Button>
          ))}
        </div>

        {loading && <div className="text-center py-4">Testing API keys...</div>}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={result.success ? "text-green-500" : "text-red-500"}
              >
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <h3 className="text-lg font-medium">
                {result.success ? "Success" : "Error"}
              </h3>
            </div>

            {result.message && <p className="mb-2">{result.message}</p>}

            {result.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>API Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            {result.details && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Error Details:</h4>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-sm">
                  {typeof result.details === "string"
                    ? result.details
                    : formatJson(result.details)}
                </pre>
              </div>
            )}

            {result.data && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Response Data:</h4>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-sm">
                  {formatJson(result.data)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Check the console for additional debugging information
        </p>
      </CardFooter>
    </Card>
  );
}
