import {
  StyleSheet,
  FlatList,
  View,
  RefreshControl,
  Alert,
  Text,
} from "react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import { Property, useStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import FilterModal from "@/components/FilterModal";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "react-native";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/PropertyTypes";

const SKELETON_COUNT = 6;
const API_BASE_URL = "http://192.168.100.18:8080/api";
const PAGE_SIZE = 10;

type PropertyStatus =
  | "available"
  | "occupied"
  | "rented"
  | "off-market"
  | "under-maintenance"
  | "pending-approval";

type BackendSortOption =
  | "created_at.desc"
  | "created_at.asc"
  | "price.asc"
  | "price.desc";

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "price_asc" | "price_desc"
  >("newest");
  const colorScheme = useColorScheme();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [garages, setGarages] = useState(0);
  const [parkings, setParkings] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PropertyStatus>(
    "all"
  );

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
    fetchSavedProperties
  } = useStore();

  const statusOptions = [
    { value: "all", label: "All Properties", color: "#4B5563", icon: "list" },
    {
      value: "available",
      label: "Available",
      color: "#4CAF50",
      icon: "checkmark-circle",
    },
    { value: "occupied", label: "Occupied", color: "#FF9800", icon: "home" },
    { value: "rented", label: "Rented Out", color: "#2196F3", icon: "cash" },
    {
      value: "off-market",
      label: "Off Market",
      color: "#9E9E9E",
      icon: "eye-off",
    },
    {
      value: "under-maintenance",
      label: "Under Maintenance",
      color: "#FFC107",
      icon: "construct",
    },
    {
      value: "pending-approval",
      label: "Pending Approval",
      color: "#673AB7",
      icon: "time",
    },
  ];

const getBackendSortOption = (): BackendSortOption => {
  switch (sortOption) {
    case "newest":
      return "created_at.desc";
    case "oldest":
      return "created_at.asc";
    case "price_asc":
      return "price.asc";
    case "price_desc":
      return "price.desc";
    default:
      return "created_at.desc";
  }
};

  // Replace the existing fetchProperties function with this:
  const fetchProperties = useCallback(
    async (pageNumber: number, isRefreshing = false) => {
      // Use Zustand loading for initial/refresh, local state for "load more"
      if (pageNumber === 1) {
        setLoading(true); // Use Zustand loading for first page / filter change
      } else {
        setIsFetchingMore(true); // Use local state for subsequent pages
      }
      setError(null); // Clear previous errors

      try {
        // Construct query parameters based on current filters/state
        const params = new URLSearchParams();
        params.append("page", pageNumber.toString());
        params.append("pageSize", PAGE_SIZE.toString());
        params.append("sort", getBackendSortOption()); // Add sort parameter

        if (searchQuery) {
          // Backend uses 'location' for search
          params.append("location", searchQuery);
        }
        if (selectedType !== "all") {
          // Backend uses 'propertyType'
          params.append("propertyType", selectedType);
        }
        if (bedrooms > 0) {
          params.append("bedrooms", bedrooms.toString());
        }
        if (bathrooms > 0) {
          params.append("bathrooms", bathrooms.toString());
        }
        if (garages > 0) {
          // Backend uses 'garage'
          params.append("garage", garages.toString());
        }
        if (parkings > 0) {
          params.append("parkings", parkings.toString());
        }
        // Add other filters like priceRange, features, amenities if implemented on backend

        const response = await fetch(
          `${API_BASE_URL}/properties?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch properties (status: ${response.status})`,
          );
        }

        const data: {
          properties: Property[];
          total: number;
          page: number;
          pageSize: number;
        } = await response.json();

        console.log(`Received data for page ${pageNumber}:`, data);

        // Ensure unique properties when merging (important for refresh/load more)
        const newProperties = data.properties || [];
        let mergedProperties: Property[];

        if (pageNumber === 1 || isRefreshing) {
          // If first page or refreshing, replace existing properties
          mergedProperties = newProperties;
        } else {
          // Otherwise, merge and remove duplicates
          const currentProperties = properties || []; // Get current properties from store
          mergedProperties = [...currentProperties, ...newProperties].filter(
            (p, index, self) =>
              index === self.findIndex((prop) => prop.id === p.id),
          );
        }

        setProperties(mergedProperties); // Update Zustand store

        // Update pagination state based on total count
        setHasMore(mergedProperties.length < data.total);
        setPage(pageNumber + 1); // Set the *next* page number to fetch

      } catch (error: any) {
        console.error("Error fetching properties:", error);
        setError(
          error.message || "Failed to load properties. Please try again.",
        );
        // Don't clear properties on error, maybe show previous list with error message
      } finally {
        if (pageNumber === 1) {
          setLoading(false); // Turn off Zustand loading
        } else {
          setIsFetchingMore(false); // Turn off local loading more indicator
        }
        if (isRefreshing) {
          setRefreshing(false); // Turn off pull-to-refresh indicator
        }
      }
    },
    [
      searchQuery,
      selectedType,
      bedrooms,
      bathrooms,
      garages,
      parkings,
      sortOption,
      properties, // Include properties to correctly merge in subsequent calls
      setLoading,
      setProperties,
    ], // Add all filter/sort states that trigger a refetch
  );

  useEffect(() => {
    // Debounce fetching when filters change
    const debounceTimer = setTimeout(() => {
      console.log("Filters changed, fetching page 1");
      setPage(1); // Reset to page 1
      setHasMore(true); // Assume there might be more data
      setProperties([]);
      fetchProperties(1);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false }); // Scroll to top
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [
    searchQuery,
    selectedType,
    bedrooms,
    bathrooms,
    garages,
    parkings,
    sortOption,
    // fetchProperties,
  ]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore && !loading) {
      console.log(`Loading more, fetching page ${page}`);
      fetchProperties(page); // Fetch the next page
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1); // Reset page for refresh
    setHasMore(true); // Reset hasMore
    // Fetch saved properties first if needed for like status
    try {
      await fetchSavedProperties();
    } catch (error) {
      console.error("Error fetching saved properties on refresh:", error);
    }
    // Then fetch properties, indicating it's a refresh
    await fetchProperties(1, true);
    // setRefreshing(false) is handled in fetchProperties finally block
  }, [fetchProperties, fetchSavedProperties]); // Add dependencies

  const handleApplyFilters = (filters: {
    selectedType: string;
    selectedBedrooms: string;
    selectedBathrooms: string;
    selectedGarages: string;
    selectedParkings: string;
    selectedFeatures: string; // Keep if needed
    selectedAmenities: string[]; // Keep if needed
  }) => {
    console.log("Applying filters:", filters);
    // Helper function from your original code
    const parseFilterValue = (value: string) =>
      value === "Any" ? 0 : parseInt(value.split("+")[0].trim());

    // Update state - this will trigger the useEffect to refetch
    setBedrooms(parseFilterValue(filters.selectedBedrooms));
    setBathrooms(parseFilterValue(filters.selectedBathrooms));
    setGarages(parseFilterValue(filters.selectedGarages));
    setParkings(parseFilterValue(filters.selectedParkings));
    setSelectedType(
      filters.selectedType === "All properties"
        ? "all"
        : (filters.selectedType as PropertyCategory),
    );
    // Update features/amenities state if used
    // setSelectedFeatures(filters.selectedFeatures);
    // setSelectedAmenities(filters.selectedAmenities);

    // No need to call fetchProperties(0) here, useEffect handles it
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
    setPriceRange({ min: 0, max: 0 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedType("all");
    setGarages(0);
    setParkings(0);
    setSelectedFeatures("Any");
    setSelectedAmenities([]);
  };

  const renderContent = () => {
    if (loading && page === 1 && !refreshing) {
      return (
        <FlatList
          data={Array(SKELETON_COUNT).fill(null)}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerClassName="p-4"
        />
      );
    }

    if (error && properties.length === 0) {
      return <Text style={styles.errorText}>Error: {error}</Text>;
    }

    if (!loading && properties.length === 0 && !error) {
      return <Text style={styles.infoText}>No properties found.</Text>;
    }

    return (
      <FlatList
        ref={flatListRef}
        data={properties}
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

          <View className="px-2 pb-1">
            <Picker
              selectedValue={sortOption}
              onValueChange={(value) => {
                setSortOption(value);
                setPage(0);
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                });
                fetchProperties(0);
              }}
              mode="dropdown"
              dropdownIconColor={colorScheme === "dark" ? "white" : "black"}
              style={{
                backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
                color: colorScheme === "dark" ? "white" : "black",
              }}
            >
              <Picker.Item label="Newest" value="newest" />
              <Picker.Item label="Oldest" value="oldest" />
              <Picker.Item label="Price: Low to High" value="price_asc" />
              <Picker.Item label="Price: High to Low" value="price_desc" />
            </Picker>
          </View>

          {renderContent()}
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 3, // Match original style
    gap: 8, // Match original style
    marginTop: 16, // Match original style
    alignItems: "center",
  },
  pickerContainer: {
    paddingHorizontal: 8, // Match original style px-2
    paddingBottom: 4, // Match original style pb-1
    // Add border or background if needed for Picker styling
  },
  picker: {
    height: 50,
    width: "100%",
    // Add specific styling for Android/iOS picker appearance if needed
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
    fontSize: 16,
    paddingHorizontal: 16,
  },
   errorTextSmall: {
    textAlign: "center",
    color: "orange",
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  infoText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.light.background, // Use your theme color
    fontSize: 16,
    paddingHorizontal: 16,
  },
});
