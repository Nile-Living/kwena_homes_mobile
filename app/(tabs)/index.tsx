import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import FilterModal from "@/components/FilterModal";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const SKELETON_COUNT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState("");

  const {
    properties,
    searchQuery,
    activeFilters,
    propertyTypeFilter,
    loading,
    setSearchQuery,
    setActiveFilters,
    setPropertyTypeFilter,
    toggleSavedProperty,
    setProperties,
    setLoading,
  } = useStore();

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Existing filters
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (property) => property.property_type === propertyTypeFilter
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query)
      );
    }

    // New filters
    if (selectedType) {
      filtered = filtered.filter((p) => p.category === selectedType);
    }

    if (bedrooms > 0) {
      filtered = filtered.filter((p) => p.bedrooms >= bedrooms);
    }

    if (priceRange.min > 0 || priceRange.max > 0) {
      filtered = filtered.filter((p) => {
        const min = priceRange.min || 0;
        const max = priceRange.max || Infinity;
        return p.price >= min && p.price <= max;
      });
    }

    return filtered;
  }, [
    properties,
    searchQuery,
    activeFilters,
    propertyTypeFilter,
    selectedType,
    bedrooms,
    priceRange,
  ]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*, agents(*)");

        if (error) throw error;

        const formattedProperties = data.map((prop) => ({
          ...prop,
          agent: prop.agents,
          coordinates: prop.coordinates,
        }));

        setProperties(formattedProperties);
        setLoading(false);
        useStore.getState().fetchSavedProperties();
      } catch (error) {
        console.error("Error fetching properties:", error);
        setError("Failed to load properties");
      }
    };

    fetchProperties();
  }, []);

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await useStore.getState().fetchSavedProperties();
      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing:", error);
      setRefreshing(false);
    }
  };

  const handleApplyFilters = () => {
    // Implement any additional filter logic here
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 0 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedType("");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <FlatList
          data={Array(SKELETON_COUNT).fill(null)}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerClassName="p-4"
        />
      );
    }

    return (
      <FlatList
        data={filteredProperties}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
            onLike={() => {
              const { user } = useAuthStore.getState();
              if (!user) {
                router.push("/auth/signin");
                return;
              }
              toggleSavedProperty(item.id);
            }}
            key={item.id}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.background]}
          />
        }
      />
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row p-4 gap-2">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search properties..."
        />
        <FilterModal
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </View>

      {renderContent()}
    </View>
  );
}
