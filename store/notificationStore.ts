// src/store/notificationsStore.ts
import { create } from 'zustand';
import { API_BASE_URL } from '@/constants/Config';
import { useAuthStore } from './authStore';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  unreadCount: number;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  
  // Actions
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  registerDeviceToken: (token: string, platform: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearNotifications: () => void;
  isUserAgent: () => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,

  isUserAgent: () => {
    const { user } = useAuthStore.getState();
    
    // Check the user metadata first (from Supabase auth)
    if (user?.user_metadata?.role === 'agent') return true;
    if (user?.app_metadata?.role === 'agent') return true;
    
    // If we have user data but no role info, we can't determine agent status
    // The backend will handle the verification using profiles table
    return false;
  },

  fetchNotifications: async (refresh = false) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    // Check if user is likely an agent before making the call
    if (!get().isUserAgent()) {
      set({ error: 'Notifications are only available for agents' });
      return;
    }

    const currentState = get();
    const page = refresh ? 1 : currentState.page;

    set({ loading: true, error: null });

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?page=${page}&pageSize=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data: NotificationsResponse = await response.json();

      set({
        notifications: refresh 
          ? data.notifications 
          : [...currentState.notifications, ...data.notifications],
        unreadCount: data.unreadCount,
        hasMore: data.notifications.length === 20,
        page: refresh ? 2 : page + 1,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      set({ error: error.message || 'Failed to load notifications', loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      set({ error: error.message || 'Failed to mark notification as read' });
    }
  },

  markAllAsRead: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to mark all notifications as read');
      }

      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          read_at: notif.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      set({ error: error.message || 'Failed to mark all notifications as read' });
    }
  },

  registerDeviceToken: async (token: string, platform: string) => {
    const authToken = useAuthStore.getState().session?.access_token;
    if (!authToken) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/device-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token, platform }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to register device token');
      }
    } catch (error: any) {
      console.error('Error registering device token:', error);
    }
  },

  setError: (error) => set({ error }),
  clearNotifications: () => set({ 
    notifications: [], 
    unreadCount: 0, 
    page: 1, 
    hasMore: true 
  }),
}));
