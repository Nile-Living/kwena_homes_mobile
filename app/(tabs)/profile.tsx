import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import Config from "react-native-config";
import * as FileSystem from 'expo-file-system';

interface Profile {
    id: string,
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
    const supabaseUrl = Config.SUPABASE_URL;

    useEffect(() => {
        fetchProfile()
    }, [user]);

    const fetchProfile = async () => {
        try {
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        if (!user) {
            Alert.alert("Sign in required", "Please sign in to update your profile image");
            router.push('/auth/signin');
            return;
        }
        
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const fileExtension = uri.split('.').pop();
                const fileName = `${user.id}/avatar.${fileExtension}`;
                
                // Use FileSystem for direct upload
                const fileInfo = await FileSystem.getInfoAsync(uri);
                
                if (!fileInfo.exists) {
                    throw new Error("File doesn't exist");
                }
                
                // Upload directly using FileSystem
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, {
                        uri,
                        type: `image/${fileExtension}`,
                        name: `avatar.${fileExtension}`,
                    }, {
                        upsert: true,
                        contentType: `image/${fileExtension}`
                    });

                if (error) throw error;

                // Get public URL
                const avatar_url = `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`;
                await updateProfile({ avatar_url });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert("Upload failed", "There was a problem uploading your image");
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user?.id);
    
          if (error) throw error;
          fetchProfile();
        } catch (error) {
          console.error('Error updating profile:', error);
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
            router.push('/auth/signin');
        } else {
            router.push('/properties/index');
        }
    };

    const handleNavigateToAddProperty = () => {
        if (!user) {
            Alert.alert("Sign in required", "Please sign in to add a property");
            router.push('/auth/signin');
        } else {
            router.push('/property/new');
        }
    };

    const handleNavigateToSettings = () => {
        if (!user) {
            Alert.alert("Sign in required", "Please sign in to access settings");
            router.push('/auth/signin');
        } else {
            router.push('/settings/index');
        }
    };

    // Handle auth action based on current state
    const handleAuthAction = () => {
        if (user) {
            signOut();
        } else {
            router.push('/auth/signin');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
          <View className="items-center p-6">
            <TouchableOpacity
              onPress={handleImagePick}
              className="mb-4"
            >
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
    
            <Text className="text-xl font-bold mb-4">
              {profile?.full_name || (user ? 'Add your name' : 'Welcome Guest')}
            </Text>
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
                style={{ marginLeft: 'auto' }}
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
                style={{ marginLeft: 'auto' }}
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
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
    
            {/* Sign In/Out Button - dynamic based on auth state */}
            <TouchableOpacity
              onPress={handleAuthAction}
              className={`flex-row items-center p-4 rounded-lg ${user ? 'bg-red-50' : 'bg-blue-50'}`}
            >
              <Ionicons 
                name={user ? "log-out" : "log-in"} 
                size={24} 
                color={user ? "#ef4444" : "#3b82f6"} 
              />
              <Text 
                className={`ml-4 text-lg ${user ? 'text-red-500' : 'text-blue-500'}`}
              >
                {user ? 'Sign Out' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    ); 
}