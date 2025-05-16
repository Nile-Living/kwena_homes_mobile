import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator, // Import ActivityIndicator for loading state
  StyleSheet, // Keep StyleSheet for modal overlay potentially
} from "react-native";
import { useRouter, Stack } from "expo-router"; // Import Stack
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Colors } from "@/constants/Colors"; 
import { useColorScheme } from "react-native";

// Interface for Profile data
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  created_at?: string;
  role?: "user" | "agent" | null;
}

// Helper function to calculate time ago (simplified version)
const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (years > 0) return `Joined ${years} year${years > 1 ? "s" : ""} ago`;
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months > 0) return `Joined ${months} month${months > 1 ? "s" : ""} ago`;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `Joined ${days} day${days > 1 ? "s" : ""} ago`;
  return "Joined recently";
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore(); // Removed signInWithGoogle if not used here
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Ensure role is selected (using * includes it)
      const { data, error } = await supabase
        .from("profiles")
        .select("*, created_at, role")
        .eq("id", user.id)
        .single();
      if (error) {
        if (error.code === "PGRST116") {
          console.log(
            "Profile not found, creating one with default role 'user'..."
          );
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{ id: user.id, email: user.email, role: "user" }])
            .select("*, created_at, role")
            .single(); // Add role on creation
          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error("Error fetching/creating profile:", error);
      Alert.alert("Error", "Could not load profile data.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    // ... (Keep existing image pick and upload logic)
    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in to update your profile image"
      );
      router.push("/auth/signin");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const fileExtension = uri.split(".").pop();
        const fileName = `${user.id}/avatar.${fileExtension}`;
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const buffer = Uint8Array.from(atob(base64), (c) =>
          c.charCodeAt(0)
        ).buffer;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, buffer, {
            contentType: `image/${fileExtension}`,
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);
        await updateProfile({ avatar_url: publicUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload failed", "There was a problem uploading your image");
    }
  };

  const handleUpdateName = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to update your profile");
      router.push({
        pathname: "/auth/signin",
        params: { redirectTo: "/(tabs)/profile" },
      });
      return;
    } // Ensure redirect works with tabs
    setNameInput(profile?.full_name || "");
    setNameModalVisible(true);
  };

  const saveNameUpdate = async () => {
    if (
      nameInput &&
      nameInput.trim() &&
      profile?.full_name !== nameInput.trim()
    ) {
      await updateProfile({ full_name: nameInput.trim() });
    }
    setNameModalVisible(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return; // Should not happen if called correctly, but safe check
    try {
      setLoading(true); // Indicate loading during update
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      // Refetch profile to show updated data
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Update Failed", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToProperties = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to view your properties");
      router.push({
        pathname: "/auth/signin",
        params: { redirectTo: "/properties" },
      });
    } else {
      router.push("/properties");
    }
  };

  const handleNavigateToSaved = () => {
    // For Regular Users
    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in to view saved properties"
      );
      router.push({
        pathname: "/auth/signin",
        params: { redirectTo: "/(tabs)/saved" },
      });
    } // Redirect to saved tab
    else {
      router.push("/(tabs)/saved");
    } // Navigate to saved tab
  };

  const handleNavigateToAddProperty = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to add a property");
      router.push({
        pathname: "/auth/signin",
        params: { redirectTo: "/property/new" },
      });
    } else {
      router.push("/property/new");
    }
  };
  const handleNavigateToSettings = () => {
    // Assuming settings doesn't strictly require login, or add check if needed
    router.push("/settings"); // Example: Navigate to settings screen
  };
  const handleNavigateToEditProfile = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to edit your profile");
      router.push({
        pathname: "/auth/signin",
        params: { redirectTo: "/(tabs)/profile" },
      });
    } // Redirect back to profile after sign in
    else {
      // Navigate to a dedicated Edit Profile screen if you have one,
      // or trigger the name modal directly if that's the only edit action for now.
      handleUpdateName(); // Example: Trigger name modal directly
      // router.push("/profile/edit"); // Example: Navigate to edit screen
    }
  };

  // Sign Out handler
  const handleSignOut = async () => {
    setLoading(true); // Show loading during sign out
    await signOut();
    setProfile(null); // Clear profile state on sign out
    setLoading(false);
  };

  if (loading && !profile) {
    // Show full screen loader only on initial load
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ headerShown: false, title: "Profile" }} />
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Stack.Screen options={{ title: "Profile", headerShown: false }} />
        <Ionicons name="person-circle-outline" size={80} color="gray" />
        <Text className="text-xl font-bold my-4">Welcome Guest</Text>
        <Text className="text-center text-gray-500 mb-8">
          Sign in to manage your profile, properties, and saved items.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/signin")}
          className="w-full bg-emerald-700 rounded-lg h-12 justify-center items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Sign In / Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false, title: "Profile" }} />
      <View className="items-center pt-8 pb-6 bg-white mt-12">
        <TouchableOpacity onPress={handleImagePick} className="mb-3 relative">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-24 h-24 rounded-full border-2 border-gray-200"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center border-2 border-gray-300">
              <Ionicons name="person-outline" size={48} color="gray" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigateToEditProfile}>
          <Text className="text-xl font-bold text-gray-800">
            {profile?.full_name || "Update Your Name"}
          </Text>
        </TouchableOpacity>
        <Text className="text-sm text-gray-500 mt-1">
          {getTimeAgo(profile?.created_at || user?.created_at)}
        </Text>
      </View>

      <View className="p-4 mt-4">
        {profile?.role === "agent" && (
          <>
            <TouchableOpacity
              onPress={handleNavigateToProperties}
              className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="business-outline" size={22} color="#4B5563" />
                <Text className="ml-4 text-base text-gray-700">
                  My Properties
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateToAddProperty}
              className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={24} color="#4B5563" />
                <Text className="ml-4 text-base text-gray-700">
                  Add Property
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </>
        )}

        {profile?.role === "user" && (
          <>
            <TouchableOpacity
              onPress={handleNavigateToEditProfile}
              className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={22} color="#4B5563" />
                <Text className="ml-4 text-base text-gray-700">
                  Edit Profile
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateToSaved}
              className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="heart-outline" size={22} color="#4B5563" />
                <Text className="ml-4 text-base text-gray-700">
                  Saved Property
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleNavigateToSettings}
          className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-3"
        >
          <View className="flex-row items-center">
            <Ionicons name="options-outline" size={22} color="#4B5563" />
            <Text className="ml-4 text-base text-gray-700">Settings</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          disabled={loading}
          className="flex-row items-center justify-between p-4 bg-white rounded-lg shadow-sm mt-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text className="ml-4 text-base text-red-600">Sign Out</Text>
          </View>
          {loading && <ActivityIndicator size="small" color="#EF4444" />}
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isNameModalVisible}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white p-6 rounded-lg w-4/5 shadow-xl">
            <Text className="text-lg font-semibold mb-4 text-gray-800">
              Update Your Name
            </Text>
            <TextInput
              className="border border-gray-300 p-3 rounded-md mb-5 text-base"
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setNameModalVisible(false)}
                className="px-4 py-2 rounded"
              >
                <Text className="text-gray-600 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveNameUpdate}
                className="bg-emerald-700 px-5 py-2 rounded shadow-sm"
              >
                <Text className="text-white font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
