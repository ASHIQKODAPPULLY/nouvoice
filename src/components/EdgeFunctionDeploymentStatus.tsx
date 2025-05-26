"use client";

import { useState, useEffect } from "react";
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
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function EdgeFunctionDeploymentStatus() {
  const [status, setStatus] = useState<
    "checking" | "deployed" | "pending" | "error"
  >("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkDeploymentStatus = async () => {
    setIsChecking(true);
    try {
      // Make a simple request to the edge function to check if it's deployed
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

      // If we get any response (even an error), the function is deployed
      setStatus(response.ok || data ? "deployed" : "pending");
    } catch (error) {
      // If we get a network error, the function might not be deployed yet
      console.error("Error checking deployment status:", error);
      setStatus("pending");
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkDeploymentStatus();

    // Set up polling to check status every 10 seconds
    const interval = setInterval(() => {
      if (status !== "deployed") {
        checkDeploymentStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Edge Function Deployment Status</CardTitle>
        <CardDescription>
          Check if your Stripe payment intent edge function is fully deployed
          and ready to use
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "checking" || isChecking ? (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <AlertTitle>Checking deployment status...</AlertTitle>
            <AlertDescription>
              We're verifying if the edge function is fully deployed and ready
              to use.
            </AlertDescription>
          </Alert>
        ) : status === "deployed" ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Edge Function Deployed</AlertTitle>
            <AlertDescription>
              The edge function is fully deployed and ready to process payment
              intents. You can now use the payment intent creation
              functionality.
            </AlertDescription>
          </Alert>
        ) : status === "pending" ? (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Deployment In Progress</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                The edge function is still being deployed. This process
                typically takes 1-2 minutes, but can sometimes take up to 5
                minutes.
              </p>
              <p>
                Please wait for the deployment to complete before attempting to
                create payment intents.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Deployment Error</AlertTitle>
            <AlertDescription>
              There was an error checking the deployment status. Please try
              again or contact support.
            </AlertDescription>
          </Alert>
        )}

        {lastChecked && (
          <p className="text-sm text-muted-foreground mt-4">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={checkDeploymentStatus}
          disabled={isChecking}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Check Again
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
