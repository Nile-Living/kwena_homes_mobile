import { create } from 'zustand';
import { API_BASE_URL } from '@/constants/Config';
import { useAuthStore } from './authStore';
import { useSubscriptionStore } from './subscriptionStore';

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

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria: {
    property_type?: 'rent' | 'sale';
    category?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    bathrooms?: number;
    min_square_meters?: number;
    max_square_meters?: number;
  };
  is_active: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  
  savedSearches: SavedSearch[];
  loadingSavedSearches: boolean;
  errorSavedSearches: string | null;

  fetchNotifications: (refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  registerDeviceToken: (token: string, platform: string) => Promise<void>;
  
  fetchSavedSearches: () => Promise<void>;
  createSavedSearch: (data: Omit<SavedSearch, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<SavedSearch>;
  updateSavedSearch: (id: string, data: Partial<SavedSearch>) => Promise<SavedSearch>;
  deleteSavedSearch: (id: string) => Promise<void>;
  
  setError: (error: string | null) => void;
  clearNotifications: () => void;
  clearSavedSearches: () => void;
  isUserAgent: () => boolean;
  isRegularUser: () => boolean;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  
  savedSearches: [],
  loadingSavedSearches: false,
  errorSavedSearches: null,

  isUserAgent: () => {
    const { user } = useAuthStore.getState();
    return user?.user_metadata?.role === 'agent' || user?.app_metadata?.role === 'agent';
  },

  isRegularUser: () => {
    const { user } = useAuthStore.getState();
    return user?.user_metadata?.role === 'user' || user?.app_metadata?.role === 'user';
  },

  fetchNotifications: async (refresh = false) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

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

  fetchSavedSearches: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    set({ loadingSavedSearches: true, errorSavedSearches: null });

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/saved-searches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch saved searches');
      }

      const data = await response.json();
      set({ savedSearches: data, loadingSavedSearches: false });
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
      set({ errorSavedSearches: error.message, loadingSavedSearches: false });
    }
  },

  createSavedSearch: async (searchData) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    const { isSubscribed } = useSubscriptionStore.getState();
    if (!isSubscribed) {
      throw new Error('You need an active subscription to save searches');
    }

    const limitCheck = await useSubscriptionStore.getState().checkCanSaveMoreSearches();
    if (!limitCheck.canSave) {
      throw new Error(`You have reached your saved search limit (${limitCheck.maxAllowed}). Upgrade your subscription to save more searches.`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/saved-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create saved search');
      }

      const newSearch = await response.json();
      set(state => ({ savedSearches: [newSearch, ...state.savedSearches] }));
      
      useSubscriptionStore.getState().checkCanSaveMoreSearches();
      return newSearch;
    } catch (error: any) {
      console.error('Error creating saved search:', error);
      throw error;
    }
  },

  updateSavedSearch: async (id, updateData) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/saved-searches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update saved search');
      }

      const updatedSearch = await response.json();
      set(state => ({
        savedSearches: state.savedSearches.map(search =>
          search.id === id ? updatedSearch : search
        ),
      }));
      return updatedSearch;
    } catch (error: any) {
      console.error('Error updating saved search:', error);
      throw error;
    }
  },

  deleteSavedSearch: async (id) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/saved-searches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete saved search');
      }

      set(state => ({
        savedSearches: state.savedSearches.filter(search => search.id !== id),
      }));
      
      useSubscriptionStore.getState().checkCanSaveMoreSearches();
    } catch (error: any) {
      console.error('Error deleting saved search:', error);
      throw error;
    }
  },

  setError: (error) => set({ error }),

  clearNotifications: () => set({ 
    notifications: [], 
    unreadCount: 0, 
    page: 1, 
    hasMore: true,
    error: null,
  }),

  clearSavedSearches: () => set({
    savedSearches: [],
    errorSavedSearches: null,
  }),
}));
