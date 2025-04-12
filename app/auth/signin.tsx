import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView, // Import ScrollView for potentially smaller screens
  Image, // Import Image for icons
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for the eye icon

export default function SignInScreen() {
  const [email, setEmail] = useState(""); // Keep state for email/phone
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility
  const { signIn, signInWithGoogle, loading, error } = useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const success = await signIn(email, password);

    if (success && !useAuthStore.getState().error) {
      if (redirectTo) {
        router.replace(redirectTo as any);
      } else {
        router.replace("/");
      }
    }
    // Error display is handled below
  };

  const handleGoogleSignIn = async () => {
    // Keep existing Google Sign-In logic
    await signInWithGoogle();
    // Check error state after attempt
    if (!useAuthStore.getState().error) {
      if (redirectTo) {
        router.replace(redirectTo as any); // Use replace
      } else {
        router.replace("/"); // Use replace
      }
    }
  };

  // Placeholder for Facebook Sign-In
  const handleFacebookSignIn = () => {
    Alert.alert("Coming Soon", "Facebook Sign-In is not yet implemented.");
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} // Center content vertically
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: true, title: "Sign In" }} />

      <View className="px-6 py-10">
        {/* Logo Placeholder - User will add later */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-emerald-800 rounded-2xl items-center justify-center">
            {/* Placeholder Icon/Shape representing the logo */}
            <View className="w-8 h-8 bg-white/50 rounded-md" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Let's Get You Signed In!
        </Text>
        <Text className="text-base text-gray-500 mb-10 text-center">
          Enter your information below
        </Text>

        {/* Email / Phone Input */}
        <View className="mb-5 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">
            Email / Phone Number
          </Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center bg-white">
            <TextInput
              placeholder="jadesoncreatives@gmail.com" // Example placeholder
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 text-base text-black" // Adjusted text color
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-1 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">Password</Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center justify-between bg-white">
            <TextInput
              placeholder="****************" // Example placeholder
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible} // Toggle based on state
              className="flex-1 text-base text-black mr-2" // Added margin right
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#6B7280" // Gray color for icon
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <View className="w-full items-end mb-6">
          <TouchableOpacity onPress={() => { /* Add forgot password navigation */ }}>
            <Text className="text-sm font-medium text-gray-700">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          // Adjusted color to match design (example: emerald-800)
          className="w-full bg-emerald-800 rounded-lg h-14 justify-center items-center mb-6 shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        {/* Or continue with */}
        <Text className="text-sm text-gray-500 mb-6 text-center">
          Or continue with
        </Text>

        {/* Social Logins */}
        <View className="w-full flex-row justify-between mb-10">
          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg h-14 justify-center items-center flex-row mx-1 bg-white shadow-sm" // Added bg-white and shadow
          >
            {/* Replace with actual Google icon */}
            <Image
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} // Example Google icon URL
              className="w-6 h-6 mr-2"
            />
            <Text className="text-gray-700 font-semibold text-base">
              Google
            </Text>
          </TouchableOpacity>

          {/* Facebook Button */}
          <TouchableOpacity
            onPress={handleFacebookSignIn} // Add handler if implementing
            disabled={loading} // Disable if needed
            className="flex-1 border border-gray-300 rounded-lg h-14 justify-center items-center flex-row mx-1 bg-white shadow-sm" // Added bg-white and shadow
          >
            {/* Replace with actual Facebook icon */}
             <Image
              source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }} // Example Facebook icon URL
              className="w-6 h-6 mr-2"
            />
            <Text className="text-gray-700 font-semibold text-base">
              Facebook
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-gray-500">Not our member yet? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            {/* Adjusted color to match design */}
            <Text className="text-sm font-semibold text-emerald-800">
              Register Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <Text className="mt-4 text-red-600 text-center text-sm">
            {error}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
