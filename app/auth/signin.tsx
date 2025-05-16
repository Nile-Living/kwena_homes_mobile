// app/auth/signin.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, loading, error } =
    useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const success = await signIn(email, password);

    if (success) {
      const targetPath = (redirectTo as string) || "/";
      router.replace(targetPath as any);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleFacebookSignIn = async () => {
    await signInWithFacebook();
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ headerShown: true, title: "Sign In" }} />

      <View className="px-6 py-10">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/icon.png")}
            className="h-20 w-20"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Let's Get You Signed In!
        </Text>
        <Text className="text-base text-gray-500 mb-10 text-center">
          Enter your information below
        </Text>

        <View className="mb-5 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">
            Email / Phone Number
          </Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center bg-white">
            <TextInput
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 text-base text-black"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="mb-1 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">Password</Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center justify-between bg-white">
            <TextInput
              placeholder="****************"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              className="flex-1 text-base text-black mr-2"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-full items-end mb-6">
          <TouchableOpacity
            onPress={() => {
              /* Add forgot password navigation */
            }}
          >
            <Text className="text-sm font-medium text-gray-700">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className="w-full bg-customgreen rounded-lg h-14 justify-center items-center mb-6 shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm text-gray-500 mb-6 text-center">
          Or continue with
        </Text>

        <View className="w-full flex-row justify-between mb-10">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg h-14 justify-center items-center flex-row mx-1 bg-white shadow-sm"
          >
            <Image
              source={{
                uri: "https://img.icons8.com/color/48/google-logo.png",
              }}
              className="w-6 h-6 mr-2"
            />
            <Text className="text-gray-700 font-semibold text-base">
              Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFacebookSignIn}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-lg h-14 justify-center items-center flex-row mx-1 bg-white shadow-sm"
          >
            <Image
              source={{
                uri: "https://img.icons8.com/color/48/facebook-new.png",
              }}
              className="w-6 h-6 mr-2"
            />
            <Text className="text-gray-700 font-semibold text-base">
              Facebook
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-gray-500">Not our member yet? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text className="text-sm font-semibold text-customgreen">
              Register Now
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text className="mt-4 text-red-600 text-center text-sm">
            {error}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
