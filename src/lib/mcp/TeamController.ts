import { TeamModel } from "./TeamModel";
import { TeamPresenter } from "./TeamPresenter";
// import { TeamService } from "../team/teamService";

// Temporary client-side service implementation
const TeamService = {
  async getUserTeams(userId: string) {
    const response = await fetch("/api/team");
    const data = await response.json();
    return data.teams || [];
  },

  async getTeam(teamId: string) {
    const response = await fetch(`/api/team/${teamId}`);
    const data = await response.json();
    return data.team || null;
  },

  async createTeam(name: string, userId: string) {
    const response = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.team || null;
  },

  async updateTeam(teamId: string, name: string) {
    const response = await fetch(`/api/team/${teamId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    return data.team || null;
  },

  async deleteTeam(teamId: string) {
    const response = await fetch(`/api/team/${teamId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success || false;
  },

  async inviteToTeam(
    teamId: string,
    email: string,
    role: string,
    invitedBy: string,
  ) {
    const response = await fetch("/api/team/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, email, role }),
    });
    const data = await response.json();
    return data.invite || null;
  },

  async updateMemberRole(teamId: string, userId: string, role: string) {
    const response = await fetch("/api/team/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, userId, role }),
    });
    const data = await response.json();
    return data.success || false;
  },

  async removeMember(teamId: string, userId: string) {
    const response = await fetch(
      `/api/team/members?teamId=${teamId}&userId=${userId}`,
      {
        method: "DELETE",
      },
    );
    const data = await response.json();
    return data.success || false;
  },

  async acceptInvite(token: string, userId: string) {
    const response = await fetch("/api/team/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    return data.success || false;
  },

  async checkPermission(teamId: string, userId: string, permission: string) {
    // This would be handled client-side based on the user's role
    return true;
  },

  mapTeamData(data: any) {
    return data;
  },
};
import { Team, TeamMember } from "../types/team";

// Controller: Handles user input and coordinates between Model and Presenter
export class TeamController {
  private model: TeamModel;
  private presenter: TeamPresenter;

  constructor(model: TeamModel, presenter: TeamPresenter) {
    this.model = model;
    this.presenter = presenter;
  }

  // Initialize the controller with the current user
  async initialize(userId: string): Promise<void> {
    try {
      this.presenter.showLoading(true);
      this.model.setCurrentUserId(userId);

      // Load user's teams
      const teams = await TeamService.getUserTeams(userId);
      this.model.setTeams(teams);
      this.presenter.updateTeams(teams);

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to initialize teams",
      );
      this.presenter.showLoading(false);
    }
  }

  // Create a new team
  async createTeam(name: string): Promise<Team | null> {
    try {
      this.presenter.showLoading(true);

      const userId = this.model.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const team = await TeamService.createTeam(name, userId);
      if (team) {
        this.model.addTeam(team);
        this.presenter.updateTeams(this.model.getTeams());
      }

      this.presenter.showLoading(false);
      return team;
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to create team",
      );
      this.presenter.showLoading(false);
      return null;
    }
  }

  // Select a team as the current team
  async selectTeam(teamId: string): Promise<void> {
    try {
      this.presenter.showLoading(true);

      // Get the full team details
      const team = await TeamService.getTeam(teamId);
      if (!team) {
        throw new Error("Team not found");
      }

      this.model.setCurrentTeam(team);
      this.presenter.updateCurrentTeam(team);

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to select team",
      );
      this.presenter.showLoading(false);
    }
  }

  // Update a team's name
  async updateTeam(name: string): Promise<void> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      if (!this.model.hasPermission("canManageTeam")) {
        throw new Error("You don't have permission to update this team");
      }

      const updatedTeam = await TeamService.updateTeam(currentTeam.id, name);
      if (updatedTeam) {
        this.model.updateTeam(updatedTeam);
        this.presenter.updateTeams(this.model.getTeams());
        this.presenter.updateCurrentTeam(updatedTeam);
      }

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to update team",
      );
      this.presenter.showLoading(false);
    }
  }

  // Delete a team
  async deleteTeam(): Promise<void> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      const userId = this.model.getCurrentUserId();
      if (!userId || userId !== currentTeam.ownerId) {
        throw new Error("Only the team owner can delete the team");
      }

      const success = await TeamService.deleteTeam(currentTeam.id);
      if (success) {
        this.model.removeTeam(currentTeam.id);
        this.presenter.updateTeams(this.model.getTeams());
        this.presenter.updateCurrentTeam(null);
      }

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to delete team",
      );
      this.presenter.showLoading(false);
    }
  }

  // Invite a user to the current team
  async inviteUser(
    email: string,
    role: "admin" | "member" | "viewer",
  ): Promise<boolean> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      if (!this.model.hasPermission("canManageTeam")) {
        throw new Error(
          "You don't have permission to invite users to this team",
        );
      }

      const userId = this.model.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const invite = await TeamService.inviteToTeam(
        currentTeam.id,
        email,
        role,
        userId,
      );

      this.presenter.showLoading(false);
      return !!invite;
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to invite user",
      );
      this.presenter.showLoading(false);
      return false;
    }
  }

  // Update a team member's role
  async updateMemberRole(
    memberId: string,
    role: "admin" | "member" | "viewer",
  ): Promise<void> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      if (!this.model.hasPermission("canManageTeam")) {
        throw new Error("You don't have permission to update member roles");
      }

      // Find the member to update
      const member = currentTeam.members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error("Member not found");
      }

      // Prevent changing the owner's role
      if (member.role === "owner") {
        throw new Error("Cannot change the owner's role");
      }

      const success = await TeamService.updateMemberRole(
        currentTeam.id,
        member.userId,
        role,
      );

      if (success) {
        // Update the member in the model
        const updatedMember: TeamMember = {
          ...member,
          role,
        };
        this.model.updateMember(updatedMember);

        // Refresh the current team
        this.presenter.updateCurrentTeam(this.model.getCurrentTeam());
      }

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to update member role",
      );
      this.presenter.showLoading(false);
    }
  }

  // Remove a member from the team
  async removeMember(memberId: string): Promise<void> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      if (!this.model.hasPermission("canManageTeam")) {
        throw new Error("You don't have permission to remove members");
      }

      // Find the member to remove
      const member = currentTeam.members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error("Member not found");
      }

      // Prevent removing the owner
      if (member.role === "owner") {
        throw new Error("Cannot remove the team owner");
      }

      const success = await TeamService.removeMember(
        currentTeam.id,
        member.userId,
      );

      if (success) {
        this.model.removeMember(memberId);
        this.presenter.updateCurrentTeam(this.model.getCurrentTeam());
      }

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to remove member",
      );
      this.presenter.showLoading(false);
    }
  }

  // Leave a team (remove yourself)
  async leaveTeam(): Promise<void> {
    try {
      this.presenter.showLoading(true);

      const currentTeam = this.model.getCurrentTeam();
      if (!currentTeam) {
        throw new Error("No team selected");
      }

      const userId = this.model.getCurrentUserId();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Find your member record
      const member = currentTeam.members.find((m) => m.userId === userId);
      if (!member) {
        throw new Error("You are not a member of this team");
      }

      // Prevent the owner from leaving
      if (member.role === "owner") {
        throw new Error(
          "The team owner cannot leave the team. Transfer ownership first or delete the team.",
        );
      }

      const success = await TeamService.removeMember(currentTeam.id, userId);

      if (success) {
        this.model.removeTeam(currentTeam.id);
        this.presenter.updateTeams(this.model.getTeams());
        this.presenter.updateCurrentTeam(null);
      }

      this.presenter.showLoading(false);
    } catch (error) {
      this.presenter.showError(
        error instanceof Error ? error.message : "Failed to leave team",
      );
      this.presenter.showLoading(false);
    }
  }

  // Check if the current user can perform an action
  canPerformAction(action: keyof typeof ROLE_PERMISSIONS.owner): boolean {
    return this.model.hasPermission(action);
  }
}
