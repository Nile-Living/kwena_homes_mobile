// app/auth/callback.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AuthCallbackScreen() {
  const { session } = useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams(); // Get potential redirect target

  useEffect(() => {
    // The onAuthStateChange listener in your store should handle
    // setting the session. We just wait here until the session is set,
    // then navigate away.
    if (session) {
      console.log('Callback Screen: Session detected, navigating...');
      // Navigate away from the callback screen
      const targetPath = (redirectTo as string) || '/'; // Default to home
      router.replace(targetPath);
    } else {
      // Optional: Add a timeout or error handling if the session
      // doesn't appear after a few seconds.
      console.log('Callback Screen: Waiting for session...');
    }
    // Add router to dependency array if needed, though replace might not require it
  }, [session, router, redirectTo]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>
        Finalizing authentication...
      </Text>
    </View>
  );
}
