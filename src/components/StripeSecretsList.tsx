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
import { AlertCircle, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

type StripeSecret = {
  id: string;
  object: string;
  created: number;
  expires_at: number | null;
  livemode: boolean;
  name: string;
  scope: {
    type: string;
    user?: string;
  };
};

type StripeSecretsResponse = {
  object: string;
  url: string;
  has_more: boolean;
  data: StripeSecret[];
};

export default function StripeSecretsList() {
  const [loading, setLoading] = useState(false);
  const [secrets, setSecrets] = useState<StripeSecret[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [startingAfter, setStartingAfter] = useState<string | null>(null);

  const fetchSecrets = async (startAfter?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe-secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scopeType: "account",
          limit: 10,
          startingAfter: startAfter || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Stripe secrets");
      }

      if (data.success && data.data) {
        const secretsData = data.data as StripeSecretsResponse;
        setSecrets((prevSecrets) =>
          startAfter ? [...prevSecrets, ...secretsData.data] : secretsData.data,
        );
        setHasMore(secretsData.has_more);

        if (secretsData.data.length > 0) {
          setStartingAfter(secretsData.data[secretsData.data.length - 1].id);
        }
      } else {
        throw new Error(data.error || "Failed to fetch Stripe secrets");
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching Stripe secrets",
      );
      console.error("Error fetching Stripe secrets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSecrets([]);
    setStartingAfter(null);
    fetchSecrets();
  };

  const loadMore = () => {
    if (startingAfter) {
      fetchSecrets(startingAfter);
    }
  };

  useEffect(() => {
    // Check if we're in a storyboard environment
    const isStoryboard = window.location.pathname.includes(
      "/tempobook/storyboards/",
    );

    if (!isStoryboard) {
      fetchSecrets();
    } else {
      // Set mock data for storyboard preview
      setSecrets([
        {
          id: "appsecret_5110hHS1707T6fjBnah1LkdIwHu7ix",
          object: "apps.secret",
          created: 1680209063,
          expires_at: null,
          livemode: false,
          name: "my-api-key",
          scope: {
            type: "account",
          },
        },
        {
          id: "appsecret_5110hHS1707T6fjBnah1LkdIwHu8iy",
          object: "apps.secret",
          created: 1680209064,
          expires_at: 1780209064,
          livemode: true,
          name: "production-key",
          scope: {
            type: "account",
          },
        },
      ]);
    }
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
      <Card>
        <CardHeader>
          <CardTitle>Stripe API Secrets</CardTitle>
          <CardDescription>List of your Stripe API secrets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && secrets.length === 0 ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <p>Loading secrets...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : secrets.length > 0 ? (
            <div className="space-y-4">
              {secrets.map((secret) => (
                <Card key={secret.id} className="bg-gray-50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4" />
                        <CardTitle className="text-base">
                          {secret.name}
                        </CardTitle>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${secret.livemode ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                      >
                        {secret.livemode ? "Live" : "Test"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500">ID</p>
                        <p className="font-mono text-xs truncate">
                          {secret.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p>{formatDate(secret.created)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p>
                          {secret.expires_at
                            ? formatDate(secret.expires_at)
                            : "Never"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Scope</p>
                        <p className="capitalize">{secret.scope.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="text-sm"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p>No API secrets found</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
