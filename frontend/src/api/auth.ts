import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string;
  last_name: string;
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
  first_name: string;
  last_name: string;
  email_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  async register(credentials: RegisterCredentials) {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) throw new Error('No refresh token available');
    
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<{ data: UserProfile }>('/auth/user');
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
}; 