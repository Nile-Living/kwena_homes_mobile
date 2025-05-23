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
import { useStore, Property, PropertyDetails } from "@/store/useStore"; // Import PropertyDetails
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
        // MODIFICATION: Changed select query to fetch only from 'properties'
        const { data, error } = await getSupabase()
          .from("properties")
          .select("*") // Removed "agents(*)"
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedProperties: Property[] = data.map((dbRow: any) => {
          const coordinates = dbRow.coordinates
            ? {
                latitude: parseFloat(dbRow.coordinates.latitude),
                longitude: parseFloat(dbRow.coordinates.longitude),
              }
            : undefined;

          let propertyDetails: PropertyDetails | undefined | any = undefined;
          // The 'properties' table schema shows 'bedrooms' and 'bathrooms' directly.
          // We map these to the 'details' object for consistency with the Property type.
          if (
            (dbRow.category === "house" || dbRow.category === "apartment") &&
            (dbRow.bedrooms !== undefined || dbRow.bathrooms !== undefined)
          ) {
            propertyDetails = {
              bedrooms: dbRow.bedrooms,
              bathrooms: dbRow.bathrooms,
            };
          }
          // Add similar handling if other detail-like columns (e.g., size_sqm for land)
          // exist directly on the 'properties' table and need to be in 'details'.

          return {
            // Fields directly from dbRow (from 'properties' table)
            id: dbRow.id,
            title: dbRow.title,
            price: dbRow.price,
            location: dbRow.location,
            images: dbRow.images || [],
            coordinates: coordinates,
            description: dbRow.description,
            property_type: dbRow.property_type,
            category: dbRow.category,
            created_at: dbRow.created_at,
            user_id: dbRow.user_id,
            agent_id: dbRow.agent_id, // agent_id is still available if it's a column in 'properties'
            contact_phone_number: dbRow.contact_phone_number,
            contact_whatsapp_number: dbRow.contact_whatsapp_number,
            use_phone_for_call: dbRow.use_phone_for_call,
            use_whatsapp_for_message: dbRow.use_whatsapp_for_message,

            // Optional fields from Property type:
            // These will be undefined if not present in dbRow (i.e., not columns in 'properties' table)
            status: dbRow.status,
            last_updated: dbRow.last_updated,
            is_promoted: dbRow.is_promoted,

            details: propertyDetails, // Assign constructed details

            liked: undefined, // 'liked' state is managed by Zustand, not fetched here
          };
        });
        setExploreProperties(formattedProperties);

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
  }, [params.propertyId]);

  useEffect(() => {
    if (params.latitude && params.longitude) {
      const lat = parseFloat(params.latitude);
      const lon = parseFloat(params.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        const timeout = setTimeout(() => setTrackViewChanges(false), 1500);
        return () => clearTimeout(timeout);
      }
    } else if (Platform.OS !== "web") {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
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
          setRegion(LUSAKA_COORDS);
        } finally {
          const timeout = setTimeout(() => setTrackViewChanges(false), 1000);
          return () => clearTimeout(timeout);
        }
      })();
    } else {
      setRegion(LUSAKA_COORDS);
      const timeout = setTimeout(() => setTrackViewChanges(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [params.latitude, params.longitude, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete) {
      const timer = setTimeout(() => {
        setTrackViewChanges(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [initialLoadComplete, exploreProperties.length]);

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
  };

  const handlePreviewPress = (propertyId: string) => {
    router.push(`../property/${propertyId}`);
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
          showsUserLocation={true}
        >
          {exploreProperties.map(
            (property) =>
              property.coordinates && (
                <Marker
                  key={property.id}
                  coordinate={property.coordinates}
                  tracksViewChanges={tracksViewChanges}
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
