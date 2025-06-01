"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, Users } from "lucide-react";
import { isBrowser } from "@/lib/environment";
import Link from "next/link";

// Explicitly mark as client-side only to prevent prerendering issues
export const dynamic = "force-dynamic";

function JoinTeamContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      if (!isBrowser) return; // Only run in browser

      // Import dynamically to avoid SSR issues
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);

        // If we have a teamId, fetch team details
        if (teamId) {
          try {
            const { data, error } = await supabase
              .from("teams")
              .select("name")
              .eq("id", teamId)
              .single();

            if (data) {
              setTeamName(data.name);
            } else if (error) {
              setError("Team not found. The invitation may have expired.");
            }
          } catch (err) {
            console.error("Error fetching team:", err);
            setError("Failed to load team information.");
          }
        } else if (!token) {
          setError("Invalid invitation link. Missing team information.");
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [teamId, token]);

  const handleJoinTeam = async () => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = "/api/team/invite/accept";
      let body: any = {};

      if (token) {
        // Token-based invitation
        body = { token };
      } else if (teamId) {
        // Simple team ID invitation
        body = { teamId };
      } else {
        throw new Error("Invalid invitation");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresUpgrade) {
          setRequiresUpgrade(true);
          throw new Error(
            data.error ||
              "This team has reached its member limit. The team owner needs to upgrade the subscription.",
          );
        } else {
          throw new Error(data.error || "Failed to join team");
        }
      }

      setSuccess("You have successfully joined the team!");

      // Redirect to team page after a short delay
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/team";
        }
      }, 2000);
    } catch (error) {
      console.error("Error joining team:", error);
      setError(error instanceof Error ? error.message : "Failed to join team");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Team
            </CardTitle>
            {teamName && (
              <CardDescription>
                You've been invited to join {teamName}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!isAuthenticated ? (
              <p className="mb-4">You need to sign in to join this team.</p>
            ) : requiresUpgrade ? (
              <p className="mb-4">
                This team has reached its member limit. The team owner needs to
                upgrade their subscription plan to add more members.
              </p>
            ) : (
              <p className="mb-4">
                Click the button below to join this team and start
                collaborating.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex gap-2 w-full">
              {!isAuthenticated ? (
                <Button className="w-full" onClick={handleJoinTeam}>
                  Sign In to Join
                </Button>
              ) : requiresUpgrade ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/";
                    }
                  }}
                >
                  Return to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-1/2"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = "/";
                      }
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-1/2"
                    onClick={handleJoinTeam}
                    disabled={isLoading || !!success}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Team"
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Wrap the client component in a parent component with Suspense
export default function JoinTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Loading team information...</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <JoinTeamContent />
    </Suspense>
  );
}
