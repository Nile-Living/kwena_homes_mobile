import { create } from 'zustand';
import { API_BASE_URL } from '@/constants/Config';
import { useAuthStore } from './authStore';

export enum SubscriptionType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface SubscriptionFeatures {
  max_saved_searches: number;
  priority_notifications: boolean;
  advanced_filters: boolean;
  property_alerts: boolean;
  api_rate_limit?: number;
  analytics_access?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: SubscriptionType;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string;
  payment_reference?: string;
  amount_paid?: number;
  currency: string;
  created_at: string;
  updated_at: string;
  features?: SubscriptionFeatures;
}

export interface SubscriptionPlan {
  type: SubscriptionType;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: SubscriptionFeatures;
}

interface SubscriptionState {
  subscription: UserSubscription | null;
  subscriptions: UserSubscription[];
  plans: SubscriptionPlan[];
  isSubscribed: boolean;
  features: SubscriptionFeatures | null;
  loading: boolean;
  loadingPlans: boolean;
  error: string | null;
  savedSearchCount: number;
  maxSavedSearches: number;

  fetchSubscriptionPlans: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  fetchActiveSubscription: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  createSubscription: (data: {
    subscription_type: SubscriptionType;
    duration_months: number;
    payment_reference?: string;
    amount_paid?: number;
    currency?: string;
  }) => Promise<UserSubscription>;
  updateSubscription: (subscriptionId: string, data: Partial<UserSubscription>) => Promise<UserSubscription>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  renewSubscription: (subscriptionId: string, duration_months: number) => Promise<UserSubscription>;
  checkCanPerformAction: (action: 'save_search' | 'priority_notifications' | 'advanced_filters') => Promise<boolean>;
  checkCanSaveMoreSearches: () => Promise<{ canSave: boolean; currentCount: number; maxAllowed: number }>;
  setError: (error: string | null) => void;
  clearSubscriptionData: () => void;
  isUserRole: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  subscriptions: [],
  plans: [],
  isSubscribed: false,
  features: null,
  loading: false,
  loadingPlans: false,
  error: null,
  savedSearchCount: 0,
  maxSavedSearches: 0,

  isUserRole: () => {
    const { user } = useAuthStore.getState();
    return user?.user_metadata?.role === 'user' || user?.app_metadata?.role === 'user';
  },

  fetchSubscriptionPlans: async () => {
    set({ loadingPlans: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/plans`);

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const plans = await response.json();
      set({ plans, loadingPlans: false });
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      set({ error: error.message, loadingPlans: false });
    }
  },

  fetchUserSubscriptions: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user subscriptions');
      }

      const subscriptions = await response.json();
      set({ subscriptions, loading: false });
    } catch (error: any) {
      console.error('Error fetching user subscriptions:', error);
      set({ error: error.message, loading: false });
    }
  },

fetchActiveSubscription: async () => {
  const token = useAuthStore.getState().session?.access_token;
  if (!token) return;

  set({ loading: true, error: null });

  try {
    const response = await fetch(`${API_BASE_URL}/subscriptions/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      set({ 
        subscription: null, 
        isSubscribed: false, 
        features: null, 
        loading: false 
      });
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch active subscription');
    }

    const subscription = await response.json();

    if (!subscription) {
      set({
        subscription: null,
        isSubscribed: false,
        features: null,
        loading: false,
      });
      return;
    }
    
    set({
      subscription,
      isSubscribed: true,
      features: subscription?.features || null, // Add null check here
      loading: false,
    });
  } catch (error: any) {
    console.error('Error fetching active subscription:', error);
    set({ 
      error: error.message, 
      loading: false,
      subscription: null,
      isSubscribed: false,
      features: null
    });
  }
},


  fetchSubscriptionStatus: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const data = await response.json();
      set({
        isSubscribed: data.isSubscribed,
        features: data.features,
        loading: false,
      });
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      set({ error: error.message, loading: false });
    }
  },

  createSubscription: async (subscriptionData) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }

      const newSubscription = await response.json();
      set({
        subscription: newSubscription,
        isSubscribed: true,
        features: newSubscription.features,
        subscriptions: [newSubscription, ...get().subscriptions],
        loading: false,
      });

      return newSubscription;
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSubscription: async (subscriptionId, updateData) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const updatedSubscription = await response.json();
      set(state => ({
        subscription: state.subscription?.id === subscriptionId ? updatedSubscription : state.subscription,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === subscriptionId ? updatedSubscription : sub
        ),
        features: state.subscription?.id === subscriptionId ? updatedSubscription.features : state.features,
      }));

      return updatedSubscription;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      set({ error: error.message });
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      set(state => ({
        subscription: state.subscription?.id === subscriptionId ? null : state.subscription,
        isSubscribed: state.subscription?.id === subscriptionId ? false : state.isSubscribed,
        features: state.subscription?.id === subscriptionId ? null : state.features,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === subscriptionId ? { ...sub, status: SubscriptionStatus.CANCELLED } : sub
        ),
      }));
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      set({ error: error.message });
      throw error;
    }
  },

  renewSubscription: async (subscriptionId, duration_months) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) throw new Error('Authentication required');

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/renew`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration_months }),
      });

      if (!response.ok) {
        throw new Error('Failed to renew subscription');
      }

      const renewedSubscription = await response.json();
      set(state => ({
        subscription: state.subscription?.id === subscriptionId ? renewedSubscription : state.subscription,
        subscriptions: state.subscriptions.map(sub =>
          sub.id === subscriptionId ? renewedSubscription : sub
        ),
        features: state.subscription?.id === subscriptionId ? renewedSubscription.features : state.features,
        loading: false,
      }));

      return renewedSubscription;
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  checkCanPerformAction: async (action) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/actions/${action}/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.canPerform;
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  },

  checkCanSaveMoreSearches: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return { canSave: false, currentCount: 0, maxAllowed: 0 };

    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/saved-searches/limit-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return { canSave: false, currentCount: 0, maxAllowed: 0 };
      }

      const data = await response.json();
      set({
        savedSearchCount: data.currentCount,
        maxSavedSearches: data.maxAllowed,
      });

      return {
        canSave: data.canSave,
        currentCount: data.currentCount,
        maxAllowed: data.maxAllowed,
      };
    } catch (error) {
      console.error('Error checking saved search limit:', error);
      return { canSave: false, currentCount: 0, maxAllowed: 0 };
    }
  },

  setError: (error) => set({ error }),

  clearSubscriptionData: () => set({
    subscription: null,
    subscriptions: [],
    isSubscribed: false,
    features: null,
    savedSearchCount: 0,
    maxSavedSearches: 0,
    error: null,
  }),
}));
