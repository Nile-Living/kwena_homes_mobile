import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signInWithGoogle, loading, error } = useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await signIn(email, password);
    if (!error) {
      if (redirectTo) {
        router.push(redirectTo as any);
      } else {
        router.push("/");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    if (!error) {
      if (redirectTo) {
        router.push(redirectTo as any);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <View className="flex-1 flex flex-col gap- bg-white px-6 py-12">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
        Sign In
      </Text>

      <View className="space-y-4 flex flex-col gap-6">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base"
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="space-y-4 mt-8 flex flex-col gap-6">
        <TouchableOpacity 
          onPress={handleSignIn} 
          disabled={loading}
          className="w-full h-12 bg-green-800 rounded-lg items-center justify-center"
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleGoogleSignIn} 
          disabled={loading}
          className="w-full h-12 bg-white border border-gray-300 rounded-lg items-center justify-center"
        >
          <Text className="text-gray-700 text-base font-semibold">
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        onPress={() => router.push("/auth/signup")}
        className="mt-6"
      >
        <Text className="text-green-800 text-center text-base">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>

      {error && (
        <Text className="mt-4 text-red-500 text-center">
          {error}
        </Text>
      )}
    </View>
  );
}