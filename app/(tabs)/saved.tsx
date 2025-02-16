import { StyleSheet, FlatList, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import PropertyCard from "@/components/PropertyCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Colors } from "@/constants/Colors";

export default function SavedScreen() {
  const router = useRouter();
  const { properties, savedProperties, toggleSavedProperty, loading } =
    useStore();

  const savedPropertyItems = properties.filter((property) =>
    savedProperties.includes(property.id)
  );

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {savedPropertyItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No saved properties yet</Text>
          <Text style={styles.emptyStateSubtext}>
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
              onLike={() => toggleSavedProperty(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
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
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
