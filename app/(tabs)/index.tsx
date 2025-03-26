import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { useEffect, useRef, useState } from "react";
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

type PropertyStatus =
  | "available"
  | "occupied"
  | "rented"
  | "off-market"
  | "under-maintenance"
  | "pending-approval";

export default function HomeScreen() {
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null)

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "price_asc" | "price_desc"
  >("newest");
  const colorScheme = useColorScheme();
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedType, setSelectedType] = useState<PropertyCategory | 'all'>('all');
  const [page, setPage] = useState(0);
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

  const filteredProperties = properties;

  const getFilteredProperties = () => {
    let filtered = [...properties];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query)
      );
    }

    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (property) => property.property_type?.toLowerCase() === propertyTypeFilter
      );
    }

    // if (statusFilter !== "all") {
    //   filtered = filtered.filter(
    //     (property) => property.status === statusFilter
    //   );
    // }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

// Replace the existing fetchProperties function with this:
const fetchProperties = async (pageNumber: number) => {
  try {
    setIsFetchingMore(true);
    
    // Construct query parameters based on current filters
    const params = new URLSearchParams({
      page: pageNumber.toString(),
      page_size: "10", // Match your Go backend's page size
      ...(searchQuery && { location: searchQuery }),
      ...(propertyTypeFilter !== "all" && { property_type: propertyTypeFilter }),
      ...(bedrooms > 0 && { bedrooms: bedrooms.toString() }),
      ...(bathrooms > 0 && { bathrooms: bathrooms.toString() }),
      ...(garages > 0 && { garage: garages.toString() }),
      ...(parkings > 0 && { parkings: parkings.toString() }),
      // Add other filters as needed
    });

    const response = await fetch(`https://kwena-properties-backend.onrender.com/api/properties`);
    
    if (!response.ok) throw new Error('Failed to fetch properties');
    
    const data: {
      properties: Property[];
      total: number;
      page: number;
      page_size: number;
    } = await response.json();

    console.log("Received data: ", data)

    const mergedProperties = [...properties, ...data.properties].filter(
      (p, index, self) => self.findIndex((prop) => prop.id === p.id) === index
    );
    
    setProperties(mergedProperties);
    setHasMore(data.properties.length === 5);
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
    setProperties([]); // Clear existing properties when search changes
    fetchProperties(0);
  }, 500);

  return () => clearTimeout(debounceTimer);
}, [searchQuery, propertyTypeFilter, bedrooms, bathrooms, garages, parkings]);

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

    const categoryKey = Object.entries(PROPERTY_TYPES).find(
      ([key, val]) => val.label === filters.selectedType
    )?.[0] || 'all';

    setBedrooms(parseFilterValue(filters.selectedBedrooms));
    setBathrooms(parseFilterValue(filters.selectedBathrooms));
    setGarages(parseFilterValue(filters.selectedGarages));
    setParkings(parseFilterValue(filters.selectedParkings));
    setSelectedType(
      filters.selectedType === "All properties" ? "all" : filters.selectedType as PropertyCategory
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
    setSelectedType("all");
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
      ref={flatListRef}
        data={getFilteredProperties()}
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
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
