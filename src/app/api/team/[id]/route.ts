import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: team, error } = await supabase
    .from("teams")
    .select("*, members:team_members(*)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: mapTeamData(team) });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data: team, error } = await supabase
    .from("teams")
    .update({ name })
    .eq("id", params.id)
    .select("*, members:team_members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team: mapTeamData(team) });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is the owner
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", params.id)
    .single();

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  if (team.owner_id !== session.user.id) {
    return NextResponse.json(
      { error: "Only the team owner can delete the team" },
      { status: 403 },
    );
  }

  const { error } = await supabase.from("teams").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
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
