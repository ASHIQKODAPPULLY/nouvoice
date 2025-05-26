import { createClient } from "@/lib/supabase/client";
import { Team, TeamMember, TeamInvite, ROLE_PERMISSIONS } from "../types/team";
import { v4 as uuidv4 } from "uuid";

export class TeamService {
  /**
   * Create a new team
   */
  static async createTeam(name: string, userId: string): Promise<Team | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("teams")
      .insert({ name, owner_id: userId })
      .select("*, team_members(*)")
      .single();

    if (error) {
      console.error("Error creating team:", error);
      return null;
    }

    return this.mapTeamData(data);
  }

  /**
   * Get teams for a user
   */
  static async getUserTeams(userId: string): Promise<Team[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("team_members")
      .select("team:teams(*, members:team_members(*))")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user teams:", error);
      return [];
    }

    return data.map((item) => this.mapTeamData(item.team));
  }

  /**
   * Get a team by ID
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("teams")
      .select("*, members:team_members(*)")
      .eq("id", teamId)
      .single();

    if (error) {
      console.error("Error fetching team:", error);
      return null;
    }

    return this.mapTeamData(data);
  }

  /**
   * Update a team
   */
  static async updateTeam(teamId: string, name: string): Promise<Team | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("teams")
      .update({ name })
      .eq("id", teamId)
      .select("*, members:team_members(*)")
      .single();

    if (error) {
      console.error("Error updating team:", error);
      return null;
    }

    return this.mapTeamData(data);
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      console.error("Error deleting team:", error);
      return false;
    }

    return true;
  }

  /**
   * Invite a user to a team
   */
  static async inviteToTeam(
    teamId: string,
    email: string,
    role: "admin" | "member" | "viewer",
    invitedBy: string,
  ): Promise<TeamInvite | null> {
    const supabase = createClient();

    // Generate a unique token and set expiry date (48 hours from now)
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { data, error } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: invitedBy,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inviting to team:", error);
      return null;
    }

    return {
      id: data.id,
      teamId: data.team_id,
      email: data.email,
      role: data.role as "admin" | "member" | "viewer",
      invitedBy: data.invited_by,
      token: data.token,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  }

  /**
   * Accept a team invitation
   */
  static async acceptInvite(token: string, userId: string): Promise<boolean> {
    const supabase = createClient();

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from("team_invites")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      console.error("Error fetching invite:", inviteError);
      return false;
    }

    // Check if invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      console.error("Invite has expired");
      return false;
    }

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return false;
    }

    // Check if invite email matches user email
    if (userData.email.toLowerCase() !== invite.email.toLowerCase()) {
      console.error("Invite email does not match user email");
      return false;
    }

    // Begin transaction
    const { error: transactionError } = await supabase.rpc(
      "accept_team_invite",
      {
        p_token: token,
        p_user_id: userId,
        p_team_id: invite.team_id,
        p_role: invite.role,
      },
    );

    if (transactionError) {
      console.error("Error accepting invite:", transactionError);
      return false;
    }

    return true;
  }

  /**
   * Update a team member's role
   */
  static async updateMemberRole(
    teamId: string,
    userId: string,
    role: "admin" | "member" | "viewer",
  ): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating member role:", error);
      return false;
    }

    return true;
  }

  /**
   * Remove a member from a team
   */
  static async removeMember(teamId: string, userId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing team member:", error);
      return false;
    }

    return true;
  }

  /**
   * Check if a user has a specific permission for a team
   */
  static async checkPermission(
    teamId: string,
    userId: string,
    permission: keyof typeof ROLE_PERMISSIONS.owner,
  ): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Error checking permission:", error);
      return false;
    }

    const role = data.role as keyof typeof ROLE_PERMISSIONS;
    return ROLE_PERMISSIONS[role][permission];
  }

  /**
   * Map database team data to Team interface
   */
  private static mapTeamData(data: any): Team {
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
        role: member.role as "owner" | "admin" | "member" | "viewer",
        email: member.email || "",
        name: member.name || "",
        inviteAccepted: member.invite_accepted,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      })),
    };
  }
}
