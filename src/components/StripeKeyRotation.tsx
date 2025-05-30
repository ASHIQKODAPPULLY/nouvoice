"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type KeyStatus = {
  keyType: string;
  lastFourChars: string;
  lastRotated?: string;
  isValid: boolean;
  error?: string;
};

export default function StripeKeyRotation() {
  const [loading, setLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [newSecretKey, setNewSecretKey] = useState("");
  const [rotatingKey, setRotatingKey] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeyStatus = async () => {
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

      // Extract key information
      if (data.success) {
        setKeyStatus({
          keyType: data.keyType || "Secret Key",
          lastFourChars: "****", // For security, we don't show actual key parts
          lastRotated: new Date().toLocaleDateString(),
          isValid: true,
        });

        // If we have a payment intent, verify it
        if (data.data?.paymentIntentId && data.data?.clientSecret) {
          await verifyPaymentIntent(
            data.data.paymentIntentId,
            data.data.clientSecret,
          );
        }
      } else {
        setKeyStatus({
          keyType: data.keyType || "Secret Key",
          lastFourChars: "****",
          isValid: false,
          error: data.error || "Invalid key",
        });
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while testing API keys");
      console.error("Error testing API keys:", err);
      setKeyStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentIntent = async (
    paymentIntentId: string,
    clientSecret: string,
  ) => {
    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verifyPaymentIntent",
          paymentIntentId,
          clientSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment intent");
      }

      // Update result with verification data
      setResult((prevResult) => ({
        ...prevResult,
        verificationData: data,
      }));

      return data;
    } catch (err: any) {
      console.error("Error verifying payment intent:", err);
      return null;
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

      // Update key status after rotation
      if (data.success) {
        setKeyStatus({
          keyType: "Secret Key (Updated)",
          lastFourChars: newSecretKey.slice(-4),
          lastRotated: new Date().toLocaleDateString(),
          isValid: true,
        });
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while rotating the Stripe key",
      );
      console.error("Error rotating Stripe key:", err);
    } finally {
      setRotatingKey(false);
    }
  };

  // In storyboard mode, don't automatically fetch key status
  useEffect(() => {
    // Check if we're in a storyboard environment
    const isStoryboard =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/tempobook/storyboards/");

    if (!isStoryboard) {
      fetchKeyStatus();
    } else {
      // Set mock data for storyboard preview
      setKeyStatus({
        keyType: "Secret Key",
        lastFourChars: "****",
        lastRotated: new Date().toLocaleDateString(),
        isValid: true,
      });
    }
  }, []);

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Key Status</CardTitle>
          <CardDescription>
            Current status of your Stripe API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <p>Checking key status...</p>
            </div>
          ) : keyStatus ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {keyStatus.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {keyStatus.keyType}: {keyStatus.isValid ? "Valid" : "Invalid"}
                </span>
              </div>
              {keyStatus.lastRotated && (
                <p className="text-sm text-gray-500">
                  Last rotated: {keyStatus.lastRotated}
                </p>
              )}
              {keyStatus.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{keyStatus.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <p>No key status available</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            onClick={fetchKeyStatus}
            disabled={loading}
            aria-busy={loading}
            variant="outline"
            className="mr-2"
            aria-label="Refresh status"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh Status
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rotate Stripe Secret Key</CardTitle>
          <CardDescription>
            Update your Stripe Secret Key securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Only administrators can perform this action. Make sure you have
              already created a new key in the Stripe Dashboard.
            </AlertDescription>
          </Alert>
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
            type="button"
            onClick={rotateStripeKey}
            disabled={rotatingKey || !newSecretKey}
            aria-busy={rotatingKey}
            aria-label="Update Stripe secret key"
            className="w-full"
          >
            {rotatingKey ? "Updating..." : "Update Stripe Secret Key"}
          </Button>
        </CardFooter>
      </Card>

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
