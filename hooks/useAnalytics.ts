import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/constants/Config';

export enum AnalyticsEvent {
  PROPERTY_VIEW = 'PROPERTY_VIEW',
  PROPERTY_SAVE = 'PROPERTY_SAVE',
  PROPERTY_CONTACT = 'PROPERTY_CONTACT',
  PROPERTY_SHARE = 'PROPERTY_SHARE',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  SUBSCRIPTION_UPGRADE = 'SUBSCRIPTION_UPGRADE',
}

interface AnalyticsEventData {
  property_id?: string;
  metadata?: Record<string, any>;
}

export const useAnalytics = () => {
  const { session } = useAuthStore();

  const trackEvent = useCallback(async (
    eventType: AnalyticsEvent,
    data?: AnalyticsEventData
  ) => {
    if (!session?.access_token) {
      // Don't track events for unauthenticated users
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          event_type: eventType,
          property_id: data?.property_id,
          metadata: data?.metadata,
        }),
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, [session?.access_token]);

  const trackPropertyView = useCallback((propertyId: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.PROPERTY_VIEW, { property_id: propertyId, metadata });
  }, [trackEvent]);

  const trackPropertySave = useCallback((propertyId: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.PROPERTY_SAVE, { property_id: propertyId, metadata });
  }, [trackEvent]);

  const trackPropertyContact = useCallback((propertyId: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.PROPERTY_CONTACT, { property_id: propertyId, metadata });
  }, [trackEvent]);

  const trackPropertyShare = useCallback((propertyId: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.PROPERTY_SHARE, { property_id: propertyId, metadata });
  }, [trackEvent]);

  const trackSearch = useCallback((searchCriteria: Record<string, any>) => {
    trackEvent(AnalyticsEvent.SEARCH_PERFORMED, { metadata: searchCriteria });
  }, [trackEvent]);

  const trackProfileUpdate = useCallback((updateType: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.PROFILE_UPDATE, { metadata: { updateType, ...metadata } });
  }, [trackEvent]);

  const trackSubscriptionUpgrade = useCallback((subscriptionType: string, metadata?: Record<string, any>) => {
    trackEvent(AnalyticsEvent.SUBSCRIPTION_UPGRADE, { metadata: { subscriptionType, ...metadata } });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPropertyView,
    trackPropertySave,
    trackPropertyContact,
    trackPropertyShare,
    trackSearch,
    trackProfileUpdate,
    trackSubscriptionUpgrade,
  };
};