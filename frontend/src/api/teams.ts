import apiClient from "./client";
import {
  Team,
  TeamDetails,
  TeamMember,
  TeamInvitation,
  DocumentCollaborator,
  TeamDocument,
  Notification,
  CreateTeamData,
  UpdateTeamData,
  InviteTeamMembersData,
  ShareDocumentData,
  ShareTeamDocumentsData,
  TeamRole,
  InvitationStatus
} from "@/lib/types";

// Team Management API
export const teamService = {
  // Teams
  async createTeam(data: CreateTeamData): Promise<Team> {
    const response = await apiClient.post<Team>("/teams/create", data);
    return response.data;
  },

  async getTeams(params?: {
    search?: string;
    role?: TeamRole;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Team[]> {
    const response = await apiClient.get<Team[]>("/teams/list", { params });
    return response.data;
  },

  async getTeamDetails(teamId: string): Promise<TeamDetails> {
    const response = await apiClient.get<TeamDetails>(`/teams/${teamId}`);
    return response.data;
  },

  async updateTeam(teamId: string, data: UpdateTeamData): Promise<Team> {
    const response = await apiClient.put<Team>(`/teams/${teamId}`, data);
    return response.data;
  },

  async deleteTeam(teamId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/teams/${teamId}`);
    return response.data;
  },

  // Team Invitations
  async inviteMembers(teamId: string, data: InviteTeamMembersData): Promise<TeamInvitation[]> {
    const response = await apiClient.post<TeamInvitation[]>(`/teams/${teamId}/invite`, data);
    return response.data;
  },

  async getTeamInvitations(teamId: string, status?: InvitationStatus): Promise<TeamInvitation[]> {
    const params = status ? { status } : undefined;
    const response = await apiClient.get<TeamInvitation[]>(`/teams/${teamId}/invitations`, { params });
    return response.data;
  },

  async acceptInvitation(token: string): Promise<TeamMember> {
    const response = await apiClient.post<TeamMember>("/teams/invitations/accept", { token });
    return response.data;
  },

  // Team Members
  async getTeamMembers(teamId: string, params?: {
    search?: string;
    role?: TeamRole;
    limit?: number;
    offset?: number;
  }): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(`/teams/${teamId}/members`, { params });
    return response.data;
  },

  async updateMemberRole(teamId: string, memberId: string, role: TeamRole): Promise<TeamMember> {
    const response = await apiClient.put<TeamMember>(`/teams/${teamId}/members/${memberId}/role`, { role });
    return response.data;
  },

  async removeMember(teamId: string, memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/teams/${teamId}/members/${memberId}`);
    return response.data;
  },

  async leaveTeam(teamId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/teams/${teamId}/leave`);
    return response.data;
  }
};

// Document Collaboration API
export const collaborationService = {
  // Document Sharing
  async shareDocument(documentId: string, collaborators: ShareDocumentData[]): Promise<DocumentCollaborator[]> {
    const response = await apiClient.post<DocumentCollaborator[]>(`/collaboration/documents/${documentId}/share`, collaborators);
    return response.data;
  },

  async getDocumentCollaborators(documentId: string): Promise<DocumentCollaborator[]> {
    const response = await apiClient.get<DocumentCollaborator[]>(`/collaboration/documents/${documentId}/collaborators`);
    return response.data;
  },

  async updateCollaboratorRole(documentId: string, collaboratorId: string, role: TeamRole): Promise<DocumentCollaborator> {
    const response = await apiClient.put<DocumentCollaborator>(`/collaboration/documents/${documentId}/collaborators/${collaboratorId}`, { role });
    return response.data;
  },

  async removeCollaborator(documentId: string, collaboratorId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/collaboration/documents/${documentId}/collaborators/${collaboratorId}`);
    return response.data;
  },

  // Team Document Sharing
  async shareDocumentsWithTeam(teamId: string, documentIds: string[]): Promise<TeamDocument[]> {
    const documents = documentIds.map(id => ({ document_id: id }));
    const response = await apiClient.post<TeamDocument[]>(`/collaboration/teams/${teamId}/documents/share`, documents);
    return response.data;
  },

  async getTeamDocuments(teamId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<TeamDocument[]> {
    const response = await apiClient.get<TeamDocument[]>(`/collaboration/teams/${teamId}/documents`, { params });
    return response.data;
  },

  async removeDocumentFromTeam(teamId: string, teamDocumentId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/collaboration/teams/${teamId}/documents/${teamDocumentId}`);
    return response.data;
  },

  // Notifications
  async getNotifications(params?: {
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>("/collaboration/notifications", { params });
    return response.data;
  },

  async markNotificationRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.put<Notification>(`/collaboration/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>("/collaboration/notifications/mark-all-read");
    return response.data;
  }
}; 