import { Platform, View, Text, StyleSheet, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { useRouter } from "expo-router";
import { useStore } from "@/store/useStore";
import SearchBar from "@/components/SearchBar";
import { Colors } from "@/constants/Colors";

export default function ExploreScreen() {
  const router = useRouter();
  const { properties, searchQuery, setSearchQuery } = useStore();
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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
