import { Platform, View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/Colors";
import * as Location from "expo-location";

const LUSAKA_COORDS = {
  latitude: -15.4167,
  longitude: 28.2833,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function ExploreScreen() {
  const router = useRouter();
  const { properties, searchQuery, setSearchQuery } = useStore();
  const [region, setRegion] = useState<Region>(LUSAKA_COORDS);

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

  const handleMarkerPress = (propertyId: string) => {
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

        {/* <Button title="Lusaka" onPress={centerOnLusaka} /> */}
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
                  description={`$${property.price.toLocaleString()} - ${
                    property.location
                  }`}
                  onPress={() => handleMarkerPress(property.id)}
                />
              )
          )}
        </MapView>
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
