import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
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
import { EnhancedSearchHeader } from "@/components/EnhancedSearchHeader";
import { useAnalytics } from "@/hooks/useAnalytics";
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
  const { trackSearch } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("created_at.desc");
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">("all");
  const [garages, setGarages] = useState(0);
  const [parkings, setParkings] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState<string>("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedLegalStatus, setSelectedLegalStatus] = useState<string>("Any");
  const [selectedCommercialSubType, setSelectedCommercialSubType] = useState<string>("Any");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [parkingSpaces, setParkingSpaces] = useState<number>(0);
  const [minSquareMeters, setMinSquareMeters] = useState<number>(0);
  const [maxSquareMeters, setMaxSquareMeters] = useState<number>(0);
  const [minSizeSqm, setMinSizeSqm] = useState<number>(0);
  const [maxSizeSqm, setMaxSizeSqm] = useState<number>(0);
  const [roadAccess, setRoadAccess] = useState<boolean | undefined>(undefined);
  const [waterSupply, setWaterSupply] = useState<string>("Any");
  const [electricityAvailable, setElectricityAvailable] = useState<boolean | undefined>(undefined);
  const [fenced, setFenced] = useState<boolean | undefined>(undefined);
  const [intendedUse, setIntendedUse] = useState<string>("Any");

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
      if (!hasMore && pageNumber > 1 && !isRefresh) {
        return;
      }

      if (pageNumber === 1) {
        setZustandLoading(true);
        setLocalError(null);
        setZustandError(null);
      } else {
        setIsFetchingMore(true);
      }

      if (isRefresh) {
        setRefreshing(true);
        await fetchSavedProperties();
        await fetchFeaturedProperties();
      }

      try {
        const { user } = useAuthStore.getState();
        const sessionId = user?.id || await getAnonymousSessionId();
        
        const params = new URLSearchParams();
        params.append(QueryParams.PAGE, pageNumber.toString());
        params.append(QueryParams.PAGE_SIZE, PAGE_SIZE.toString());
        params.append(QueryParams.SORT, sortOption);
        params.append('sessionId', sessionId);

        if (searchQuery) params.append(QueryParams.LOCATION, searchQuery);
        if (selectedType !== "all") params.append(QueryParams.CATEGORY, selectedType);

        if (bedrooms > 0) params.append(QueryParams.BEDROOMS, bedrooms.toString());
        if (bathrooms > 0) params.append(QueryParams.BATHROOMS, bathrooms.toString());

        if (garages > 0 && (selectedType === "all" || selectedType === "house")) {
          params.append(QueryParams.GARAGES, garages.toString());
        }
        
        if (parkings > 0) {
          if (selectedType === "house") {
            params.append(QueryParams.HOUSE_PARKINGS, parkings.toString());
          } else if (selectedType === "apartment" || selectedType === "commercial") {
            params.append(QueryParams.PARKING_SPACES, parkings.toString());
          } else if (selectedType === "all") {
            params.append(QueryParams.PARKING_SPACES, parkings.toString());
          }
        }

        if (minPrice > 0) params.append('minPrice', minPrice.toString());
        if (maxPrice > 0) params.append('maxPrice', maxPrice.toString());

        if (minSquareMeters > 0) params.append('min_square_meters', minSquareMeters.toString());
        if (maxSquareMeters > 0) params.append('max_square_meters', maxSquareMeters.toString());

        if (minSizeSqm > 0) params.append('min_size_sqm', minSizeSqm.toString());
        if (maxSizeSqm > 0) params.append('max_size_sqm', maxSizeSqm.toString());

        if (selectedLegalStatus !== "Any") params.append('legal_status', selectedLegalStatus);
        if (intendedUse !== "Any") params.append('intended_use', intendedUse);
        if (roadAccess !== undefined) params.append('road_access', roadAccess.toString());
        if (waterSupply !== "Any") params.append('water_supply', waterSupply);
        if (electricityAvailable !== undefined) params.append('electricity_available', electricityAvailable.toString());
        if (fenced !== undefined) params.append('fenced', fenced.toString());

        if (selectedCommercialSubType !== "Any") {
          params.append('commercial_property_type', selectedCommercialSubType);
        }

        if (selectedAmenities.length > 0) {
          selectedAmenities.forEach(amenity => {
            params.append('amenities', amenity);
          });
        }

        if (selectedFeatures !== "Any") {
          params.append('features', selectedFeatures);
        }

        const apiUrl = `${API_BASE_URL}/properties?${params.toString()}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch properties (status: ${response.status})`);
        }

        const data: PropertyResponseDto = await response.json();
        const newProperties = data.properties || [];

        setProperties(newProperties, pageNumber);
        const newHasMore = pageNumber * PAGE_SIZE < data.total;
        setHasMore(newHasMore);
        setPage(pageNumber + 1);
      } catch (error: any) {
        setLocalError(error.message || "Failed to load properties. Please try again.");
        setHasMore(false);
      } finally {
        if (pageNumber === 1) {
          setZustandLoading(false);
          setIsInitialFetchDone(true);
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
      hasMore,
      selectedFeatures,
      selectedAmenities,
      selectedLegalStatus,
      selectedCommercialSubType,
      minPrice,
      maxPrice,
      minSquareMeters,
      maxSquareMeters,
      minSizeSqm,
      maxSizeSqm,
      roadAccess,
      waterSupply,
      electricityAvailable,
      fenced,
      intendedUse,
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
      // Track search performed
      if (searchQuery || selectedType !== 'all' || bedrooms > 0 || bathrooms > 0) {
        trackSearch({
          searchQuery,
          selectedType,
          bedrooms,
          bathrooms,
          garages,
          parkings,
          sortOption,
          minPrice,
          maxPrice,
        });
      }
      
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
    selectedFeatures,
    selectedAmenities,
    selectedLegalStatus,
    selectedCommercialSubType,
    minPrice,
    maxPrice,
    minSquareMeters,
    maxSquareMeters,
    minSizeSqm,
    maxSizeSqm,
    roadAccess,
    waterSupply,
    electricityAvailable,
    fenced,
    intendedUse,
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
      filters.selectedBedrooms === "Any" ? 0 : parseInt(filters.selectedBedrooms) || 0,
    );
    setBathrooms(
      filters.selectedBathrooms === "Any" ? 0 : parseInt(filters.selectedBathrooms) || 0,
    );
    setGarages(
      filters.selectedGarages === "Any" ? 0 : parseInt(filters.selectedGarages) || 0,
    );
    setParkings(
      filters.selectedParkings === "Any" ? 0 : parseInt(filters.selectedParkings) || 0,
    );
    setSelectedType(
      filters.selectedType === "All properties" ? "all" : (filters.selectedType as PropertyCategory),
    );

    setSelectedFeatures(filters.selectedFeatures || "Any");
    setSelectedAmenities(filters.selectedAmenities || []);
    setSelectedLegalStatus(filters.selectedLegalStatus || "Any");
    setSelectedCommercialSubType(filters.selectedCommercialSubType || "Any");

    if (filters.priceRange) {
      setMinPrice(filters.priceRange.min || 0);
      setMaxPrice(filters.priceRange.max || 0);
    }

    if (filters.squareMetersRange) {
      setMinSquareMeters(filters.squareMetersRange.min || 0);
      setMaxSquareMeters(filters.squareMetersRange.max || 0);
    }

    if (filters.landSizeRange) {
      setMinSizeSqm(filters.landSizeRange.min || 0);
      setMaxSizeSqm(filters.landSizeRange.max || 0);
    }

    setRoadAccess(filters.roadAccess);
    setWaterSupply(filters.waterSupply || "Any");
    setElectricityAvailable(filters.electricityAvailable);
    setFenced(filters.fenced);
    setIntendedUse(filters.intendedUse || "Any");
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 0 });
    setBedrooms(0);
    setBathrooms(0);
    setSelectedType("all");
    setGarages(0);
    setParkings(0);
    
    setSelectedFeatures("Any");
    setSelectedAmenities([]);
    setSelectedLegalStatus("Any");
    setSelectedCommercialSubType("Any");
    setMinPrice(0);
    setMaxPrice(0);
    setMinSquareMeters(0);
    setMaxSquareMeters(0);
    setMinSizeSqm(0);
    setMaxSizeSqm(0);
    setRoadAccess(undefined);
    setWaterSupply("Any");
    setElectricityAvailable(undefined);
    setFenced(undefined);
    setIntendedUse("Any");
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
        <EnhancedSearchHeader
          searchQuery={searchQuery}
          onSearchChange={useStore((s) => s.setSearchQuery)}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          currentFilters={{
            selectedType,
            selectedBedrooms: bedrooms.toString(),
            selectedBathrooms: bathrooms.toString(),
            selectedGarages: garages.toString(),
            selectedParkings: parkings.toString(),
            selectedFeatures,
            selectedAmenities,
            selectedLegalStatus,
            selectedCommercialSubType,
            priceRange: { min: minPrice, max: maxPrice },
          }}
        />

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