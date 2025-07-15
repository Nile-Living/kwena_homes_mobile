// app/promoted/index.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { useStore as usePropertyStore, Property } from '@/store/useStore';
import PropertyCard from '@/components/PropertyCard';
import { useColorScheme } from 'nativewind';

export default function ViewAllPromotedScreen() {
  const {
    featuredProperties,
    loadingFeatured,
    errorFeatured,
    fetchFeaturedProperties,
  } = usePropertyStore();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const renderItem = ({ item }: { item: Property }) => (
    <View className="mb-4">
      <PropertyCard property={item} />
    </View>
  );

  if (loadingFeatured) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? '#FFFFFF' : '#1F2937'}
        />
        <Text className="mt-2 text-gray-600 dark:text-slate-300">
          Loading Promoted Properties...
        </Text>
      </SafeAreaView>
    );
  }

  if (errorFeatured) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900 px-4">
        <Text className="text-red-500 text-center">{errorFeatured}</Text>
      </SafeAreaView>
    );
  }

  const actualPromotedProperties = featuredProperties.filter(
    (p) => p.is_promoted,
  );

  if (!actualPromotedProperties || actualPromotedProperties.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
        <Stack.Screen options={{ title: 'Promoted Properties' }} />
        <Text className="text-gray-600 dark:text-slate-300">
          No promoted properties found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
      <Stack.Screen options={{ title: 'Promoted Properties' }} />
      <FlatList
        data={actualPromotedProperties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}