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
import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [userType, setUserType] = useState<UserRole>("user");
  const { signUp, signInWithGoogle, signInWithFacebook, loading, error } =
    useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
      Alert.alert(
        "Error",
        "Please enter a valid phone number with the country code (e.g. +260...)",
      );
      return;
    }

    const success = await signUp(email, password, phone, userType);

    if (success) {
      if (useAuthStore.getState().user && useAuthStore.getState().session) {
        const targetPath = (redirectTo as string) || "/";
        router.replace(targetPath as any);
      }
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
      <Stack.Screen
        options={{
          title: "Sign Up",
          headerTitle: "Create Account",
          headerBackVisible: true,
        }}
      />

      <View className="px-6 py-10">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/icon.png")}
            className="h-20 w-20"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Create Your Account
        </Text>
        <Text className="text-base text-gray-500 mb-10 text-center">
          Enter your details below
        </Text>

        <View className="mb-6">
          <Text className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
            I am signing up as a...
          </Text>
          <View className="flex-row gap-2 space-x-3">
            <TouchableOpacity
              onPress={() => setUserType("user")}
              className={`flex-1 border rounded-lg p-4 items-center ${
                userType === "user"
                  ? "bg-blue-100 border-blue-500"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={userType === "user" ? "#2563EB" : "#4B5563"}
              />
              <Text
                className={`mt-1 font-medium ${
                  userType === "user" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Regular User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUserType("agent")}
              className={`flex-1 border rounded-lg p-4 items-center ${
                userType === "agent"
                  ? "bg-blue-100 border-blue-500"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <Ionicons
                name="business-outline"
                size={24}
                color={userType === "agent" ? "#2563EB" : "#4B5563"}
              />
              <Text
                className={`mt-1 font-medium ${
                  userType === "agent" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Agent / Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-5 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">Email</Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center bg-white">
            <TextInput
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 text-base text-black"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
        <View className="mb-5 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">Password</Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center justify-between bg-white">
            <TextInput
              placeholder="Create a password"
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
        <View className="mb-5 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">
            Confirm Password
          </Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center justify-between bg-white">
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
              className="flex-1 text-base text-black mr-2"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Ionicons
                name={
                  isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"
                }
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-8 w-full">
          <Text className="text-xs text-gray-500 mb-1 ml-1">Phone Number</Text>
          <View className="border border-gray-300 rounded-lg h-14 px-4 flex-row items-center bg-white">
            <TextInput
              placeholder="+260 9..."
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="flex-1 text-base text-black"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className="w-full bg-emerald-800 rounded-lg h-14 justify-center items-center mb-6 shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Creating Account..." : "Sign Up"}
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
          <Text className="text-sm text-gray-500">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signin")}>
            <Text className="text-sm font-semibold text-emerald-800">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text className="mt-4 text-red-600 text-center text-sm">{error}</Text>
        )}
      </View>
    </ScrollView>
  );
}
