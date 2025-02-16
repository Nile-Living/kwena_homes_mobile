import { StyleSheet, FlatList, View } from "react-native";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import FilterChips from "@/components/FilterChips";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Colors } from "@/constants/Colors";

const filterOptions = [
  { id: "apartment", label: "Apartment" },
  { id: "house", label: "House" },
  { id: "villa", label: "Villa" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export default function HomeScreen() {
  const router = useRouter();

  const {
    properties,
    searchQuery,
    activeFilters,
    loading,
    setSearchQuery,
    setActiveFilters,
    toggleSavedProperty,
    setProperties,
  } = useStore();

  useEffect(() => {
    const fetchProperties = async () => {
      const mockProperties = [
        {
          id: "1",
          title: "Modern Apartment",
          price: 450000,
          location: "New Kasama",
          bedrooms: 2,
          bathrooms: 2,
          images: [
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
          ],
          liked: false,
        },
        {
          id: "2",
          title: "Luxury Villa",
          price: 1200000,
          location: "Leopards Hill",
          bedrooms: 4,
          bathrooms: 3,
          images: [
            "https://plus.unsplash.com/premium_photo-1724701624517-22953482ce56?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8a2VueWElMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D",
          ],
          liked: false,
        },
        {
          id: "3",
          title: "Cozy Cottage",
          price: 300000,
          location: "Chongwe",
          bedrooms: 3,
          bathrooms: 2,
          images: [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
          liked: false,
        },
        {
          id: "4",
          title: "Spacious Loft",
          price: 500000,
          location: "Rhodes Park",
          bedrooms: 2,
          bathrooms: 2,
          images: [
            "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
          ],
          liked: false,
        },
        {
          id: "5",
          title: "Beachfront Property",
          price: 850000,
          location: "Siavonga",
          bedrooms: 3,
          bathrooms: 2,
          images: [
            "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
          ],
          liked: false,
        },
        {
          id: "6",
          title: "Urban Studio",
          price: 200000,
          location: "Lusaka CBD",
          bedrooms: 1,
          bathrooms: 1,
          images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          ],
          liked: false,
        },
        {
          id: "7",
          title: "Country House",
          price: 400000,
          location: "Kafue",
          bedrooms: 4,
          bathrooms: 3,
          images: [
            "https://images.unsplash.com/photo-1585803432702-10cb6c23638b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGtlbnlhJTIwaG91c2V8ZW58MHx8MHx8fDA%3D",
          ],
          liked: false,
        },
        {
          id: "8",
          title: "Mountain Cabin",
          price: 350000,
          location: "Mwinilunga",
          bedrooms: 2,
          bathrooms: 1,
          images: [
            "https://images.unsplash.com/photo-1673262790281-ffa252979094?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGtlbnlhJTIwaG91c2V8ZW58MHx8MHx8fDA%3D",
          ],
          liked: false,
        },
        {
          id: "9",
          title: "City Penthouse",
          price: 950000,
          location: "Mass Media",
          bedrooms: 3,
          bathrooms: 3,
          images: [
            "https://images.unsplash.com/photo-1502672023488-70e25813eb80",
          ],
          liked: false,
        },
        {
          id: "10",
          title: "Historic Townhouse",
          price: 600000,
          location: "Kabulonga",
          bedrooms: 3,
          bathrooms: 2,
          images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
          ],
          liked: false,
        },
      ];
      setProperties(mockProperties);
    };

    fetchProperties();
  }, []);

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
    <SearchBar
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Search properties..."
    />
    <FilterChips
      options={filterOptions}
      selectedFilters={activeFilters}
      onSelectFilter={(filterId) => {
        setActiveFilters(
          activeFilters.includes(filterId)
            ? activeFilters.filter(id => id !== filterId)
            : [...activeFilters, filterId]
        );
      }}
    />
    <FlatList
      data={properties}
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
});
