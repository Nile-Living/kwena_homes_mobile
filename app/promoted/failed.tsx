// app/promote/failed.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PromotionFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId: string;
    reason?: string;
  }>();

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <Ionicons name="close-circle" size={100} color="#DC2626" />
      
      <Text className="text-3xl font-bold text-gray-900 mt-6 text-center">
        Payment Failed
      </Text>
      
      <Text className="text-gray-600 text-center mt-4 text-lg leading-6">
        {params.reason || 'There was an issue processing your payment. Please try again.'}
      </Text>

      <View className="mt-8 space-y-4 w-full">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 py-4 rounded-lg"
          onPress={() => router.push('/')}
        >
          <Text className="text-gray-700 text-center font-semibold">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}