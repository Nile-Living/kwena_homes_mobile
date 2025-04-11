import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  StyleSheet,
  FlatList,
  View,
  RefreshControl,
  Alert,
  Text,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { Property, PropertyResponseDto, useStore } from "@/store/useStore"; // Ensure Property includes 'status', 'liked' etc.
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
import {
  PROPERTY_TYPES,
  PropertyCategory,
} from "@/constants/propertyTypes"; // Keep if needed for FilterModal
import {
  API_BASE_URL,
  PAGE_SIZE,
  SKELETON_COUNT,
  QueryParams,
} from "@/constants/Config"; // Import constants

// Define sort options matching backend expectations (or map them)
type SortOption =
  | "created_at.desc" // newest
  | "created_at.asc" // oldest
  | "price.asc"
  | "price.desc";

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Local state for UI control and filters/pagination
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("created_at.desc");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 }); // Keep if filter modal uses it
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(
    "all",
  );
  const [garages, setGarages] = useState(0);
  const [parkings, setParkings] = useState(0); // This might need mapping based on category
  // const [selectedFeatures, setSelectedFeatures] = useState("Any"); // Keep if filter modal uses it
  // const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]); // Keep if filter modal uses it
  // const [statusFilter, setStatusFilter] = useState<"all" | PropertyStatus>("all"); // Keep if filter modal uses it

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // Local error for fetch issues

  // Get data and setters from Zustand store
  const {
    properties,
    searchQuery,
    loading: zustandLoading, // Use Zustand loading for initial/filter load
    // error: zustandError, // Use localError for fetch issues in this screen
    setProperties,
    setLoading: setZustandLoading,
    setError: setZustandError, // Use to set global errors if needed, otherwise use localError
    toggleSavedProperty, // Keep toggleSavedProperty from store
    fetchSavedProperties, // Fetch saved properties on mount/refresh
  } = useStore();

  const { user } = useAuthStore(); // Get user for potential authenticated actions
  const colorScheme = useColorScheme();

  // --- Fetching Logic ---
  const fetchProperties = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      if (pageNumber === 1) {
        setZustandLoading(true); // Use Zustand loading for initial/refresh/filter
        setLocalError(null); // Clear local errors on new fetch
        setZustandError(null); // Clear global errors too
      } else {
        setIsFetchingMore(true); // Use local state for "load more" indicator
      }
      if (isRefresh) {
        setRefreshing(true);
        // Fetch saved properties again on refresh
        await fetchSavedProperties();
      }

      try {
        const params = new URLSearchParams();
        params.append(QueryParams.PAGE, pageNumber.toString());
        params.append(QueryParams.PAGE_SIZE, PAGE_SIZE.toString());
        params.append(QueryParams.SORT, sortOption);

        if (searchQuery) {
          params.append(QueryParams.LOCATION, searchQuery); // Backend uses p_location_pattern
        }
        if (selectedType !== "all") {
          params.append(QueryParams.CATEGORY, selectedType); // Backend uses p_category
        }
        if (bedrooms > 0) {
          params.append(QueryParams.BEDROOMS, bedrooms.toString()); // Backend uses p_min_bedrooms
        }
        if (bathrooms > 0) {
          params.append(QueryParams.BATHROOMS, bathrooms.toString()); // Backend uses p_min_bathrooms
        }
        if (garages > 0) {
          params.append(QueryParams.GARAGES, garages.toString()); // Backend uses p_min_garages (house only)
        }
        // Handle parkings based on category if necessary, or let backend RPC handle it
        if (parkings > 0) {
          // Option 1: Send generic 'parkings' if backend handles mapping
          // params.append('parkings', parkings.toString());
          // Option 2: Send specific param based on type (requires knowing type)
          if (selectedType === "house") {
            params.append(QueryParams.HOUSE_PARKINGS, parkings.toString());
          } else if (
            selectedType === "apartment" ||
            selectedType === "commercial"
          ) {
            params.append(QueryParams.PARKING_SPACES, parkings.toString());
          }
          // Add more complex logic if 'all' types are selected
        }

        // Add other filters if implemented (priceRange, statusFilter, propertyTypeFilter etc.)
        // if (statusFilter !== 'all') {
        //   params.append(QueryParams.STATUS, statusFilter);
        // }
        // if (priceRange.min > 0) {
        //    params.append(QueryParams.MIN_PRICE, priceRange.min.toString());
        // }
        // if (priceRange.max > 0) { // Assuming max > 0 means it's set
        //    params.append(QueryParams.MAX_PRICE, priceRange.max.toString());
        // }

        const response = await fetch(
          `${API_BASE_URL}/properties?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch properties (status: ${response.status})`,
          );
        }

        const data: PropertyResponseDto = await response.json(); // Expecting PropertyResponseDto structure
        const newProperties = data.properties || [];

        // Merge or replace properties based on page number
        const mergedProperties =
          pageNumber === 1 || isRefresh
            ? newProperties
            : [...properties, ...newProperties];

        // Update Zustand store
        setProperties(mergedProperties, pageNumber); // Setter now handles 'liked' status
        setHasMore(mergedProperties.length < data.total);
        setPage(pageNumber + 1); // Set the *next* page number to fetch
      } catch (error: any) {
        console.error("Error fetching properties:", error);
        setLocalError(
          error.message || "Failed to load properties. Please try again.",
        );
        // Optionally set global error: setZustandError(...)
        setHasMore(false); // Stop pagination on error
      } finally {
        if (pageNumber === 1) {
          setZustandLoading(false);
        } else {
          setIsFetchingMore(false);
        }
        if (isRefresh) {
          setRefreshing(false);
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
      setProperties,
      setZustandLoading,
      setZustandError,
      fetchSavedProperties, // Include fetchSavedProperties
    ],
  );

  // Initial fetch and fetch on filter/sort changes (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      console.log("Filters changed, fetching page 1");
      setPage(1); // Reset to page 1
      setHasMore(true); // Assume there might be more data
      // setProperties([]); // Clear existing properties before new filter fetch
      fetchProperties(1);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
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
    fetchProperties, // fetchProperties is now stable due to useCallback
  ]);

  // Fetch saved properties on initial mount
  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore && !zustandLoading && !refreshing) {
      console.log(`Loading more, fetching page ${page}`);
      fetchProperties(page); // Fetch the next page
    }
  };

  const onRefresh = useCallback(async () => {
    setPage(1); // Reset page for refresh
    setHasMore(true); // Reset hasMore
    await fetchProperties(1, true); // Pass isRefresh = true
  }, [fetchProperties]); // fetchProperties dependency

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`); // Adjust path as needed
  };

  // --- Filter Modal Handlers ---
  const handleApplyFilters = (filters: any) => {
    // Update local state based on filters from modal
    // This will trigger the useEffect to refetch
    setBedrooms(filters.selectedBedrooms === "Any" ? 0 : parseInt(filters.selectedBedrooms));
    setBathrooms(filters.selectedBathrooms === "Any" ? 0 : parseInt(filters.selectedBathrooms));
    setGarages(filters.selectedGarages === "Any" ? 0 : parseInt(filters.selectedGarages));
    setParkings(filters.selectedParkings === "Any" ? 0 : parseInt(filters.selectedParkings));
    setSelectedType(
      filters.selectedType === "All properties"
        ? "all"
        : (filters.selectedType as PropertyCategory),
    );
    // Update other filters like priceRange, features, amenities if used
    // setSelectedFeatures(filters.selectedFeatures);
    // setSelectedAmenities(filters.selectedAmenities);
  };

  const handleClearFilters = () => {
    // Reset local filter state
    // This will trigger the useEffect to refetch
    setPriceRange({ min: 0, max: 0 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedType("all");
    setGarages(0);
    setParkings(0);
    // setSelectedFeatures("Any");
    // setSelectedAmenities([]);
    // setStatusFilter("all");
  };

  // --- Like/Save Handler ---
  const handleLikePress = (propertyId: string) => {
    if (!user) {
      router.push("/auth/signin"); // Redirect to login if not authenticated
      return;
    }
    toggleSavedProperty(propertyId); // Call the Zustand action
  };

  // --- Render Logic ---
  const renderContent = () => {
    // Show skeletons only on initial load (page 1, not refreshing)
    if (zustandLoading && page === 1 && !refreshing) {
      return (
        <FlatList
          data={Array(SKELETON_COUNT).fill(null)}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerClassName="p-4" // Use className if using Nativewind
          // contentContainerStyle={styles.listContent} // Use StyleSheet otherwise
        />
      );
    }

    // Show error message if fetch failed and no properties are loaded
    if (localError && properties.length === 0) {
      return <Text style={styles.errorText}>Error: {localError}</Text>;
    }

    // Show "No properties found" only if not loading, no error, and properties array is empty
    if (!zustandLoading && properties.length === 0 && !localError) {
      return <Text style={styles.infoText}>No properties found.</Text>;
    }

    // Render the list of properties
    return (
      <FlatList
        ref={flatListRef}
        data={properties}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
            onLike={() => handleLikePress(item.id)}
            // Pass the 'liked' status from the property object
            isLiked={item.liked}
          />
        )}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Adjust threshold as needed
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          ) : null // Show loading indicator at the bottom
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.tint]} // Adjust colors as needed
            tintColor={Colors.light.tint}
          />
        }
        contentContainerClassName="p-4" // Use className if using Nativewind
        // contentContainerStyle={styles.listContent} // Use StyleSheet otherwise
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Use StyleSheet */}
      {/* <GestureHandlerRootView style={styles.flexContainer}> */}
      <BottomSheetModalProvider>
        {/* <View style={styles.flexContainer}> */}
        <View style={{ flex: 1 }}>
          {/* Use className */}
          <View className="flex-row p-4 pb-3 gap-2 mt-4 items-center">
            {/* Use StyleSheet */}
            {/* <View style={styles.headerContainer}> */}
            <SearchBar
              value={searchQuery}
              onChangeText={useStore((s) => s.setSearchQuery)} // Directly use setter
              placeholder="Search location..." // Changed placeholder
            />
            <FilterModal
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
              // Pass initial filter values if needed
            />
          </View>

          {/* Use className */}
          <View className="px-2 pb-1">
            {/* Use StyleSheet */}
            {/* <View style={styles.pickerContainer}> */}
            <Picker
              selectedValue={sortOption}
              onValueChange={(itemValue) => {
                setSortOption(itemValue as SortOption);
                // No need to fetch here, useEffect handles it
              }}
              mode="dropdown"
              dropdownIconColor={colorScheme === "dark" ? "white" : "black"}
              style={[
                styles.picker, // Keep base styles
                {
                  backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
                  color: colorScheme === "dark" ? "white" : "black",
                },
              ]}
            >
              <Picker.Item label="Newest" value="created_at.desc" />
              <Picker.Item label="Oldest" value="created_at.asc" />
              <Picker.Item label="Price: Low to High" value="price.asc" />
              <Picker.Item label="Price: High to Low" value="price.desc" />
              {/* Add other sort options if backend supports them */}
            </Picker>
          </View>

          {renderContent()}
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

// --- Styles --- (Keep your existing styles)
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
  infoText: {
    textAlign: "center",
    marginTop: 20,
    // color: Colors.light.background, // Use your theme color
    color: "#666", // Example color
    fontSize: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16, // Example padding (p-4 equivalent)
  },
});
