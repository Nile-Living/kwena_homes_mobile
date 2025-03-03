import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const { signUp, loading, error } = useAuthStore();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
  
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }
  
    const success = await signUp(email, password, phone);
    
    if (success) {
      router.push("/");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-12">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-8">
        Sign Up
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

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base"
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mt-8">
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className="w-full h-12 bg-green-800 rounded-lg items-center justify-center"
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/auth/signin")}
        className="mt-6"
      >
        <Text className="text-green-800 text-center text-base">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>

      {error && <Text className="mt-4 text-red-500 text-center">{error}</Text>}
    </View>
  );
}
