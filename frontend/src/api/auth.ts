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
    console.log('Login Response Data:', response.data);
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
    if (!refresh_token) {
      throw new Error('No refresh token available. User needs to re-authenticate.');
    }

    // Basic validation for refresh token format
    if (refresh_token.length < 50 || !refresh_token.includes('.')) { // JWTs are typically long and contain dots
      console.error('Invalid refresh token format:', refresh_token);
      throw new Error('Invalid refresh token format. User needs to re-authenticate.');
    }

    console.log('Sending valid-looking refresh token to backend:', refresh_token); // Updated log

    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      return response.data;
    } catch (error: any) {
      console.error('Failed to refresh token:', error.response?.data || error.message || error);
      throw new Error('Token refresh failed. Please log in again.');
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    // Backend route is /me, not /user
    const response = await apiClient.get<UserProfile>('/auth/me');
    return response.data;
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