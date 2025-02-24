import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";	
import * as ImagePicker from 'expo-image-picker';
import Config from "react-native-config";

interface Profile {
    id: string,
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { user, signOut } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabaseUrl = Config.SUPABASE_URL;

    useEffect(() => {
        fetchProfile()
    }, []);

    const fetchProfile = async () => {
        try {
            if (!user) return;

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
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const file = {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                };

                const { data, error} = await supabase.storage
                    .from('avatars')
                    .upload(`${user?.id}/avatar.jpg`, file, {
                        upsert: true
                    });

                    if (error) throw error;

                    const avatar_url = `${supabaseUrl}/storage/v1/object/public/avatart/${data.path}`;
                    await updateProfile({ avatar_url: avatar_url});
            }
        } catch (error) {
            console.error('Error uploading image:', error);
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
              {profile?.full_name || 'Add your name'}
            </Text>
          </View>
    
          <View className="p-6">
            {/* My Properties Button */}
            <TouchableOpacity
            //   onPress={() => router.push('/properties')}
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
            //   onPress={() => router.push('/properties/new')}
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
            //   onPress={() => router.push('/settings')}
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
    
            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={signOut}
              className="flex-row items-center p-4 bg-red-50 rounded-lg"
            >
              <Ionicons name="log-out" size={24} color="#ef4444" />
              <Text className="ml-4 text-lg text-red-500">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ); 
}