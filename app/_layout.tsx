// app/_layout.tsx
import React, { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationsStore } from "@/store/notificationStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "@/components/OnboardingScreen";
import { View, ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
import HeaderAddButton from "@/components/HeaderAddButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";
import * as Linking from 'expo-linking';
import { getSupabase } from "@/supabaseClient";
SplashScreen.preventAutoHideAsync();

const ONBOARDING_STORAGE_KEY = "@app_onboarding_completed_v1";

export default function RootLayout() {
  useNotifications();
  const { session } = useAuthStore();
  const { clearNotifications } = useNotificationsStore();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (!session) {
      clearNotifications();
    }
  }, [session]);

  useEffect(() => {

    
    getSupabase();

    const initializeApp = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem(
          ONBOARDING_STORAGE_KEY,
        );
        setShowOnboarding(onboardingStatus !== "true");
      } catch (e) {
        console.error("Initialization error (onboarding):", e);
        setShowOnboarding(true);
      }
    };

    initializeApp();

    // --- Linking Event Listener for Debugging OAuth Callback ---
    const handleDeepLink = (event: { url: string }) => {
      console.log("[_layout.tsx] Deep link event received (addEventListener):", event.url);
      // Supabase client should also be listening to this if detectSessionInUrl is true.
      // No need to manually pass it to Supabase here.
    };

    // Subscribe to incoming links
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check initial URL (if app was opened via a deep link)
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log("[_layout.tsx] Initial URL received (getInitialURL):", url);
        // Supabase client should also process this if detectSessionInUrl is true.
      }
    }).catch(err => console.warn("[_layout.tsx] Error getting initial URL:", err));
    // --- End Linking Event Listener ---


    // Initialize Supabase auth listener from your store
    const unsubscribeAuth = useAuthStore.getState().initAuthListener();

    // Cleanup function
    return () => {
      unsubscribeAuth();
      linkingSubscription.remove(); // Don't forget to remove your custom listener
    };
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if ((loaded || fontError) && showOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError, showOnboarding]);

  const handleOnboardingDone = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
      setShowOnboarding(false);
    } catch (e) {
      console.error("Failed to save onboarding status:", e);
      setShowOnboarding(false);
    }
  };

  if ((!loaded && !fontError) || showOnboarding === null) {
    if (showOnboarding === null) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            size="large"
            color={
              colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint
            }
          />
        </View>
      );
    }
    return null;
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={handleOnboardingDone} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/signin"
            options={{ presentation: "modal", title: "Sign In" }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{ presentation: "modal", title: "Sign Up" }}
          />
          <Stack.Screen
            name="property/new/index"
            options={{ title: "Add New Property" }}
          />
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="properties/index"
            options={({ navigation }) => ({
              headerRight: () => (
                <HeaderAddButton
                  onPress={() => {
                    console.log(
                      "Add button pressed: Navigating via router from RootLayout",
                    );
                    router.push("/property/new");
                  }}
                  tintColor="#4F46E5"
                />
              ),
            })}
          />
          <Stack.Screen
            name="payments/promote"
            options={{ title: "Promote Listing", headerShown: true }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
