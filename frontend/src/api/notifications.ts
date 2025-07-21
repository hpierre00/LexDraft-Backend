import apiClient from './client';
import { Notification } from '@/lib/types';

export const notificationService = {
  // Get notifications for the current user
  async getNotifications(params?: {
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>("/collaboration/notifications", { params });
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/collaboration/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.put("/collaboration/notifications/mark-all-read");
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/collaboration/notifications/${notificationId}`);
  },

  // Get unread notification count
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>("/collaboration/notifications/unread-count");
    return response.data;
  }
}; 