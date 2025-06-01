"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import TeamManagement from "@/components/TeamManagement";
import { createClient } from "@/lib/supabase/client";

export default function TeamPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("User authenticated:", session.user.id);
          setUserId(session.user.id);

          // For demonstration purposes, we'll set premium to true
          // In a real app, you would check subscription status
          setIsPremium(true);
        } else {
          console.log("No authenticated user");
          // For demo purposes, set a mock user ID to bypass authentication
          setUserId("demo-user-id");
          setIsPremium(true);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // For demo purposes, set a mock user ID to bypass authentication
        setUserId("demo-user-id");
        setIsPremium(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage teams to collaborate on invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/team/admin">Simple Admin</a>
            </Button>
            <Button asChild>
              <a href="/">Back to Dashboard</a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4 mt-6">
            <TeamManagement userId={userId} isPremium={isPremium} />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You don't have any pending invitations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
