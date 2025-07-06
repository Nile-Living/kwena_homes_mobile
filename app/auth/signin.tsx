import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signIn, signInWithGoogle, loading, error } = useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();

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
  const success = await signInWithGoogle();
  
  if (success) {
    setTimeout(() => {
      const targetPath = (redirectTo as string) || "/";
      router.replace(targetPath as any);
    }, 20);
  }
}

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-slate-800"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-6 py-10">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/icon.png")}
            className="h-20 w-20"
          />
        </View>

        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2 text-center">
          Let's Get You Signed In!
        </Text>
        <Text className="text-base text-slate-500 dark:text-slate-400 mb-10 text-center">
          Enter your information below
        </Text>

        <View className="mb-5 w-full">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-1">
            Email / Phone Number
          </Text>
          <View className="border border-slate-300 dark:border-slate-600 rounded-lg h-14 px-4 flex-row items-center bg-white dark:bg-slate-700">
            <TextInput
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 text-base text-slate-900 dark:text-slate-100"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className="mb-1 w-full">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-1">
            Password
          </Text>
          <View className="border border-slate-300 dark:border-slate-600 rounded-lg h-14 px-4 flex-row items-center justify-between bg-white dark:bg-slate-700">
            <TextInput
              placeholder="****************"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              className="flex-1 text-base text-slate-900 dark:text-slate-100 mr-2"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={24}
                color={colorScheme === "dark" ? "#94a3b8" : "#64748b"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="w-full items-end mb-6">
          <TouchableOpacity
            onPress={() => {
              // router.push("/auth/forgot-password");
            }}
          >
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSignIn}
          disabled={loading}
          className={`w-full rounded-lg h-14 justify-center items-center mb-6 shadow-sm 
            ${loading ? "bg-slate-400 dark:bg-slate-500" : "bg-customgreen dark:bg-dark-tint"}`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
          Or continue with
        </Text>

        <View className="w-full flex-row justify-between mb-10">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg h-14 justify-center items-center flex-row mx-1 bg-white dark:bg-slate-700 shadow-sm"
          >
            <Image
              source={{
                uri: "https://img.icons8.com/color/48/google-logo.png",
              }}
              className="w-6 h-6 mr-2"
            />
            <Text className="text-slate-700 dark:text-slate-200 font-semibold text-base">
              Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Not our member yet?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text className="text-sm font-semibold text-customgreen dark:text-green-400">
              Register Now
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text className="mt-4 text-red-600 dark:text-red-500 text-center text-sm">
            {error}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}