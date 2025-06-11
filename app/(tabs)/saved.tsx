import { StyleSheet, FlatList, View, Text, useColorScheme } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useStore } from "@/store/useStore";
import PropertyCard from "@/components/PropertyCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { RefreshControl } from "react-native-gesture-handler";

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const {
    properties,
    savedProperties,
    toggleSavedProperty,
    loading,
    fetchSavedProperties,
    error,
  } = useStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchSavedProperties();
    }
  }, [user, fetchSavedProperties, router]);

  const savedPropertyItems = properties.filter((property) =>
    savedProperties.includes(property.id)
  );

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  const handleLikePress = (propertyId: string) => {
    toggleSavedProperty(propertyId);
  };

  const handleRefresh = () => {
    if (user) {
      fetchSavedProperties();
    }
  };

  if (loading && savedPropertyItems.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && savedPropertyItems.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.errorText}>Error loading saved properties.</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        {/* Optionally add a retry button */}
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      className={`${colorScheme === "dark" ? "bg-slate-950" : "bg-white"} mt-7`}
    >
      <Stack.Screen options={{ title: "Saved", headerShown: false }} />
      {savedPropertyItems.length === 0 ? (
        <View
          style={styles.emptyState}
         
        >
          <Text style={styles.emptyStateText}  className={`${
            colorScheme === "dark" ? "text-slate-400" : "text-gray-600"
          }`}>No saved properties yet</Text>
          <Text style={styles.emptyStateSubtext}  className={`${
            colorScheme === "dark" ? "text-slate-400" : "text-gray-600"
          }`}>
            Properties you save will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedPropertyItems}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item.id)}
              onLike={() => handleLikePress(item.id)}
              isLiked={true}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={Colors.light.tint}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1, // Ensure content container grows if list is short
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    // color: Colors.light.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    // color: "#666",
    textAlign: "center",
  },
  errorText: {
    // Style for error message
    fontSize: 18,
    fontWeight: "600",
    color: "red", // Or your error color
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    // Style for error details
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
