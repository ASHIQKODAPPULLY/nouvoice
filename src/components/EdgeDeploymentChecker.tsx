"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EdgeFunctionStatus {
  name: string;
  slug: string;
  status: "healthy" | "error" | "unknown";
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

export default function EdgeDeploymentChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [functionStatuses, setFunctionStatuses] = useState<
    EdgeFunctionStatus[]
  >([]);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const edgeFunctions = [
    {
      name: "Create Checkout Session",
      slug: "supabase-functions-create-checkout-session",
      testPayload: {
        priceId: "price_test_123",
        returnUrl: "https://example.com",
        userId: "test-user",
      },
    },
    {
      name: "Verify Stripe Session",
      slug: "supabase-functions-verify-stripe-session",
      testPayload: {
        session_id: "cs_test_123",
      },
    },
    {
      name: "Create Billing Portal",
      slug: "supabase-functions-create-billing-portal",
      testPayload: {
        customerId: "cus_test_123",
        returnUrl: "https://example.com",
      },
    },
  ];

  const checkEdgeFunctionHealth = async (
    func: (typeof edgeFunctions)[0],
  ): Promise<EdgeFunctionStatus> => {
    const startTime = Date.now();

    try {
      const supabase = createClient();

      console.log(`Checking edge function: ${func.name} (${func.slug})`);

      const { data, error } = await supabase.functions.invoke(func.slug, {
        body: func.testPayload,
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error(`Error in ${func.name}:`, error);
        return {
          name: func.name,
          slug: func.slug,
          status: "error",
          responseTime,
          error: error.message || "Unknown error",
          lastChecked: new Date().toISOString(),
        };
      }

      if (data !== undefined) {
        return {
          name: func.name,
          slug: func.slug,
          status: "healthy",
          responseTime,
          lastChecked: new Date().toISOString(),
        };
      }

      return {
        name: func.name,
        slug: func.slug,
        status: "unknown",
        responseTime,
        error: "No response received",
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`Exception checking ${func.name}:`, error);

      return {
        name: func.name,
        slug: func.slug,
        status: "error",
        responseTime,
        error: error instanceof Error ? error.message : "Unknown exception",
        lastChecked: new Date().toISOString(),
      };
    }
  };

  const checkAllFunctions = async () => {
    setIsChecking(true);
    setFunctionStatuses([]);

    try {
      const results = await Promise.all(
        edgeFunctions.map((func) => checkEdgeFunctionHealth(func)),
      );

      setFunctionStatuses(results);
      setLastCheck(new Date().toLocaleString());
    } catch (error) {
      console.error("Error checking edge functions:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: EdgeFunctionStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "unknown":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: EdgeFunctionStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "unknown":
        return <Badge className="bg-yellow-100 text-yellow-800">Unknown</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Checked</Badge>;
    }
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edge Function Deployment Status</span>
            <Button onClick={checkAllFunctions} disabled={isChecking} size="sm">
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>
          </CardTitle>
          {lastCheck && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastCheck}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {functionStatuses.length === 0 && !isChecking && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Click &quot;Check Status&quot; to verify your edge function
                deployments.
              </AlertDescription>
            </Alert>
          )}

          {isChecking && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Checking edge functions...</span>
            </div>
          )}

          {functionStatuses.length > 0 && (
            <div className="space-y-4">
              {functionStatuses.map((func, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(func.status)}
                      <h3 className="font-medium">{func.name}</h3>
                    </div>
                    {getStatusBadge(func.status)}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Slug:</strong> {func.slug}
                    </p>
                    {func.responseTime && (
                      <p>
                        <strong>Response Time:</strong> {func.responseTime}ms
                      </p>
                    )}
                    <p>
                      <strong>Last Checked:</strong>{" "}
                      {new Date(func.lastChecked).toLocaleString()}
                    </p>
                    {func.error && (
                      <div className="mt-2">
                        <p className="text-red-600">
                          <strong>Error:</strong>
                        </p>
                        <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                          {func.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {functionStatuses.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {
                    functionStatuses.filter((f) => f.status === "healthy")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  {functionStatuses.filter((f) => f.status === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    functionStatuses.filter((f) => f.status === "unknown")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Unknown</div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Run a status check to see deployment health summary
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Verification Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Supabase Dashboard</h4>
            <p className="text-sm text-muted-foreground">
              Visit your Supabase project dashboard → Edge Functions to see
              deployment status and logs.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Function Logs</h4>
            <p className="text-sm text-muted-foreground">
              Check the logs for each function to see recent invocations and any
              errors.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Environment Variables</h4>
            <p className="text-sm text-muted-foreground">
              Verify that all required environment variables (STRIPE_SECRET_KEY,
              PICA_SECRET_KEY, etc.) are set in your Supabase project settings.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. CLI Verification</h4>
            <p className="text-sm text-muted-foreground">
              Use{" "}
              <code className="bg-muted px-1 rounded">
                supabase functions list
              </code>{" "}
              to see all deployed functions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
