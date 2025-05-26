import { Team } from "../types/team";

// Presenter: Handles UI updates and formatting
export class TeamPresenter {
  private setTeams: (teams: Team[]) => void;
  private setCurrentTeam: (team: Team | null) => void;
  private setIsLoading: (isLoading: boolean) => void;
  private setError: (error: string | null) => void;

  constructor(
    setTeams: (teams: Team[]) => void,
    setCurrentTeam: (team: Team | null) => void,
    setIsLoading: (isLoading: boolean) => void,
    setError: (error: string | null) => void,
  ) {
    this.setTeams = setTeams;
    this.setCurrentTeam = setCurrentTeam;
    this.setIsLoading = setIsLoading;
    this.setError = setError;
  }

  updateTeams(teams: Team[]): void {
    this.setTeams(teams);
  }

  updateCurrentTeam(team: Team | null): void {
    this.setCurrentTeam(team);
  }

  showLoading(isLoading: boolean): void {
    this.setIsLoading(isLoading);
  }

  showError(errorMessage: string | null): void {
    this.setError(errorMessage);
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  // Get role display information
  getRoleDisplay(role: string): { label: string; color: string } {
    switch (role) {
      case "owner":
        return { label: "Owner", color: "bg-purple-100 text-purple-800" };
      case "admin":
        return { label: "Admin", color: "bg-blue-100 text-blue-800" };
      case "member":
        return { label: "Member", color: "bg-green-100 text-green-800" };
      case "viewer":
        return { label: "Viewer", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: role, color: "bg-gray-100 text-gray-800" };
    }
  }
}
