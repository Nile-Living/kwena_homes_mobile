import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardSkeleton from "@/components/PropertyCardSkeleton";
import FilterChips from "@/components/FilterChips";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";

const filterOptions = [
  { id: "apartment", label: "Apartment" },
  { id: "house", label: "House" },
  { id: "villa", label: "Villa" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const propertyTypeOptions = [
  { id: "all", label: "All Properties" },
  { id: "rent", label: "For Rent" },
  { id: "sale", label: "For Sale" },
];

const SKELETON_COUNT = 6;

export default function HomeScreen() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
    setLoading
  } = useStore();

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      filtered = filtered.filter(
        (property) => property.property_type === propertyTypeFilter
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filters
    if (activeFilters.length > 0) {
      if (
        activeFilters.includes("apartment") ||
        activeFilters.includes("house") ||
        activeFilters.includes("villa")
      ) {
        filtered = filtered.filter((property) => {
          const title = property.title.toLowerCase();
          return (
            (activeFilters.includes("apartment") &&
              title.includes("apartment")) ||
            (activeFilters.includes("house") && title.includes("house")) ||
            (activeFilters.includes("villa") && title.includes("villa"))
          );
        });
      }

      // Apply price sorting
      if (activeFilters.includes("price-asc")) {
        filtered.sort((a, b) => a.price - b.price);
      } else if (activeFilters.includes("price-desc")) {
        filtered.sort((a, b) => b.price - a.price);
      }
    }

    return filtered;
  }, [properties, searchQuery, activeFilters, propertyTypeFilter]);

  // In HomeScreen's useEffect
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
        
        // Fetch saved properties AFTER setting initial properties
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

  const renderContent = () => {
    if (loading) {
      return (
        <FlatList
          data={Array(SKELETON_COUNT).fill(null)}
          renderItem={() => <PropertyCardSkeleton />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          className="p-4"
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
        className="p-4"
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
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search properties..."
      />
      
      {/* Property Type Filter */}
      <FilterChips
        options={propertyTypeOptions}
        selectedFilters={[propertyTypeFilter]}
        onSelectFilter={(filterId) => {
          if (filterId === 'all' || filterId === 'rent' || filterId === 'sale') {
            setPropertyTypeFilter(filterId);
          }
        }}
        singleSelect={true}
      />
      
      {/* Regular Filters */}
      <FilterChips
        options={filterOptions}
        selectedFilters={activeFilters}
        onSelectFilter={(filterId) => {
          setActiveFilters(
            activeFilters.includes(filterId)
              ? activeFilters.filter((id) => id !== filterId)
              : [...activeFilters, filterId]
          );
        }}
      />
      
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 8,
  },
});