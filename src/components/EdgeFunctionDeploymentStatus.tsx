"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function EdgeFunctionDeploymentStatus() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    deployed: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDeploymentStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test-stripe-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "checkConnectivity",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check deployment status");
      }

      setStatus({
        deployed: data.success,
        message: data.message || "Status check completed",
        details: data.details,
      });
    } catch (err: any) {
      setError(
        err.message || "An error occurred while checking deployment status",
      );
      console.error("Error checking deployment status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if we're in a storyboard environment
  useEffect(() => {
    const isStoryboard =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/tempobook/storyboards/");

    if (!isStoryboard) {
      checkDeploymentStatus();
    } else {
      // Set mock data for storyboard preview
      setStatus({
        deployed: true,
        message: "Edge function is deployed and operational",
      });
    }
  }, []);

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold">Edge Function Deployment Status</h2>

      {loading ? (
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <p>Checking deployment status...</p>
        </div>
      ) : status ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {status.deployed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`font-medium ${status.deployed ? "text-green-600" : "text-red-600"}`}
            >
              {status.deployed
                ? "Edge function is deployed and operational"
                : "Edge function is not deployed or not responding"}
            </span>
          </div>
          <p className="text-sm text-gray-500">{status.message}</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <p>No deployment status available</p>
      )}

      <Button
        variant="outline"
        onClick={checkDeploymentStatus}
        disabled={loading}
        className="text-sm"
      >
        {loading ? (
          <>
            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3 mr-2" />
            Check Deployment Status
          </>
        )}
      </Button>
    </div>
  );
}
