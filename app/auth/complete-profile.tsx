import React, { useState, useEffect } from "react";
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
import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CompleteProfileScreen() {
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserRole>("user");
  const { updateUserProfile, loading: authLoading, error: authError } =
    useAuthStore();
  const router = useRouter();
  const { redirectTo } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleCompleteProfile = async () => {
    if (!phone || !userType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
      Alert.alert(
        "Error",
        "Please enter a valid phone number with the country code (e.g. +260...). It should be linked to your WhatsApp.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    const success = await updateUserProfile({ phone, role: userType });
    setIsLoading(false);

    if (success) {
      const targetPath = (redirectTo as string) || "/";
      router.replace(targetPath as any);
    } else {
      if (!authError) {
        setError("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-slate-800"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen
        options={{
          title: "Complete Your Profile",
          headerBackVisible: false,
          headerStyle: {
            backgroundColor: "#FFFFFF", // Light mode header
          },
          headerTintColor: "#1F2937", // Light mode text
          // Dark mode header styles can be set globally or via theme listener if needed
        }}
      />

      <View className="px-6 py-10">
        <View className="items-center mb-8">
          <Image
            source={require("@/assets/images/icon.png")}
            className="h-20 w-20 mb-2.5"
          />
          <Text className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2 text-center">
            Almost There!
          </Text>
          <Text className="text-base text-slate-600 dark:text-slate-400 text-center mb-5">
            Please provide a few more details to complete your profile.
          </Text>
        </View>

        <View className="mb-5">
          <Text className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
            I am signing up as a...
          </Text>
          <View className="flex-row justify-between gap-2.5">
            <TouchableOpacity
              onPress={() => setUserType("user")}
              className={`flex-1 border rounded-lg p-4 items-center 
                ${
                  userType === "user"
                    ? "bg-customgreen/10 border-customgreen dark:bg-customgreen/20"
                    : "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
                }`}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  userType === "user"
                    ? "#54816D" /* customgreen */
                    : "#4B5563" /* slate-600 */
                }
              />
              <Text
                className={`mt-1 font-medium ${
                  userType === "user"
                    ? "text-customgreen"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Regular User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUserType("agent")}
              className={`flex-1 border rounded-lg p-4 items-center 
                ${
                  userType === "agent"
                    ? "bg-customgreen/10 border-customgreen dark:bg-customgreen/20"
                    : "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
                }`}
            >
              <Ionicons
                name="business-outline"
                size={24}
                color={
                  userType === "agent"
                    ? "#54816D" /* customgreen */
                    : "#4B5563" /* slate-600 */
                }
              />
              <Text
                className={`mt-1 font-medium ${
                  userType === "agent"
                    ? "text-customgreen"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Agent / Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-sm text-slate-600 dark:text-slate-400 mb-1.5 ml-1">
            WhatsApp Phone Number{" "}
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              (e.g., +260..., used for communication)
            </Text>
          </Text>
          <View className="border border-slate-300 dark:border-slate-600 rounded-lg h-14 px-4 flex-row items-center bg-white dark:bg-slate-700">
            <TextInput
              placeholder="+260 9..."
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="flex-1 text-base text-slate-800 dark:text-slate-200"
              placeholderTextColor="#9CA3AF" // slate-400
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCompleteProfile}
          disabled={isLoading || authLoading}
          className={`bg-customgreen rounded-lg h-14 justify-center items-center mt-2.5 shadow
            ${(isLoading || authLoading) ? "bg-slate-400 dark:bg-slate-500" : "bg-customgreen dark:bg-dark-tint"}`}
        >
          {isLoading || authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Complete Profile
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text className="mt-4 text-red-600 dark:text-red-500 text-center text-sm">
            {error}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}