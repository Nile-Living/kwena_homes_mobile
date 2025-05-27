// src/hooks/useNotifications.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useNotificationsStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { registerDeviceToken, isUserAgent } = useNotificationsStore();
  const { session, user } = useAuthStore();

  useEffect(() => {
    // Only register for push notifications if user is an agent
    if (session && isUserAgent()) {
      console.log('User is an agent, registering for push notifications...');
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          const platform = Platform.OS === 'ios' ? 'ios' : 'android';
          console.log('Registering device token for agent:', token);
          registerDeviceToken(token, platform);
        }
      });

      // Listener for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        // Refresh notifications when one is received
        useNotificationsStore.getState().fetchNotifications(true);
      });

      // Listener for when user taps on notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
        
        const data = response.notification.request.content.data;
        
        // Handle navigation based on notification type
        if (data.type === 'promotion_expiring' && data.property_id) {
          router.push(`/property/${data.property_id}`);
        }
      });

      return () => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    } else {
      console.log('User is not an agent or not logged in, skipping push notification registration');
    }
  }, [session, user?.user_metadata?.role]);

  return {
    // Expose methods if needed
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo push token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
