import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="items-center px-6">
        <Ionicons name="checkmark-circle" size={100} color="#16A34A" />

        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-6 text-center">
          Subscription Activated!
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 text-lg leading-6">
          You can now save searches and receive property alerts.
        </Text>

        <View className="mt-8 flex flex-col gap-4 w-full">
          <TouchableOpacity
            className="bg-customgreen dark:bg-dark-tint p-4 rounded-xl"
            onPress={() => router.push('/subscriptions/subscriptionScreen')}
          >
            <Text className="text-white text-center font-semibold text-lg">
              View Subscription
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