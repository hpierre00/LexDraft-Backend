import apiClient from './client';

export interface UserBillingStatus {
  plan: string;
  status: string;
  stripeCustomerId: string;
  trial_ends_at: string | null;
  renews_at: number;
  limits: {
    docs: string;
    ai_summary: number;
  };
  usage: {
    docs: number;
    ai_summary: number;
  };
  features: {
    template_downloads_unlimited: boolean;
    standard_doc_management: boolean;
    ai_summary_basic: boolean;
  };
}

export const billingService = {
  async getUserStatus() {
    const response = await apiClient.get<UserBillingStatus>('/billing/user/status');
    return response.data;
  },

  async createPortalSession() {
    const response = await apiClient.post<{ url: string }>('/billing/create-portal-session');
    return response.data;
  }
}; 