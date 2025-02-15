import { StyleSheet, FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { Colors } from "@/constants/Colors";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const properties = [
    {
      id: "1",
      title: "Modern Apartment",
      price: 450000,
      location: "New Kasama",
      bedrooms: 2,
      bathrooms: 2,
      images: ["https://images.unsplash.com/photo-1507089947368-19c1da9775ae"],
      liked: false,
    },
    {
      id: "2",
      title: "Luxury Villa",
      price: 1200000,
      location: "Leopards Hill",
      bedrooms: 4,
      bathrooms: 3,
      images: ["https://images.unsplash.com/photo-1560185127-6a1865aa2a4f"],
      liked: false,
    },
    {
      id: "3",
      title: "Cozy Cottage",
      price: 300000,
      location: "Chongwe",
      bedrooms: 3,
      bathrooms: 2,
      images: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511"],
      liked: false,
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
    },
    {
      id: "7",
      title: "Country House",
      price: 400000,
      location: "Kafue",
      bedrooms: 4,
      bathrooms: 3,
      images: ["https://images.unsplash.com/photo-1475856034135-1a420e1e2a15"],
      liked: false,
    },
    {
      id: "8",
      title: "Mountain Cabin",
      price: 350000,
      location: "Mwinilunga",
      bedrooms: 2,
      bathrooms: 1,
      images: ["https://images.unsplash.com/photo-1507477338202-487281e6c69a"],
      liked: false,
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
    },
    {
      id: "10",
      title: "Historic Townhouse",
      price: 600000,
      location: "Kabulonga",
      bedrooms: 3,
      bathrooms: 2,
      images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750"],
      liked: false,
    },
  ];
  

  const handlePropertyPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };



  return( 
  <View style={styles.container}>
    <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search properties..."
      />
    <FlatList
        data={properties}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => handlePropertyPress(item.id)}
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
