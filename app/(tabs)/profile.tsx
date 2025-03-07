import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, signInWithGoogle } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNameModalVisisble, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const supabaseUrl = "https://jdscpwxbrlbvnfsivwmp.supabase.co";

  useEffect(() => {
    fetchProfile();
    // console.log("this is the supabase url", supabaseUrl);
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: null,
                avatar_url: null,
                phone: null,
              },
            ])
            .select("*")
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        // console.log(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fix the image upload function
  const handleImagePick = async () => {
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
        // This path should match your policy expectations
        const fileName = `${user.id}/avatar.${fileExtension}`;

        // Read the file as a base64 string
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to ArrayBuffer
        const buffer = Uint8Array.from(atob(base64), (c) =>
          c.charCodeAt(0)
        ).buffer;

        // Upload directly to the existing bucket
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(fileName, buffer, {
            contentType: `image/${fileExtension}`,
            upsert: true,
          });

        if (error) throw error;

        // Use the getPublicUrl method to get the correct URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        // Update profile with the correct public URL
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
      router.push('/auth/signin');
      return;
    }
    
    setNameInput(profile?.full_name || '');
    setNameModalVisible(true);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user?.id);

      if (error) throw error;
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Navigation handlers with auth checks
  const handleNavigateToProperties = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to view your properties");
      router.push("/auth/signin");
    } else {
      router.push("/properties");
    }
  };

  const handleNavigateToAddProperty = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to add a property");
      router.push("/auth/signin");
    } else {
      router.push("/property/new");
    }
  };

  const handleNavigateToSettings = () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to access settings");
      router.push("/auth/signin");
    } else {
      router.push("/settings");
    }
  };

  // Handle auth action based on current state
  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      router.push("/auth/signin");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center p-6">
        <TouchableOpacity onPress={handleImagePick} className="mb-4">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={40} color="gray" />
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full">
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdateName}>
          <Text className="text-xl font-bold mb-4">
            {profile?.full_name || (user ? "Add your name" : "Welcome Guest")}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-6">
        {/* My Properties Button */}
        <TouchableOpacity
          onPress={handleNavigateToProperties}
          className="flex-row items-center p-4 bg-white rounded-lg shadow mb-4"
        >
          <Ionicons name="home" size={24} color="#0f172a" />
          <Text className="ml-4 text-lg text-gray-900">My Properties</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#0f172a"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Add Property Button */}
        <TouchableOpacity
          onPress={handleNavigateToAddProperty}
          className="flex-row items-center p-4 bg-white rounded-lg shadow mb-4"
        >
          <Ionicons name="add-circle" size={24} color="#0f172a" />
          <Text className="ml-4 text-lg text-gray-900">Add Property</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#0f172a"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={handleNavigateToSettings}
          className="flex-row items-center p-4 bg-white rounded-lg shadow mb-4"
        >
          <Ionicons name="settings-outline" size={24} color="#0f172a" />
          <Text className="ml-4 text-lg text-gray-900">Settings</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#0f172a"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Sign In/Out Button - dynamic based on auth state */}
        <TouchableOpacity
          onPress={handleAuthAction}
          className={`flex-row items-center p-4 rounded-lg ${
            user ? "bg-red-50" : "bg-green-50"
          }`}
        >
          <Ionicons
            name={user ? "log-out" : "log-in"}
            size={24}
            color={user ? "#ef4444" : "#3b82f6"}
          />
          <Text
            className={`ml-4 text-lg ${
              user ? "text-red-500" : "text-green-700"
            }`}
          >
            {user ? "Sign Out" : "Sign In"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
  animationType="slide"
  transparent={true}
  visible={isNameModalVisisble}
  onRequestClose={() => setNameModalVisible(false)}
>
  <View className="flex-1 justify-center items-center" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
    <View className="bg-white p-6 rounded-lg w-4/5">
      <Text className="text-lg font-bold mb-4">Update Your Name</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded-md mb-4"
        value={nameInput}
        onChangeText={setNameInput}
        placeholder="Enter your full name"
      />
      <View className="flex-row justify-end">
        <TouchableOpacity 
          onPress={() => setNameModalVisible(false)}
          className="px-4 py-2 mr-2"
        >
          <Text className="text-gray-500">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            if (nameInput && nameInput.trim()) {
              updateProfile({ full_name: nameInput.trim() });
              setNameModalVisible(false);
            }
          }}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}
