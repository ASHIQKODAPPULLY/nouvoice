import {
  Team,
  TeamMember,
  TeamInvite,
  TeamPermission,
  ROLE_PERMISSIONS,
} from "../types/team";

// Model: Represents the team data structure and business logic
export class TeamModel {
  private teams: Team[] = [];
  private currentTeam: Team | null = null;
  private currentUserRole: TeamMember["role"] | null = null;
  private currentUserId: string | null = null;

  constructor() {}

  setTeams(teams: Team[]): void {
    this.teams = teams;
  }

  getTeams(): Team[] {
    return this.teams;
  }

  setCurrentTeam(team: Team | null): void {
    this.currentTeam = team;

    // Update current user role if we have a user ID
    if (team && this.currentUserId) {
      const member = team.members.find((m) => m.userId === this.currentUserId);
      this.currentUserRole = member?.role || null;
    } else {
      this.currentUserRole = null;
    }
  }

  getCurrentTeam(): Team | null {
    return this.currentTeam;
  }

  setCurrentUserId(userId: string | null): void {
    this.currentUserId = userId;

    // Update current user role if we have a team
    if (userId && this.currentTeam) {
      const member = this.currentTeam.members.find((m) => m.userId === userId);
      this.currentUserRole = member?.role || null;
    } else {
      this.currentUserRole = null;
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  getCurrentUserRole(): TeamMember["role"] | null {
    return this.currentUserRole;
  }

  // Check if the current user has a specific permission
  hasPermission(permission: keyof TeamPermission): boolean {
    if (!this.currentUserRole) return false;
    return ROLE_PERMISSIONS[this.currentUserRole][permission];
  }

  // Add a new team to the list
  addTeam(team: Team): void {
    this.teams = [...this.teams, team];
  }

  // Update an existing team
  updateTeam(updatedTeam: Team): void {
    this.teams = this.teams.map((team) =>
      team.id === updatedTeam.id ? updatedTeam : team,
    );

    // Update current team if it's the one being updated
    if (this.currentTeam?.id === updatedTeam.id) {
      this.setCurrentTeam(updatedTeam);
    }
  }

  // Remove a team from the list
  removeTeam(teamId: string): void {
    this.teams = this.teams.filter((team) => team.id !== teamId);

    // Clear current team if it's the one being removed
    if (this.currentTeam?.id === teamId) {
      this.setCurrentTeam(null);
    }
  }

  // Add a member to the current team
  addMember(member: TeamMember): void {
    if (!this.currentTeam) return;

    const updatedTeam = {
      ...this.currentTeam,
      members: [...this.currentTeam.members, member],
    };

    this.updateTeam(updatedTeam);
  }

  // Update a member in the current team
  updateMember(updatedMember: TeamMember): void {
    if (!this.currentTeam) return;

    const updatedTeam = {
      ...this.currentTeam,
      members: this.currentTeam.members.map((member) =>
        member.id === updatedMember.id ? updatedMember : member,
      ),
    };

    this.updateTeam(updatedTeam);
  }

  // Remove a member from the current team
  removeMember(memberId: string): void {
    if (!this.currentTeam) return;

    const updatedTeam = {
      ...this.currentTeam,
      members: this.currentTeam.members.filter(
        (member) => member.id !== memberId,
      ),
    };

    this.updateTeam(updatedTeam);
  }
}
