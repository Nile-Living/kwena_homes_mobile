import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    reason?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="items-center px-6">
        <Ionicons name="close-circle" size={100} color="#DC2626" />

        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-6 text-center">
          Subscription Payment Failed
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 text-lg leading-6">
          {params.reason ||
            'There was an issue processing your subscription payment. Please try again.'}
        </Text>

        <View className="mt-8 space-y-4 w-full">
          <TouchableOpacity
            className="bg-indigo-600 active:bg-indigo-700 py-4 rounded-xl"
            onPress={() => router.push('/subscriptions/subscriptionScreen')}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 dark:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700 py-4 rounded-xl"
            onPress={() => router.push('/(tabs)')}
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