import React, { useState, useEffect } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import OnboardingScreen from '@/components/OnboardingScreen'; 
import { View, ActivityIndicator } from 'react-native'; 
import { Colors } from '@/constants/Colors'; 

import { useColorScheme } from "@/hooks/useColorScheme";

import "../global.css";

SplashScreen.preventAutoHideAsync();

const ONBOARDING_STORAGE_KEY = '@app_onboarding_completed_v1';

export default function RootLayout() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({ // Capture font error
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setShowOnboarding(onboardingStatus !== 'true');

        await checkAuth();

      } catch (e) {
        console.error("Initialization error:", e);
        // Decide fallback behavior if storage/auth check fails
        setShowOnboarding(true); // Default to showing onboarding on error
      }
    };

    initializeApp();
  }, [checkAuth]); // checkAuth dependency

  useEffect(() => {
    // Hide splash screen once fonts are loaded AND onboarding status is determined
    if ((loaded || fontError) && showOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError, showOnboarding]); // Add showOnboarding to dependencies

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setShowOnboarding(false); // Hide onboarding screen
    } catch (e) {
      console.error("Failed to save onboarding status:", e);
      // Still hide onboarding even if saving fails?
      setShowOnboarding(false);
    }
  };

  if (!loaded && !fontError || showOnboarding === null) {
     if (showOnboarding === null) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint} />
          </View>
        );
     }
     // If fonts aren't loaded yet but onboarding status *is* known,
     // returning null might be okay as the splash screen is still visible.
     return null;
  }

  // Show Onboarding if needed
  if (showOnboarding) {
    // Pass the function to call when onboarding is done/skipped
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Main Tab Navigator */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Modal Screens (Example) */}
          <Stack.Screen name="auth/signin" options={{ presentation: 'modal', title: 'Sign In' }} />
          <Stack.Screen name="auth/signup" options={{ presentation: 'modal', title: 'Sign Up' }} />

          {/* Other Full Screens */}
          <Stack.Screen
            name="property/new/index"
            options={{ title: "Add New Property" }}
          />
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="properties/index" // Screen for user's own properties
            options={{ title: "My Properties" }} // Updated title
          />
          <Stack.Screen name="payments/promote" options={{ title: 'Promote Listing', headerShown: true }} />

          {/* Not Found Screen */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
     
    </GestureHandlerRootView>
  );
}
