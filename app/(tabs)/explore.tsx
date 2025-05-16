// src/app/explore.tsx (or your actual path to ExploreScreen.tsx)
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { useRouter, useLocalSearchParams } from "expo-router"; // Import useLocalSearchParams
import { useStore, Property } from "@/store/useStore";
// import SearchBar from "@/components/SearchBar"; // SearchBar not used in current ExploreScreen
import PriceMarker from "@/components/PriceMarker";
import * as Location from "expo-location";
import { getSupabase } from "@/supabaseClient";

const LUSAKA_COORDS = {
  latitude: -15.4167,
  longitude: 28.2833,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const PropertyPreview = ({
  property,
  onPress,
}: {
  property: Property;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 left-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden"
      style={[
        Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
        }),
      ]}
    >
      <View className="flex-row h-24">
        <Image
          source={{
            uri:
              property.images && property.images.length > 0
                ? property.images[0]
                : "https://via.placeholder.com/100x100.png?text=No+Image",
          }}
          className="w-24 h-24"
        />
        <View className="flex-1 p-3">
          <Text
            className="text-lg font-semibold text-gray-800"
            numberOfLines={1}
          >
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
  // Get route parameters
  const params = useLocalSearchParams<{
    propertyId?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const [region, setRegion] = useState<Region>(LUSAKA_COORDS);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [exploreProperties, setExploreProperties] = useState<Property[]>([]);
  const [tracksViewChanges, setTrackViewChanges] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchExploreProperties = async () => {
      try {
        const { data, error } = await getSupabase()
          .from("properties")
          .select("*, agents(*)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedProperties: Property[] = data.map((prop: any) => ({
          id: prop.id,
          title: prop.title,
          price: prop.price,
          location: prop.location,
          images: prop.images || [],
          coordinates: prop.coordinates
            ? {
                latitude: parseFloat(prop.coordinates.latitude),
                longitude: parseFloat(prop.coordinates.longitude),
              }
            : undefined,
          description: prop.description,
          property_type: prop.property_type,
          category: prop.category,
          created_at: prop.created_at,
          status: prop.status,
          details: prop.details, // Assuming details are fetched or handled appropriately
          // agent: prop.agents, // Map agent data if needed
        }));
        setExploreProperties(formattedProperties);

        // If propertyId is passed, try to select it
        if (params.propertyId) {
          const foundProperty = formattedProperties.find(
            (p) => p.id === params.propertyId
          );
          if (foundProperty) {
            setSelectedProperty(foundProperty);
          }
        }
        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error fetching explore properties:", error);
      }
    };

    fetchExploreProperties();
  }, [params.propertyId]); // Re-fetch or re-evaluate if propertyId changes (though typically not needed for this screen)

  useEffect(() => {
    // Set region based on params or device location
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lon = parseFloat(params.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01, // Zoom in a bit more
          longitudeDelta: 0.01,
        });
        // Stop tracking changes after initial region set from params
        const timeout = setTimeout(() => setTrackViewChanges(false), 1500); // Slightly longer for map to settle
        return () => clearTimeout(timeout);
      }
    } else if (Platform.OS !== "web") {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          // Fallback to default Lusaka coordinates if permission denied
          setRegion(LUSAKA_COORDS);
          const timeout = setTimeout(() => setTrackViewChanges(false), 1000);
          return () => clearTimeout(timeout);
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
          setRegion(LUSAKA_COORDS); // Fallback on error
        } finally {
          const timeout = setTimeout(() => setTrackViewChanges(false), 1000);
          return () => clearTimeout(timeout);
        }
      })();
    } else {
      // For web or if no params and no location permission
      setRegion(LUSAKA_COORDS);
      const timeout = setTimeout(() => setTrackViewChanges(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [params.latitude, params.longitude, initialLoadComplete]); // Depend on initialLoadComplete to ensure properties are loaded

  // Stop tracking marker changes after a delay to improve performance
  useEffect(() => {
    if (initialLoadComplete) {
      const timer = setTimeout(() => {
        setTrackViewChanges(false);
      }, 2000); // Adjust delay as needed
      return () => clearTimeout(timer);
    }
  }, [initialLoadComplete, exploreProperties.length]);

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
    if (property.coordinates) {
      // Optionally re-center map on marker press, can be smooth
      // mapRef.current?.animateToRegion({ ...property.coordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    }
  };

  const handlePreviewPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`); // Ensure this path is correct relative to explore screen
  };

  return (
    <View style={styles.container} className="mt-8">
      {Platform.OS === "web" ? (
        <View style={styles.mapPlaceholder}>
          <Text>Map view is not supported on web.</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          // onRegionChangeComplete={setRegion} // Can be performance intensive, consider if needed
          showsUserLocation={true}
        >
          {exploreProperties.map(
            (property) =>
              property.coordinates && (
                <Marker
                  key={property.id}
                  coordinate={property.coordinates}
                  tracksViewChanges={tracksViewChanges} // Control this for performance
                  onPress={() => handleMarkerPress(property)}
                >
                  <PriceMarker price={property.price} />
                  {/* Tooltip/Callout can be added here if PriceMarker doesn't include title/desc */}
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

// Styles for ExploreScreen (ensure these are minimal or also externalized if preferred)
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
