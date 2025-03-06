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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [garages, setGarages] = useState(0);
  const [parkings, setParkings] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

  const filteredProperties = properties;

  const fetchProperties = async (pageNumber: number) => {
    try {
      setIsFetchingMore(true);
      let query = supabase
        .from("properties")
        .select("*, agents(*)", { count: "exact" })
        .order("created_at", { ascending: false });

      // Search
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Filters
      if (propertyTypeFilter !== "all") {
        query = query.eq("property_type", propertyTypeFilter);
      }
      if (selectedType) query = query.eq("category", selectedType);
      if (bedrooms > 0) query = query.gte("bedrooms", bedrooms);
      if (bathrooms > 0) query = query.gte("bathrooms", bathrooms);
      if (garages > 0) query = query.gte("garages", garages);
      if (parkings > 0) query = query.gte("parkings", parkings);
      if (selectedFeatures !== "Any")
        query = query.eq("features", selectedFeatures);
      if (selectedAmenities.length > 0)
        query = query.contains("amenities", selectedAmenities);

      // Pagination
      const { data, error } = await query.range(
        pageNumber * 5,
        (pageNumber + 1) * 5 - 1
      );

      if (error) throw error;

      const formattedProperties = data.map((prop) => ({
        ...prop,
        agent: prop.agents,
        coordinates: prop.coordinates,
      }));

      setProperties(
        pageNumber === 0
          ? formattedProperties
          : [...properties, ...formattedProperties]
      );
      setHasMore(data.length === 5);
      setPage((p) => p + 1);
    } catch (error) {
      setError("Failed to load properties");
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPage(0);
      fetchProperties(0);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore) {
      fetchProperties(page);
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  const onRefresh = async () => {
    setLoading(true);
    try {
      await useStore.getState().fetchSavedProperties();
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing:", error);
      setRefreshing(false);
    }
  };

  const handleApplyFilters = (filters: {
    selectedType: string;
    selectedBedrooms: string;
    selectedBathrooms: string;
    selectedGarages: string;
    selectedParkings: string;
    selectedFeatures: string;
    selectedAmenities: string[];
  }) => {
    const parseFilterValue = (value: string) =>
      value === "Any" ? 0 : parseInt(value.split("+")[0].trim());

    setBedrooms(parseFilterValue(filters.selectedBedrooms));
    setBathrooms(parseFilterValue(filters.selectedBathrooms));
    setGarages(parseFilterValue(filters.selectedGarages));
    setParkings(parseFilterValue(filters.selectedParkings));
    setSelectedType(
      filters.selectedType === "All properties" ? "" : filters.selectedType
    );
    setSelectedFeatures(filters.selectedFeatures);
    setSelectedAmenities(filters.selectedAmenities);

    setPage(0);
    setLoading(true);
    fetchProperties(0);
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={isFetchingMore ? <PropertyCardSkeleton /> : null}
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
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <View className="flex-1">
          <View className="flex-row p-4 pb-3 gap-2 mt-4">
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
