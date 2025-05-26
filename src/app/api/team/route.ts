import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: teams, error } = await supabase
      .from("team_members")
      .select("team:teams(*, members:team_members(*))")
      .eq("user_id", session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      teams: teams.map((item) => mapTeamData(item.team)),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name, owner_id: session.user.id })
      .select()
      .single();

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 });
    }

    // Add the owner as a team member
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: team.id,
      user_id: session.user.id,
      role: "owner",
      invite_accepted: true,
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Get the full team with members
    const { data: fullTeam, error: fullTeamError } = await supabase
      .from("teams")
      .select("*, members:team_members(*)")
      .eq("id", team.id)
      .single();

    if (fullTeamError) {
      return NextResponse.json(
        { error: fullTeamError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ team: mapTeamData(fullTeam) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to map database team data to Team interface
function mapTeamData(data: any) {
  return {
    id: data.id,
    name: data.name,
    ownerId: data.owner_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    members: (data.members || []).map((member: any) => ({
      id: member.id,
      userId: member.user_id,
      teamId: member.team_id,
      role: member.role,
      email: member.email || "",
      name: member.name || "",
      inviteAccepted: member.invite_accepted,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    })),
  };
}
