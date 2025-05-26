export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: "owner" | "admin" | "member" | "viewer";
  email: string;
  name: string;
  inviteAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: "admin" | "member" | "viewer";
  invitedBy: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface TeamPermission {
  canCreateInvoice: boolean;
  canEditInvoice: boolean;
  canDeleteInvoice: boolean;
  canViewInvoice: boolean;
  canManageTeam: boolean;
}

export const ROLE_PERMISSIONS: Record<TeamMember["role"], TeamPermission> = {
  owner: {
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: true,
    canViewInvoice: true,
    canManageTeam: true,
  },
  admin: {
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: true,
    canViewInvoice: true,
    canManageTeam: true,
  },
  member: {
    canCreateInvoice: true,
    canEditInvoice: true,
    canDeleteInvoice: false,
    canViewInvoice: true,
    canManageTeam: false,
  },
  viewer: {
    canCreateInvoice: false,
    canEditInvoice: false,
    canDeleteInvoice: false,
    canViewInvoice: true,
    canManageTeam: false,
  },
};
