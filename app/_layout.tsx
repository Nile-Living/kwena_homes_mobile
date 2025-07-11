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
import * as Linking from "expo-linking";
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

  // --- All your useEffect hooks remain unchanged ---
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
          ONBOARDING_STORAGE_KEY
        );
        setShowOnboarding(onboardingStatus !== "true");
      } catch (e) {
        console.error("Initialization error (onboarding):", e);
        setShowOnboarding(true);
      }
    };
    initializeApp();
    const handleDeepLink = (event: { url: string }) => {
      console.log(
        "[_layout.tsx] Deep link event received (addEventListener):",
        event.url
      );
    };
    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          console.log(
            "[_layout.tsx] Initial URL received (getInitialURL):",
            url
          );
        }
      })
      .catch((err) =>
        console.warn("[_layout.tsx] Error getting initial URL:", err)
      );
    const unsubscribeAuth = useAuthStore.getState().initAuthListener();
    return () => {
      unsubscribeAuth();
      linkingSubscription.remove();
    };
  }, []);

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
        {/* --- THIS IS THE MAIN CHANGE --- */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#1e293b" : "#ffffff",
            },
            headerTintColor: colorScheme === "dark" ? "#e2e8f0" : "#1f2937",
            headerShadowVisible: false,
          }}
        >
          {/* The route group for auth is (auth), not auth */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/*
            The screen for adding a property. It will automatically get the
            themed header from screenOptions above. We just set the title.
            Your file path is `property/new/index.tsx`, so the name is correct.
          */}
          <Stack.Screen
            name="property/new/index"
            options={{ title: "Add New Property" }}
          />

          <Stack.Screen
            name="settings/support/help-center"
            options={{ title: "Help Center" }}
          />

          <Stack.Screen
            name="settings/support/contact-us"
            options={{ title: "Contact Us" }}
          />

          <Stack.Screen
            name="settings/support/PrivacyPolicyScreen"
            options={{ title: "Privacy Policies" }}
          />

          <Stack.Screen
            name="auth/signin"
            options={{ title: "Sign In" }}
          />

          <Stack.Screen
            name="auth/signup"
            options={{ title: "Sign Up" }}
          />

          <Stack.Screen
            name="settings/support/TermsConditionsScreen"
            options={{ title: "Terms & Conditions" }}
          />

          <Stack.Screen
            name="settings/saveSearchScreen/SavedSearchScreen"
            options={{ title: "Create a New Property Alert" }}
          />

          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="properties/index"
            options={({ navigation }) => ({
              title: "Properties", // It's good practice to add a title
              headerRight: () => (
                <HeaderAddButton
                  onPress={() => router.push("/property/new")}
                  tintColor={
                    colorScheme === "dark"
                      ? Colors.dark.tint
                      : Colors.light.tint
                  }
                />
              ),
            })}
          />
          <Stack.Screen
            name="payments/promote"
            options={{ title: "Promote Listing" }}
          />
          <Stack.Screen
            name="subscriptions/index"
            options={{ title: "Subscriptions" }}
          />
          <Stack.Screen
            name="analytics/index"
            options={{ title: "Analytics" }}
          />
          <Stack.Screen
            name="saved-searches/index"
            options={{ title: "Saved Searches" }}
          />
          <Stack.Screen name="+not-found" />

          {/*
            These modal screens are removed from here because they are
            already handled by your `app/auth/_layout.tsx` file.
            Declaring them here is redundant.
            <Stack.Screen name="auth/signin" ... />
            <Stack.Screen name="auth/signup" ... />
          */}
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
