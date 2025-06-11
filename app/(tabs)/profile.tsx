import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  created_at?: string;
  role?: 'user' | 'agent' | null;
}

const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (years > 0) return `Joined ${years} year${years > 1 ? 's' : ''} ago`;
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (months > 0) return `Joined ${months} month${months > 1 ? 's' : ''} ago`;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `Joined ${days} day${days > 1 ? 's' : ''} ago`;
  return 'Joined recently';
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const colorScheme = useColorScheme();

  const iconColors = {
    guestIcon: colorScheme === 'dark' ? '#94a3b8' : 'gray',
    avatarPlaceholder: colorScheme === 'dark' ? '#94a3b8' : 'gray',
    listItem: colorScheme === 'dark' ? '#cbd5e1' : '#4B5563',
    chevron: colorScheme === 'dark' ? '#64748b' : '#9CA3AF',
    signOutIcon: '#EF4444',
  };

  const activityIndicatorLoadingColor =
    colorScheme === 'dark' ? '#14532d' : '#f3f4f6';

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*, created_at, role')
        .eq('id', user.id)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(
            "Profile not found, creating one with default role 'user'...",
          );
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email, role: 'user' }])
            .select('*, created_at, role')
            .single();
          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching/creating profile:', error);
      Alert.alert('Error', 'Could not load profile data.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Please sign in to update your profile image',
      );
      router.push('/auth/signin');
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
        const fileExtension = uri.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExtension}`;
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const buffer = Uint8Array.from(atob(base64), (c) =>
          c.charCodeAt(0),
        ).buffer;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, buffer, {
            contentType: `image/${fileExtension}`,
            upsert: true,
          });
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await updateProfile({ avatar_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload failed', 'There was a problem uploading your image');
    }
  };

  const handleUpdateName = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to update your profile');
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/(tabs)/profile' },
      });
      return;
    }
    setNameInput(profile?.full_name || '');
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
    if (!user) return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToProperties = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to view your properties');
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/properties' },
      });
    } else {
      router.push('/properties');
    }
  };

  // --- FIX: Correct navigation handler for promoted properties ---
  const handleNavigateToPromotedProperties = () => {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Please sign in to view your promoted properties',
      );
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/promoted' }, // Correct route
      });
    } else {
      router.push('/promoted'); // Correct route
    }
  };

  const handleNavigateToSaved = () => {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Please sign in to view saved properties',
      );
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/(tabs)/saved' },
      });
    } else {
      router.push('/(tabs)/saved');
    }
  };

  const handleNavigateToAddProperty = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to add a property');
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/property/new' },
      });
    } else {
      router.push('/property/new');
    }
  };

  const handleNavigateToSettings = () => {
    router.push('/settings');
  };

  const handleNavigateToEditProfile = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to edit your profile');
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/(tabs)/profile' },
      });
    } else {
      handleUpdateName();
    }
  };

  const handleNavigateToSubscription = () => {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Please sign in to manage your subscription',
      );
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/subscription' },
      });
    } else {
      router.push('/subscriptions/subscriptionScreen');
    }
  };

  const handleNavigateToSavedSearches = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to manage saved searches');
      router.push({
        pathname: '/auth/signin',
        params: { redirectTo: '/saved-searches' },
      });
    } else {
      router.push('/settings/saveSearchScreen/SavedSearchScreen');
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setProfile(null);
    setLoading(false);
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <Stack.Screen options={{ headerShown: false, title: 'Profile' }} />
        <ActivityIndicator
          size="large"
          color={activityIndicatorLoadingColor}
        />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 p-6">
        <Stack.Screen options={{ title: 'Profile', headerShown: false }} />
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={iconColors.guestIcon}
        />
        <Text className="text-xl font-bold my-4 text-gray-900 dark:text-gray-100">
          Welcome Guest
        </Text>
        <Text className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to manage your profile, properties, and saved items.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/auth/signin')}
          className="w-full bg-[#ED9B6B] dark:bg-[#ED9B6B] rounded-lg h-12 justify-center items-center shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Sign In / Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen options={{ headerShown: false, title: 'Profile' }} />
      <View className="items-center pt-8 pb-6 bg-white dark:bg-slate-900 mt-12">
        <TouchableOpacity onPress={handleImagePick} className="mb-3 relative">
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center border-2 border-gray-300 dark:border-gray-600">
              <Ionicons
                name="person-outline"
                size={48}
                color={iconColors.avatarPlaceholder}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNavigateToEditProfile}>
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {profile?.full_name || 'Update Your Name'}
          </Text>
        </TouchableOpacity>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {getTimeAgo(profile?.created_at || user?.created_at)}
        </Text>
      </View>

      <View className="p-4 mt-4">
        {profile?.role === 'agent' && (
          <>
            <TouchableOpacity
              onPress={handleNavigateToProperties}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="business-outline"
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  My Properties
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>

            {/* --- THE FIX IS HERE --- */}
            <TouchableOpacity
              onPress={handleNavigateToPromotedProperties} // 2. The corrected navigation handler
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="rocket-outline" // 1. The new, distinct icon for promoted properties
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  My Promoted Properties
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>
            {/* --- END OF FIX --- */}

            <TouchableOpacity
              onPress={handleNavigateToAddProperty}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  Add Property
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>
          </>
        )}

        {profile?.role === 'user' && (
          <>
            <TouchableOpacity
              onPress={handleNavigateToEditProfile}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  Edit Profile
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateToSaved}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="heart-outline"
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  Saved Property
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateToSubscription}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="star-outline"
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  Subscription
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateToSavedSearches}
              className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={iconColors.listItem}
                />
                <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
                  Saved Searches
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={iconColors.chevron}
              />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleNavigateToSettings}
          className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-3"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="options-outline"
              size={22}
              color={iconColors.listItem}
            />
            <Text className="ml-4 text-base text-gray-700 dark:text-gray-200">
              Settings
            </Text>
          </View>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color={iconColors.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          disabled={loading}
          className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm mt-4"
        >
          <View className="flex-row items-center">
            <Ionicons
              name="log-out-outline"
              size={24}
              color={iconColors.signOutIcon}
            />
            <Text className="ml-4 text-base text-red-600 dark:text-red-500">
              Sign Out
            </Text>
          </View>
          {loading && (
            <ActivityIndicator size="small" color={iconColors.signOutIcon} />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isNameModalVisible}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white dark:bg-slate-700 p-6 rounded-lg w-4/5 shadow-xl">
            <Text className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Update Your Name
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-md mb-5 text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your full name"
              autoCapitalize="words"
              placeholderTextColor={
                colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'
              }
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setNameModalVisible(false)}
                className="px-4 py-2 rounded"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveNameUpdate}
                className="bg-emerald-700 dark:bg-dark-tint px-5 py-2 rounded shadow-sm"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});