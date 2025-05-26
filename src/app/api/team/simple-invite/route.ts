import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emails, teamId, role = "member" } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Invalid emails provided" },
        { status: 400 },
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    // Check if user is team owner or admin
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, owner_id, members:team_members(user_id, role)")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isOwner = team.owner_id === session.user.id;
    const isAdmin = team.members.some(
      (m) => m.user_id === session.user.id && m.role === "admin",
    );

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error: "You do not have permission to invite members to this team",
        },
        { status: 403 },
      );
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from("team_subscriptions")
      .select("subscription_tier, status")
      .eq("team_id", teamId)
      .single();

    // If no subscription record exists, create a free tier one
    if (!subscription) {
      await supabase.from("team_subscriptions").insert({
        team_id: teamId,
        subscription_tier: "free",
        status: "active",
      });
    }

    // Check member count limit for free/pro tiers
    if (subscription && subscription.status === "active") {
      const { count: memberCount } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId);

      // Free tier: max 1 member (just the owner)
      // Pro tier: max 3 members total
      if (
        (subscription.subscription_tier === "free" && memberCount >= 1) ||
        (subscription.subscription_tier === "pro" && memberCount >= 3)
      ) {
        return NextResponse.json(
          {
            error:
              "Member limit reached for your subscription tier. Please upgrade your plan.",
            requiresUpgrade: true,
          },
          { status: 403 },
        );
      }
    }

    // Process each email using the Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/team-management`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: "inviteMembers",
          data: {
            teamId,
            emails,
            role,
            invitedBy: session.user.id,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to process invitations" },
        { status: 500 },
      );
    }

    const result = await response.json();
    return NextResponse.json({ results: result });
  } catch (error) {
    console.error("Error inviting team members:", error);
    return NextResponse.json(
      { error: "Failed to process invitations" },
      { status: 500 },
    );
  }
}
