// app/promote/success.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PromotionSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId: string;
    propertyTitle?: string;
  }>();

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <Ionicons name="checkmark-circle" size={100} color="#16A34A" />
      
      <Text className="text-3xl font-bold text-gray-900 mt-6 text-center">
        Promotion Activated!
      </Text>
      
      <Text className="text-gray-600 text-center mt-4 text-lg leading-6">
        Your property "{params.propertyTitle}" is now promoted and will receive 
        increased visibility.
      </Text>

      <View className="mt-8 space-y-4 w-full">
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-lg"
          onPress={() => router.push(`/property/${params.propertyId}`)}
        >
          <Text className="text-white text-center font-semibold text-lg">
            View Property
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-100 py-4 rounded-lg"
          onPress={() => router.push('/properties')}
        >
          <Text className="text-gray-700 text-center font-semibold">
            View My Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-gray-300 py-4 rounded-lg"
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