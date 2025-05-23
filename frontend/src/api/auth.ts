import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  async register(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}; 