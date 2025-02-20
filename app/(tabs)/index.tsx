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
          images: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae"],
          liked: false,
          coordinates: {
            latitude: -15.3950,
            longitude: 28.3228,
          },
          description: "A beautiful modern apartment in the heart of New Kasama. Features include an open floor plan, modern kitchen with stainless steel appliances, and a private balcony with city views.",
          agent: {
            name: "Jane Mutale",
            phone: "+260977123456",
            email: "jane.mutale@zamaproperties.com"
          }
        },
        {
          id: "2",
          title: "Luxury Villa",
          price: 1200000,
          location: "Leopards Hill",
          bedrooms: 4,
          bathrooms: 3,
          images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D"],
          liked: false,
          coordinates: {
            latitude: -15.4255,
            longitude: 28.3554,
          },
          description: "Exquisite luxury villa in the prestigious Leopards Hill area. This property features a grand entryway, spacious living areas, gourmet kitchen, and resort-style pool with panoramic views.",
          agent: {
            name: "John Mwanza",
            phone: "+260966789012",
            email: "john.mwanza@zamaproperties.com"
          }
        },
        // Continue adding agent information to all properties...
        {
          id: "3",
          title: "Cozy Cottage",
          price: 300000,
          location: "Chongwe",
          bedrooms: 3,
          bathrooms: 2,
          images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
          liked: false,
          coordinates: {
            latitude: -15.3280,
            longitude: 28.7016,
          },
          description: "Charming cottage nestled in a quiet Chongwe neighborhood. Perfect for those seeking a peaceful retreat with easy access to the city.",
          agent: {
            name: "Mary Banda",
            phone: "+260955678901",
            email: "mary.banda@zamaproperties.com"
          }
        },
        {
          id: "4",
          title: "Spacious Loft",
          price: 500000,
          location: "Rhodes Park",
          bedrooms: 2,
          bathrooms: 2,
          images: ["https://images.unsplash.com/photo-1519710164239-da123dc03ef4"],
          liked: false,
          coordinates: {
            latitude: -15.4085,
            longitude: 28.2907,
          },
          description: "Modern loft-style apartment in Rhodes Park with high ceilings, exposed brick walls, and industrial design elements. Includes a dedicated workspace and rooftop access.",
          agent: {
            name: "David Phiri",
            phone: "+260977345678",
            email: "david.phiri@zamaproperties.com"
          }
        },
        {
          id: "5",
          title: "Beachfront Property",
          price: 850000,
          location: "Siavonga",
          bedrooms: 3,
          bathrooms: 2,
          images: ["https://images.unsplash.com/photo-1501594907352-04cda38ebc29"],
          liked: false,
          coordinates: {
            latitude: -16.5382,
            longitude: 28.7208,
          },
          description: "Stunning beachfront property in Siavonga with direct lake access. Perfect for weekend getaways or investment opportunities in Zambia's growing tourism sector.",
          agent: {
            name: "Sarah Tembo",
            phone: "+260966234567",
            email: "sarah.tembo@zamaproperties.com"
          }
        },
        {
          id: "6",
          title: "Urban Studio",
          price: 200000,
          location: "Lusaka CBD",
          bedrooms: 1,
          bathrooms: 1,
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
          liked: false,
          coordinates: {
            latitude: -15.4167,
            longitude: 28.2833,
          },
          description: "Compact and stylish studio apartment in downtown Lusaka. Perfect for young professionals or as an investment property in the growing CBD area.",
          agent: {
            name: "Michael Zulu",
            phone: "+260977123789",
            email: "michael.zulu@zamaproperties.com"
          }
        },
        {
          id: "7",
          title: "Country House",
          price: 400000,
          location: "Kafue",
          bedrooms: 4,
          bathrooms: 3,
          images: ["https://images.unsplash.com/photo-1585803432702-10cb6c23638b"],
          liked: false,
          coordinates: {
            latitude: -15.7691,
            longitude: 28.1824,
          },
          description: "Rustic country house on a large plot in Kafue. Features include fruit trees, garden area, and views of the surrounding countryside.",
          agent: {
            name: "Rebecca Mulenga",
            phone: "+260966567890",
            email: "rebecca.mulenga@zamaproperties.com"
          }
        },
        {
          id: "8",
          title: "Mountain Cabin",
          price: 350000,
          location: "Mwinilunga",
          bedrooms: 2,
          bathrooms: 1,
          images: ["https://images.unsplash.com/photo-1673262790281-ffa252979094"],
          liked: false,
          coordinates: {
            latitude: -11.7373,
            longitude: 24.4285,
          },
          description: "Peaceful mountain cabin in Mwinilunga with stunning views. Ideal for those seeking a tranquil retreat away from city life.",
          agent: {
            name: "Joseph Mwape",
            phone: "+260977890123",
            email: "joseph.mwape@zamaproperties.com"
          }
        },
        {
          id: "9",
          title: "City Penthouse",
          price: 950000,
          location: "Mass Media",
          bedrooms: 3,
          bathrooms: 3,
          images: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80"],
          liked: false,
          coordinates: {
            latitude: -15.3990,
            longitude: 28.3134,
          },
          description: "Luxurious penthouse in the heart of Mass Media with panoramic city views. Features include floor-to-ceiling windows, designer finishes, and a private rooftop terrace.",
          agent: {
            name: "Linda Chanda",
            phone: "+260966456789",
            email: "linda.chanda@zamaproperties.com"
          }
        },
        {
          id: "10",
          title: "Historic Townhouse",
          price: 600000,
          location: "Kabulonga",
          bedrooms: 3,
          bathrooms: 2,
          images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750", "https://images.unsplash.com/photo-1502672023488-70e25813eb80"],
          liked: false,
          coordinates: {
            latitude: -15.4017,
            longitude: 28.3098,
          },
          description: "Character-filled townhouse in the established Kabulonga neighborhood. Features original architectural details blended with modern updates.",
          agent: {
            name: "Thomas Mumba",
            phone: "+260977234567",
            email: "thomas.mumba@zamaproperties.com"
          }
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
