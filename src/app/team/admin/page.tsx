"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  Users,
  AlertCircle,
  X,
  Check,
  Copy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Team } from "@/lib/types/team";

export default function TeamAdminPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserId(session.user.id);

        // Check if user has a premium subscription
        try {
          const { data, error } = await supabase
            .from("subscriptions")
            .select("status, price_id")
            .eq("user_id", session.user.id)
            .single();

          if (
            data &&
            (data.status === "active" || data.status === "trialing")
          ) {
            // Check if the subscription is Pro or Team plan
            const isPro = data.price_id === "price_1YOUR_ACTUAL_PRICE_ID";
            const isTeam = data.price_id === "price_TEAM_PRICE_ID";

            setIsPremium(isPro || isTeam);

            // Load teams
            if (isPro || isTeam) {
              const response = await fetch("/api/team");
              const data = await response.json();
              setTeams(data.teams || []);

              if (data.teams && data.teams.length > 0) {
                setCurrentTeam(data.teams[0]);
                generateInviteLink(data.teams[0].id);
                checkTeamSubscription(data.teams[0].id);
              }
            }
          } else {
            setIsPremium(false);
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
          setIsPremium(false);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const checkTeamSubscription = async (teamId: string) => {
    try {
      const response = await fetch(`/api/team/subscription?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptionTier(data.subscription_tier || "free");
      }
    } catch (error) {
      console.error("Error checking team subscription:", error);
    }
  };

  const generateInviteLink = (teamId: string) => {
    const baseUrl = window.location.origin;
    setInviteLink(`${baseUrl}/team/join?teamId=${teamId}`);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSuccess("Link copied to clipboard!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailList.includes(emailInput)) {
      setError("This email is already in the list");
      return;
    }

    setEmailList([...emailList, emailInput]);
    setEmailInput("");
    setError(null);
  };

  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email));
  };

  const handleSendInvites = async () => {
    if (!currentTeam) {
      setError("No team selected");
      return;
    }

    if (emailList.length === 0) {
      setError("Please add at least one email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/team/simple-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: emailList,
          teamId: currentTeam.id,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresUpgrade) {
          setError(
            "You've reached the member limit for your current plan. Please upgrade to add more team members.",
          );
        } else {
          throw new Error(data.error || "Failed to send invitations");
        }
        return;
      }

      setSuccess("Invitations sent successfully!");
      setEmailList([]);

      // Refresh team data
      const teamResponse = await fetch(`/api/team/${currentTeam.id}`);
      const teamData = await teamResponse.json();
      if (teamData.team) {
        setCurrentTeam(teamData.team);
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send invitations",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTeam = async (teamId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/team/${teamId}`);
      const data = await response.json();
      if (data.team) {
        setCurrentTeam(data.team);
        generateInviteLink(data.team.id);
        checkTeamSubscription(data.team.id);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionLimits = () => {
    switch (subscriptionTier) {
      case "free":
        return {
          maxMembers: 1,
          label: "Free",
          color: "bg-gray-100 text-gray-800",
        };
      case "pro":
        return {
          maxMembers: 3,
          label: "Pro",
          color: "bg-purple-100 text-purple-800",
        };
      case "team":
        return {
          maxMembers: Infinity,
          label: "Team",
          color: "bg-blue-100 text-blue-800",
        };
      case "enterprise":
        return {
          maxMembers: Infinity,
          label: "Enterprise",
          color: "bg-green-100 text-green-800",
        };
      default:
        return {
          maxMembers: 1,
          label: "Free",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to sign in to access team management features.
            </p>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Premium Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Team management is a premium feature. Upgrade to access team
              collaboration tools.
            </p>
            <Button asChild>
              <a href="/pricing">View Pricing</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subscriptionInfo = getSubscriptionLimits();
  const currentMemberCount = currentTeam?.members.length || 0;
  const canAddMoreMembers = currentMemberCount < subscriptionInfo.maxMembers;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Team Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Easily manage your team members and invitations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/team">Team Management</a>
            </Button>
            <Button asChild>
              <a href="/">Back to Dashboard</a>
            </Button>
          </div>
        </div>

        {teams.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Teams Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You don't have any teams yet. Create your first team to get
                started.
              </p>
              <Button asChild>
                <a href="/team">Create Team</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Team Selection and Invite Link */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select
                      value={currentTeam?.id}
                      onValueChange={(value) => handleSelectTeam(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {currentTeam && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Subscription</span>
                        <Badge className={subscriptionInfo.color}>
                          {subscriptionInfo.label}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Team members:</span>
                          <span className="font-medium">
                            {currentMemberCount} /{" "}
                            {subscriptionInfo.maxMembers === Infinity
                              ? "∞"
                              : subscriptionInfo.maxMembers}
                          </span>
                        </div>
                        {!canAddMoreMembers && subscriptionTier !== "team" && (
                          <div className="mt-4">
                            <Button size="sm" className="w-full" asChild>
                              <a href="/pricing">Upgrade Plan</a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Invite Link</CardTitle>
                      <CardDescription>
                        Share this link with people you want to invite to your
                        team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Input
                          value={inviteLink}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={copyInviteLink}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Bulk Invite Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Invite Team Members
                  </CardTitle>
                  <CardDescription>
                    Add multiple email addresses to invite people to your team
                  </CardDescription>
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

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                      <Input
                        placeholder="colleague@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                        disabled={!canAddMoreMembers}
                      />
                      <Button
                        onClick={handleAddEmail}
                        disabled={!canAddMoreMembers}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>

                    {!canAddMoreMembers && (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You've reached the member limit for your current plan.
                          <a href="/pricing" className="underline ml-1">
                            Upgrade to add more members.
                          </a>
                        </AlertDescription>
                      </Alert>
                    )}

                    {emailList.length > 0 && (
                      <div className="border rounded-md p-2">
                        <div className="flex flex-wrap gap-2">
                          {emailList.map((email) => (
                            <Badge
                              key={email}
                              variant="secondary"
                              className="flex items-center gap-1 py-1.5 pl-2 pr-1"
                            >
                              {email}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 rounded-full hover:bg-muted"
                                onClick={() => handleRemoveEmail(email)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="role">Role for new members</Label>
                      <Select
                        value={role}
                        onValueChange={(value) =>
                          setRole(value as "admin" | "member" | "viewer")
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role === "admin" &&
                          "Can manage team members and all invoices"}
                        {role === "member" && "Can create and edit invoices"}
                        {role === "viewer" && "Can only view invoices"}
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleSendInvites}
                        disabled={
                          isLoading ||
                          emailList.length === 0 ||
                          !canAddMoreMembers
                        }
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Invitations...
                          </>
                        ) : (
                          <>Send Invitations ({emailList.length})</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Team Members */}
              {currentTeam && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Current Team Members</CardTitle>
                    <CardDescription>
                      {currentTeam.members.length} member
                      {currentTeam.members.length !== 1 ? "s" : ""} in{" "}
                      {currentTeam.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name/Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTeam.members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {member.name || "(No name)"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {member.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    member.role === "owner"
                                      ? "bg-purple-100 text-purple-800"
                                      : member.role === "admin"
                                        ? "bg-blue-100 text-blue-800"
                                        : member.role === "member"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {member.role.charAt(0).toUpperCase() +
                                    member.role.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {member.inviteAccepted ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
