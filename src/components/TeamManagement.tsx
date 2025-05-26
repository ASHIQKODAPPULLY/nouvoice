"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertCircle,
  Loader2,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Team, TeamMember, ROLE_PERMISSIONS } from "@/lib/types/team";
import { TeamModel, TeamController, TeamPresenter } from "@/lib/mcp";

interface TeamManagementProps {
  userId: string;
  isPremium?: boolean;
}

export default function TeamManagement({
  userId,
  isPremium = false,
}: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<
    "admin" | "member" | "viewer"
  >("member");
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");

  // Create MCP instances
  const teamModel = new TeamModel();
  const teamPresenter = new TeamPresenter(
    setTeams,
    setCurrentTeam,
    setIsLoading,
    setError,
  );
  const teamController = new TeamController(teamModel, teamPresenter);

  // Initialize teams on component mount
  useEffect(() => {
    if (userId) {
      // For demo purposes, create a mock team
      const mockTeam: Team = {
        id: "mock-team-id",
        name: "Demo Team",
        ownerId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [
          {
            id: "mock-member-1",
            userId: userId,
            teamId: "mock-team-id",
            role: "owner",
            email: "owner@example.com",
            name: "Demo Owner",
            inviteAccepted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "mock-member-2",
            userId: "mock-user-2",
            teamId: "mock-team-id",
            role: "member",
            email: "member@example.com",
            name: "Demo Member",
            inviteAccepted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      setTeams([mockTeam]);
      setCurrentTeam(mockTeam);
      teamModel.setTeams([mockTeam]);
      teamModel.setCurrentTeam(mockTeam);
      teamModel.setCurrentUserId(userId);
    }
  }, [userId]);

  // Handle team creation
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      setError("Team name cannot be empty");
      return;
    }

    // For demo purposes, create a mock team
    const mockTeam: Team = {
      id: `mock-team-${Date.now()}`,
      name: newTeamName,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: `mock-member-${Date.now()}`,
          userId: userId,
          teamId: `mock-team-${Date.now()}`,
          role: "owner",
          email: "owner@example.com",
          name: "Demo Owner",
          inviteAccepted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    setTeams([...teams, mockTeam]);
    setCurrentTeam(mockTeam);
    teamModel.addTeam(mockTeam);
    teamModel.setCurrentTeam(mockTeam);

    setNewTeamName("");
    setIsCreateTeamDialogOpen(false);
    setActiveTab("members");
  };

  // Handle team selection
  const handleSelectTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
      teamModel.setCurrentTeam(team);
      setActiveTab("members");
    }
  };

  // Handle member invitation
  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) {
      setError("Email cannot be empty");
      return;
    }

    if (!currentTeam) return;

    // For demo purposes, create a mock member
    const mockMember: TeamMember = {
      id: `mock-member-${Date.now()}`,
      userId: `mock-user-${Date.now()}`,
      teamId: currentTeam.id,
      role: newMemberRole,
      email: newMemberEmail,
      name: newMemberEmail.split("@")[0],
      inviteAccepted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTeam = {
      ...currentTeam,
      members: [...currentTeam.members, mockMember],
    };

    setTeams(teams.map((t) => (t.id === currentTeam.id ? updatedTeam : t)));
    setCurrentTeam(updatedTeam);
    teamModel.updateTeam(updatedTeam);

    setNewMemberEmail("");
    setNewMemberRole("member");
    setIsInviteDialogOpen(false);
  };

  // Handle member role update
  const handleUpdateMemberRole = (
    memberId: string,
    role: "admin" | "member" | "viewer",
  ) => {
    if (!currentTeam) return;

    const updatedMembers = currentTeam.members.map((member) =>
      member.id === memberId ? { ...member, role } : member,
    );

    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers,
    };

    setTeams(teams.map((t) => (t.id === currentTeam.id ? updatedTeam : t)));
    setCurrentTeam(updatedTeam);
    teamModel.updateTeam(updatedTeam);
  };

  // Handle member removal
  const handleRemoveMember = (memberId: string) => {
    if (!currentTeam) return;

    const updatedMembers = currentTeam.members.filter(
      (member) => member.id !== memberId,
    );

    const updatedTeam = {
      ...currentTeam,
      members: updatedMembers,
    };

    setTeams(teams.map((t) => (t.id === currentTeam.id ? updatedTeam : t)));
    setCurrentTeam(updatedTeam);
    teamModel.updateTeam(updatedTeam);
  };

  // Handle team deletion
  const handleDeleteTeam = () => {
    if (!currentTeam) return;

    setTeams(teams.filter((t) => t.id !== currentTeam.id));
    setCurrentTeam(null);
    teamModel.removeTeam(currentTeam.id);
    setActiveTab("teams");
  };

  // Handle leaving a team
  const handleLeaveTeam = () => {
    if (!currentTeam) return;

    setTeams(teams.filter((t) => t.id !== currentTeam.id));
    setCurrentTeam(null);
    teamModel.removeTeam(currentTeam.id);
    setActiveTab("teams");
  };

  // Check if the current user is the team owner
  const isTeamOwner = currentTeam?.ownerId === userId;

  // Check if the current user can manage the team
  const canManageTeam = true; // For demo purposes

  // Get the current user's role in the team
  const getCurrentUserRole = (): string => {
    if (!currentTeam) return "";
    const member = currentTeam.members.find((m) => m.userId === userId);
    return member?.role || "";
  };

  return (
    <Card className="w-full bg-card border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
          {!isPremium && (
            <Badge variant="outline" className="ml-2 text-xs">
              Premium Feature
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Create and manage teams to collaborate on invoices
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!isPremium ? (
          <div className="p-4 bg-muted/50 rounded-md text-center">
            <p className="text-muted-foreground mb-4">
              Team management is a premium feature. Upgrade to access team
              collaboration tools.
            </p>
            <Button onClick={() => (window.location.href = "/pricing")}>
              Upgrade to Premium
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="teams">My Teams</TabsTrigger>
                <TabsTrigger value="members" disabled={!currentTeam}>
                  Team Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teams" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Your Teams</h3>
                  <Dialog
                    open={isCreateTeamDialogOpen}
                    onOpenChange={setIsCreateTeamDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> New Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                          Create a team to collaborate on invoices with your
                          colleagues.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="teamName">Team Name</Label>
                          <Input
                            id="teamName"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Enter team name"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateTeamDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTeam} disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Team"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground mb-4">
                      You don't have any teams yet.
                    </p>
                    <Button
                      onClick={() => setIsCreateTeamDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Create Your First Team
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className={`p-4 border rounded-md flex justify-between items-center hover:bg-muted/20 cursor-pointer transition-colors ${currentTeam?.id === team.id ? "border-primary bg-primary/5" : ""}`}
                        onClick={() => handleSelectTeam(team.id)}
                      >
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {team.members.length} member
                            {team.members.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          {team.ownerId === userId && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                              Owner
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                {currentTeam && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {currentTeam.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentTeam.members.length} member
                          {currentTeam.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {canManageTeam && (
                          <Dialog
                            open={isInviteDialogOpen}
                            onOpenChange={setIsInviteDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-4 w-4" /> Invite Member
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                  Invite a new member to join your team.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="email">Email Address</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) =>
                                      setNewMemberEmail(e.target.value)
                                    }
                                    placeholder="colleague@example.com"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={newMemberRole}
                                    onValueChange={(value) =>
                                      setNewMemberRole(
                                        value as "admin" | "member" | "viewer",
                                      )
                                    }
                                  >
                                    <SelectTrigger id="role">
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">
                                        Admin
                                      </SelectItem>
                                      <SelectItem value="member">
                                        Member
                                      </SelectItem>
                                      <SelectItem value="viewer">
                                        Viewer
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {newMemberRole === "admin" &&
                                      "Can manage team members and all invoices"}
                                    {newMemberRole === "member" &&
                                      "Can create and edit invoices"}
                                    {newMemberRole === "viewer" &&
                                      "Can only view invoices"}
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsInviteDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleInviteMember}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    "Send Invitation"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isTeamOwner ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleDeleteTeam}
                              >
                                Delete Team
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={handleLeaveTeam}
                              >
                                Leave Team
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name/Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            {canManageTeam && (
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            )}
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
                              {canManageTeam && (
                                <TableCell className="text-right">
                                  {member.role !== "owner" && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateMemberRole(
                                              member.id,
                                              "admin",
                                            )
                                          }
                                          disabled={member.role === "admin"}
                                        >
                                          Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateMemberRole(
                                              member.id,
                                              "member",
                                            )
                                          }
                                          disabled={member.role === "member"}
                                        >
                                          Make Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleUpdateMemberRole(
                                              member.id,
                                              "viewer",
                                            )
                                          }
                                          disabled={member.role === "viewer"}
                                        >
                                          Make Viewer
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onClick={() =>
                                            handleRemoveMember(member.id)
                                          }
                                        >
                                          Remove Member
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-6 p-4 border rounded-md bg-muted/20">
                      <h4 className="font-medium mb-2">Role Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Owner</p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                            <li>• Can manage team members and settings</li>
                            <li>• Can create, edit, and delete invoices</li>
                            <li>• Can transfer ownership</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Admin</p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                            <li>• Can manage team members</li>
                            <li>• Can create, edit, and delete invoices</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Member</p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                            <li>• Can create and edit invoices</li>
                            <li>• Cannot delete invoices</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Viewer</p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                            <li>• Can only view invoices</li>
                            <li>• Cannot create, edit, or delete invoices</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
