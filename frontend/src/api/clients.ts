import apiClient from './client';
import { UUID } from "@/lib/types";

export interface ClientProfileCreate {
  full_name: string;
  address?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null; // ISO 8601 date string
  state?: string | null;
  city?: string | null;
  zip_code?: string | null;
}

export interface ClientProfileResponse {
  id: UUID;
  user_id: UUID | null; // user_id is null for client profiles, kept for consistency if needed elsewhere
  full_name: string;
  email: string | null; // Added email field
  address: string | null;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null; // ISO 8601 date string
  state: string | null;
  city: string | null;
  zip_code: string | null;
  role?: "client"; // Made role optional
  attorney_id: UUID;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

export interface ClientFolderCreate {
  folder_name: string;
}

export interface ClientFolder {
  id: UUID;
  attorney_id: UUID;
  client_profile_id: UUID;
  folder_name: string;
  created_at: string;
  updated_at: string | null;
}

export const clientService = {
  async createClientProfile(clientProfile: ClientProfileCreate): Promise<ClientProfileResponse> {
    const response = await apiClient.post<ClientProfileResponse>('/attorney/clients/create', clientProfile);
    return response.data;
  },

  async getAttorneyClients(): Promise<ClientProfileResponse[]> {
    const response = await apiClient.get<ClientProfileResponse[]>('/attorney/clients/list');
    return response.data;
  },

  async getClientProfile(clientId: UUID): Promise<ClientProfileResponse> {
    const response = await apiClient.get<ClientProfileResponse>(`/attorney/clients/${clientId}`);
    return response.data;
  },

  async updateClientProfile(clientId: UUID, clientProfileUpdate: ClientProfileCreate): Promise<ClientProfileResponse> {
    const response = await apiClient.put<ClientProfileResponse>(`/attorney/clients/${clientId}`, clientProfileUpdate);
    return response.data;
  },

  async deleteClientProfile(clientId: UUID): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/attorney/clients/${clientId}`);
    return response.data;
  },

  async createClientFolder(clientId: UUID, folderName: string): Promise<ClientFolder> {
    const response = await apiClient.post<ClientFolder>(`/attorney/clients/${clientId}/folders/create`, { folder_name: folderName });
    return response.data;
  },

  async listClientFolders(clientId: UUID): Promise<ClientFolder[]> {
    const response = await apiClient.get<ClientFolder[]>(`/attorney/clients/${clientId}/folders/list`);
    return response.data;
  },

  async updateClientFolder(clientId: UUID, folderId: UUID, folderName: string): Promise<ClientFolder> {
    const response = await apiClient.put<ClientFolder>(`/attorney/clients/${clientId}/folders/${folderId}`, { folder_name: folderName });
    return response.data;
  },

  async deleteClientFolder(clientId: UUID, folderId: UUID): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/attorney/clients/${clientId}/folders/${folderId}`);
    return response.data;
  },
}; 