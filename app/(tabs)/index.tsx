import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  StyleSheet,
  FlatList,
  View,
  RefreshControl,
  Text,
  ActivityIndicator,
} from "react-native";
import { Property, PropertyResponseDto, useStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import FilterModal from "@/components/FilterModal";
import FeaturedProperties from "@/components/FeaturedProperties";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "react-native";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/propertyTypes";
import {
  API_BASE_URL,
  PAGE_SIZE,
  SKELETON_COUNT,
  QueryParams,
} from "@/constants/Config";
import { getAnonymousSessionId } from '@/utils/sessionIdManager';

type SortOption =
  | "created_at.desc"
  | "created_at.asc"
  | "price.asc"
  | "price.desc";

export default function HomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Property>>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("created_at.desc");
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(
    "all",
  );
  const [garages, setGarages] = useState(0);
  const [parkings, setParkings] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    properties,
    featuredProperties,
    searchQuery,
    loading: zustandLoading,
    loadingFeatured,
    errorFeatured,
    setProperties,
    setLoading: setZustandLoading,
    setError: setZustandError,
    toggleSavedProperty,
    fetchSavedProperties,
    fetchFeaturedProperties,
  } = useStore();

  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchPaginatedProperties = useCallback(
    async (pageNumber: number, isRefresh = false) => {
      // console.log(
      //   `fetchPaginatedProperties called with pageNumber: ${pageNumber}, isRefresh: ${isRefresh}`,
      // );
      if (!hasMore && pageNumber > 1 && !isRefresh) {
        // console.log(
        //   "fetchPaginatedProperties: Aborting - no more pages or not a refresh.",
        // );
        return;
      }

      if (pageNumber === 1) {
        // console.log(
        //   "fetchPaginatedProperties: Fetching page 1 - setting Zustand loading true.",
        // );
        setZustandLoading(true);
        setLocalError(null);
        setZustandError(null);
      } else {
        // console.log(
        //   "fetchPaginatedProperties: Fetching more - setting isFetchingMore true.",
        // );
        setIsFetchingMore(true);
      }

      if (isRefresh) {
        // console.log(
        //   "fetchPaginatedProperties: Refreshing - fetching saved and featured properties.",
        // );
        setRefreshing(true);
        await fetchSavedProperties();
        await fetchFeaturedProperties();
      }

      try {
        const { user } = useAuthStore.getState();
        const sessionId = user?.id || await getAnonymousSessionId();
      
      // console.log(`Using sessionId: ${sessionId} (user: ${user ? 'authenticated' : 'anonymous'})`);
        const params = new URLSearchParams();
        params.append(QueryParams.PAGE, pageNumber.toString());
        params.append(QueryParams.PAGE_SIZE, PAGE_SIZE.toString());
        params.append(QueryParams.SORT, sortOption);
        params.append('sessionId', sessionId);

        if (searchQuery) params.append(QueryParams.LOCATION, searchQuery);
        if (selectedType !== "all")
          params.append(QueryParams.CATEGORY, selectedType);
        if (bedrooms > 0)
          params.append(QueryParams.BEDROOMS, bedrooms.toString());
        if (bathrooms > 0)
          params.append(QueryParams.BATHROOMS, bathrooms.toString());
        if (garages > 0 && (selectedType === "all" || selectedType === "house")) {
          params.append(QueryParams.GARAGES, garages.toString());
        }
        if (parkings > 0) {
          if (selectedType === "house")
            params.append(QueryParams.HOUSE_PARKINGS, parkings.toString());
          else if (
            selectedType === "apartment" ||
            selectedType === "commercial"
          )
            params.append(QueryParams.PARKING_SPACES, parkings.toString());
          else if (selectedType === "all")
            params.append(QueryParams.PARKING_SPACES, parkings.toString());
        }
        const apiUrl = `${API_BASE_URL}/properties?${params.toString()}`;
        // console.log(`fetchPaginatedProperties: Fetching URL: ${apiUrl}`);

        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `fetchPaginatedProperties: API Error Status: ${response.status}, Text: ${errorText}`,
          );
          throw new Error(
            `Failed to fetch properties (status: ${response.status})`,
          );
        }

        const data: PropertyResponseDto = await response.json();
        // console.log(
        //   "fetchPaginatedProperties: API Response Data:",
        //   JSON.stringify(data, null, 2),
        // );

        const newProperties = data.properties || [];
        // console.log(
        //   `fetchPaginatedProperties: Received ${newProperties.length} new properties from API.`,
        // );
        // console.log(
        //   `fetchPaginatedProperties: API reported total properties: ${data.total}.`,
        // );

        setProperties(newProperties, pageNumber);
        const newHasMore = pageNumber * PAGE_SIZE < data.total;
        // console.log(`fetchPaginatedProperties: Setting hasMore to: ${newHasMore}`);
        setHasMore(newHasMore);
        // console.log(`fetchPaginatedProperties: Setting page to: ${pageNumber + 1}`);
        setPage(pageNumber + 1);
      } catch (error: any) {
        console.error("fetchPaginatedProperties: Catch Block Error:", error);
        setLocalError(
          error.message || "Failed to load properties. Please try again.",
        );
        setHasMore(false);
      } finally {
        if (pageNumber === 1) {
          // console.log(
          //   "fetchPaginatedProperties: Finally block for page 1 - setting Zustand loading false.",
          // );
          setZustandLoading(false);
          setIsInitialFetchDone(true);
        } else {
          // console.log(
          //   "fetchPaginatedProperties: Finally block for subsequent page - setting isFetchingMore false.",
          // );
          setIsFetchingMore(false);
        }
        if (isRefresh) {
          // console.log(
          //   "fetchPaginatedProperties: Finally block for refresh - setting refreshing false.",
          // );
          setRefreshing(false);
        }
        // console.log("fetchPaginatedProperties: Fetch operation complete.");
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
      hasMore,
      setProperties,
      setZustandLoading,
      setZustandError,
      fetchSavedProperties,
      fetchFeaturedProperties,
      setPage,
      setHasMore,
      setRefreshing,
      setIsFetchingMore,
      setIsInitialFetchDone,
      setLocalError,
    ],
  );

  useEffect(() => {
    fetchFeaturedProperties();
    const debounceTimer = setTimeout(() => {
      // console.log("Filters changed, fetching page 1");
      setPage(1);
      setHasMore(true);
      fetchPaginatedProperties(1);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [
    searchQuery,
    selectedType,
    bedrooms,
    bathrooms,
    garages,
    parkings,
    sortOption,
    fetchFeaturedProperties,
  ]);

  useEffect(() => {
    fetchSavedProperties();
  }, [fetchSavedProperties]);

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore && !zustandLoading && !refreshing) {
      fetchPaginatedProperties(page);
    }
  };
  const onRefresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchPaginatedProperties(1, true);
  }, []);
  const handlePropertyPress = (propertyId: string) =>
    router.push(`../property/${propertyId}`);
  const handleApplyFilters = (filters: any) => {
    setBedrooms(
      filters.selectedBedrooms === "Any"
        ? 0
        : parseInt(filters.selectedBedrooms),
    );
    setBathrooms(
      filters.selectedBathrooms === "Any"
        ? 0
        : parseInt(filters.selectedBathrooms),
    );
    setGarages(
      filters.selectedGarages === "Any" ? 0 : parseInt(filters.selectedGarages),
    );
    setParkings(
      filters.selectedParkings === "Any"
        ? 0
        : parseInt(filters.selectedParkings),
    );
    setSelectedType(
      filters.selectedType === "All properties"
        ? "all"
        : (filters.selectedType as PropertyCategory),
    );
  };
  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 0 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedType("all");
    setGarages(0);
    setParkings(0);
  };
  const handleLikePress = (propertyId: string) => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    toggleSavedProperty(propertyId);
  };

  const renderListHeader = () => {
    if (loadingFeatured && featuredProperties.length === 0) {
      return (
        <View style={{ height: 230 }}>
          <ActivityIndicator />
        </View>
      );
    }
    if (errorFeatured) {
      return (
        <Text style={styles.errorTextSmall}>
          Could not load featured items.
        </Text>
      );
    }
    if (featuredProperties.length > 0) {
      return <FeaturedProperties properties={featuredProperties} />;
    }
    return null;
  };

  const renderContent = () => {
    if (zustandLoading && page === 1 && !refreshing && properties.length === 0) {
      return (
        <FlatList
          data={Array(SKELETON_COUNT).fill(null)}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
        />
      );
    }

    if (localError && properties.length === 0) {
      return (
        <View style={{ flex: 1 }}>
          {renderListHeader()}
          <Text style={styles.errorText}>Error: {localError}</Text>
        </View>
      );
    }

    if (
      !zustandLoading &&
      properties.length === 0 &&
      !localError &&
      isInitialFetchDone
    ) {
      return (
        <View style={{ flex: 1 }}>
          {renderListHeader()}
          <Text style={styles.infoText}>
            No properties found matching your criteria.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={properties}
        ListHeaderComponent={renderListHeader}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
            onLike={() => handleLikePress(item.id)}
            isLiked={item.liked ?? false}
            isInjectedAd={item.isInjectedAd}
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, marginTop: 10 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={useStore((s) => s.setSearchQuery)}
            placeholder="Search properties..."
          />
          <FilterModal
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sortOption}
            onValueChange={(itemValue) =>
              setSortOption(itemValue as SortOption)
            }
            mode="dialog"
            dropdownIconColor={isDark ? "#cbd5e1" : "#374151"}
            style={[
              styles.picker,
              {
                backgroundColor: isDark ? "#1e293b" : "#fff",
                borderColor: isDark ? "#334155" : "#e5e7eb",
                color: isDark ? "#cbd5e1" : "#1f2937",
              },
            ]}
          >
            <Picker.Item label="Newest" value="created_at.desc" />
            <Picker.Item label="Oldest" value="created_at.asc" />
            <Picker.Item label="Price: Low to High" value="price.asc" />
            <Picker.Item label="Price: High to Low" value="price.desc" />
          </Picker>
        </View>

        {renderContent()}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 3,
    gap: 8,
    marginTop: 16,
    alignItems: "center",
  },
  pickerContainer: { paddingHorizontal: 8, paddingBottom: 4 },
  picker: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    color: "red",
    fontSize: 16,
    paddingHorizontal: 16,
  },
  errorTextSmall: {
    textAlign: "center",
    marginVertical: 20,
    color: "orange",
    fontSize: 14,
    paddingHorizontal: 16,
  },
  infoText: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
    fontSize: 16,
    paddingHorizontal: 16,
  },
  listContent: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 16 },
});
