import { Platform, View, Text, StyleSheet, Dimensions, Image, Pressable } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useStore, Property } from "@/store/useStore";
import SearchBar from "@/components/SearchBar";
import PriceMarker from "@/components/PriceMarker"; // Import with correct name
import * as Location from "expo-location";

const LUSAKA_COORDS = {
  latitude: -15.4167,
  longitude: 28.2833,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const PropertyPreview = ({ property, onPress }: { property: Property; onPress: () => void }) => {
  return (
    <Pressable 
      onPress={onPress}
      className="absolute bottom-6 left-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden"
      style={[Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }})]}
    >
      <View className="flex-row h-24">
        <Image
          source={{ uri: property.images[0] }}
          className="w-24 h-24"
        />
        <View className="flex-1 p-3">
          <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
            {property.title}
          </Text>
          <Text className="text-base text-gray-600" numberOfLines={1}>
            {property.location}
          </Text>
          <Text className="text-base font-semibold text-green-600">
            K{property.price.toLocaleString()}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default function ExploreScreen() {
  const router = useRouter();
  const { properties, searchQuery, setSearchQuery } = useStore();
  const [region, setRegion] = useState<Region>(LUSAKA_COORDS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.log("Error getting location", error);
      }
    })();
  }, []);

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePreviewPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search location..."
        />
      </View>
      
      {Platform.OS === "web" ? (
        <View style={styles.mapPlaceholder}>
          <Text>Map view is not supported on web.</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {properties.map(
            (property) =>
              property.coordinates && (
                <Marker
                  key={property.id}
                  coordinate={property.coordinates}
                  title={property.title}
                  description={`K${property.price.toLocaleString()} - ${property.location}`}
                  onPress={() => handleMarkerPress(property)}
                >
                  <PriceMarker price={property.price} />
                </Marker>
              )
          )}
        </MapView>
      )}

      {selectedProperty && (
        <PropertyPreview
          property={selectedProperty}
          onPress={() => handlePreviewPress(selectedProperty.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});