import apiClient from './client';
import { UUID } from "@/lib/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {}

export interface ProfileInfo {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  address?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string; // ISO 8601 date string
  state?: string;
  city?: string;
  zip_code?: string;
  role?: 'self' | 'attorney' | 'client';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_setup_complete: boolean;
  full_name: string | null;
  address: string | null;
  phone_number: string | null;
  gender: string | null;
  date_of_birth: string | null; // ISO 8601 date string
  state: string | null;
  city: string | null;
  zip_code: string | null;
  role: 'self' | 'attorney' | 'client' | null;
  is_admin: boolean;
  email_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    console.log('Login Response Data:', response.data);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    console.log('Login: Tokens set in local storage. Access token present:', !!localStorage.getItem('token'), 'Refresh token present:', !!localStorage.getItem('refresh_token'));
    return response.data;
  },

  async register(credentials: RegisterCredentials) {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      console.warn('refreshToken: No refresh token found in local storage.');
      throw new Error('No refresh token available. User needs to re-authenticate.');
    }

    console.log('Sending refresh token to backend:', refresh_token ? 'exists' : 'does not exist'); // Updated log

    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      console.log('Token refresh successful. New access token obtained and stored.');
      return response.data;
    } catch (error: any) {
      console.error('Failed to refresh token:', error.response?.data || error.message || error);
      throw new Error('Token refresh failed. Please log in again.');
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
  },

  async setupProfile(profileInfo: ProfileInfo): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/auth/setup-profile', profileInfo);
    return response.data;
  },

  async updateProfile(profileInfo: ProfileInfo): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/auth/me', profileInfo);
    return response.data;
  },

  logout() {
    console.log('authService.logout() called. Removing tokens from local storage.');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    console.log('isAuthenticated() check. Token present:', !!token);
    return !!token;
  },

  getToken() {
    const token = localStorage.getItem('token');
    console.log('getToken() called. Current token:', token ? 'exists' : 'does not exist');
    return token;
  }
};

export const updateUserProfile = async (
  profileData: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await apiClient.put<UserProfile>("/auth/me", profileData)
  return response.data
}