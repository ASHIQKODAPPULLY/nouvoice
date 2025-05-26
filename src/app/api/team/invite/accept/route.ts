import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, teamId } = await request.json();

  // Handle token-based invitation
  if (token) {
    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if invite email matches user email
    if (userData.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 403 },
      );
    }

    // Check subscription limits before accepting
    const { data: subscription } = await supabase
      .from("team_subscriptions")
      .select("subscription_tier, status")
      .eq("team_id", invite.team_id)
      .single();

    // If subscription exists and is active, check member limits
    if (subscription && subscription.status === "active") {
      const { count: memberCount } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", invite.team_id);

      // Free tier: max 1 member (just the owner)
      // Pro tier: max 3 members total
      if (
        (subscription.subscription_tier === "free" && memberCount >= 1) ||
        (subscription.subscription_tier === "pro" && memberCount >= 3)
      ) {
        return NextResponse.json(
          {
            error:
              "This team has reached its member limit. The team owner needs to upgrade the subscription.",
            requiresUpgrade: true,
          },
          { status: 403 },
        );
      }
    }

    // Call the stored procedure to accept the invite
    const { error: acceptError } = await supabase.rpc("accept_team_invite", {
      p_token: token,
      p_user_id: session.user.id,
      p_team_id: invite.team_id,
      p_role: invite.role,
    });

    if (acceptError) {
      return NextResponse.json({ error: acceptError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }
  // Handle direct team ID invitation (simple link)
  else if (teamId) {
    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is already a member of the team
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", session.user.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 },
      );
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from("team_subscriptions")
      .select("subscription_tier, status")
      .eq("team_id", teamId)
      .single();

    if (subscription && subscription.status === "active") {
      const { count: memberCount } = await supabase
        .from("team_members")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId);

      if (
        (subscription.subscription_tier === "free" && memberCount >= 1) ||
        (subscription.subscription_tier === "pro" && memberCount >= 3)
      ) {
        return NextResponse.json(
          {
            error:
              "This team has reached its member limit. The team owner needs to upgrade the subscription.",
            requiresUpgrade: true,
          },
          { status: 403 },
        );
      }
    }

    // Add user to team as a member
    const { error: addError } = await supabase.from("team_members").insert({
      team_id: teamId,
      user_id: session.user.id,
      role: "member", // Default role for direct link invites
      invite_accepted: true,
    });

    if (addError) {
      return NextResponse.json(
        { error: "Failed to join team" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { error: "Missing token or teamId" },
      { status: 400 },
    );
  }
}
