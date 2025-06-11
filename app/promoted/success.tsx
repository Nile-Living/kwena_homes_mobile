// app/promote/success.tsx
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PromotionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId: string;
    propertyTitle?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="items-center px-6">
        <Ionicons name="checkmark-circle" size={100} color="#16A34A" />

        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-6 text-center">
          Promotion Activated!
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 text-lg leading-6">
          Your property "{params.propertyTitle}" is now promoted and will
          receive increased visibility.
        </Text>

        <View className="mt-8 space-y-4 w-full">
          <TouchableOpacity
            className="bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl"
            onPress={() => router.push(`/property/${params.propertyId}`)}
          >
            <Text className="text-white text-center font-semibold text-lg">
              View Property
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 dark:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 py-4 rounded-xl"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text className="text-gray-800 dark:text-gray-200 text-center font-semibold">
              View My Listings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-300 dark:border-slate-700 active:bg-gray-100 dark:active:bg-slate-800 py-4 rounded-xl"
            onPress={() => router.push('/')}
          >
            <Text className="text-gray-800 dark:text-gray-200 text-center font-semibold">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}