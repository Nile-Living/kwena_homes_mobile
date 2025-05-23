import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { Stack } from "expo-router";
import {
  useStore as usePropertyStore,
  Property,
} from "@/store/useStore"; // Assuming Property type is exported from useStore
import PropertyCard from "@/components/PropertyCard"; // Adjust path

export default function ViewAllPromotedScreen() {
  const {
    featuredProperties,
    loadingFeatured,
    errorFeatured,
    fetchFeaturedProperties,
  } = usePropertyStore();
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const renderItem = ({ item }: { item: Property }) => (
    // Replace with your actual PropertyCard component
    <PropertyCard property={item} />

  );

  if (loadingFeatured) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-800">
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
        />
        <Text className="mt-2 text-gray-600 dark:text-slate-300">
          Loading Promoted Properties...
        </Text>
      </SafeAreaView>
    );
  }

  if (errorFeatured) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-800">
        <Text className="text-red-500 text-center px-4">
          {errorFeatured}
        </Text>
      </SafeAreaView>
    );
  }

  const actualPromotedProperties = featuredProperties.filter(
    (p) => p.is_promoted,
  );

  if (!actualPromotedProperties || actualPromotedProperties.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-800">
        <Text className="text-gray-600 dark:text-slate-300">
          No promoted properties found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-800">
      <Stack.Screen options={{ title: "Promoted Properties" }} />
      <FlatList
        data={actualPromotedProperties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
