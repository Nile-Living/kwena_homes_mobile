// app/auth/callback.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function AuthCallbackScreen() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user); // Get user object
  const checkAuth = useAuthStore((state) => state.checkAuth); // To refresh user data if needed
  const router = useRouter();
  const { redirectTo, ...otherParams } = useLocalSearchParams();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    console.log(
      "AuthCallbackScreen - Session from store:",
      JSON.stringify(session, null, 2),
    );
    console.log(
      "AuthCallbackScreen - User from store:",
      JSON.stringify(user, null, 2),
    );

    if (otherParams.error) {
      console.error(
        "OAuth Error in Callback:",
        otherParams.error_description || otherParams.error,
      );
      router.replace("/auth/signin");
      return;
    }

    const handleNavigation = async () => {
      if (session && user) {
        // User is authenticated, now check if profile completion is needed
        const isSocialProvider =
          user.app_metadata.provider === "google" ||
          user.app_metadata.provider === "facebook";

        // Check if phone is missing or role is the default (or missing)
        // The trigger sets a default 'user' role if none is provided by OAuth metadata
        const phoneMissing = !user.phone; // auth.users.phone
        const roleNeedsUpdate =
          !user.user_metadata?.role || user.user_metadata?.role === "user"; // Assuming 'user' is the default from trigger

        console.log(
          `AuthCallbackScreen: isSocial=${isSocialProvider}, phoneMissing=${phoneMissing}, roleNeedsUpdate=${roleNeedsUpdate} (current role: ${user.user_metadata?.role})`,
        );

        if (isSocialProvider && (phoneMissing || roleNeedsUpdate)) {
          console.log(
            "AuthCallbackScreen: Social sign-in, profile needs completion. Navigating to complete-profile.",
          );
          // Pass the original redirectTo so complete-profile knows where to go next
          const targetRedirect = (redirectTo as string) || "/";
          router.replace({
            pathname: "/auth/complete-profile",
            params: { redirectTo: targetRedirect },
          } as any);
        } else {
          console.log(
            "AuthCallbackScreen: Session detected, profile complete or not social. Navigating to target.",
          );
          const targetPath = (redirectTo as string) || "/";
          router.replace(targetPath as any);
        }
      } else {
        console.log("AuthCallbackScreen: Waiting for session and user...");
        // Optional: Add a timeout here to handle cases where session never appears
        // Or rely on onAuthStateChange to eventually populate session and user
      }
      setIsCheckingProfile(false);
    };

    // If session is already present when component mounts, handle navigation
    // Otherwise, onAuthStateChange will trigger a re-render, and this effect will run again
    if (session && user) {
      handleNavigation();
    } else if (session && !user) {
      // Session exists but user object might not be fully populated in store yet,
      // or onAuthStateChange hasn't updated it. Let's try to refresh.
      // This can happen if onAuthStateChange updates session before user fully.
      console.log(
        "AuthCallbackScreen: Session present, user not. Triggering checkAuth.",
      );
      checkAuth().then(() => {
        // checkAuth will update the store, triggering a re-render
        // The effect will run again with the updated user object.
        // To prevent immediate navigation before checkAuth completes and re-renders:
        // We let the re-render handle the navigation logic.
      });
    } else {
      setIsCheckingProfile(false); // Not enough info yet, wait for onAuthStateChange
    }
  }, [session, user, router, redirectTo, otherParams, checkAuth]);

  if (isCheckingProfile || (!session && !otherParams.error)) {
    // Show loader if checking profile, or if no session and no error (still waiting for OAuth redirect processing)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.text}>Finalizing authentication...</Text>
      </View>
    );
  }

  // Fallback if navigation hasn't happened for some reason (e.g. error state not caught above)
  // Or if session is null and there was an error param (already handled, but as a safety)
  if (!session && otherParams.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Authentication failed. Redirecting...</Text>
      </View>
    );
  }
  // If still no session and no error, it means we are waiting for onAuthStateChange
  // The loader above handles this. If we reach here without session, something is unexpected.
  // This return is mostly a fallback.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.light.tint} />
      <Text style={styles.text}>Please wait...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
});
