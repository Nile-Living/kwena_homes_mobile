import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  useAppColors,
  createStyles as createGlobalStyles,
  LIGHT_COLORS,
} from "@/styles/PropertyDetails.styles";

interface NearbyPlace {
  name: string;
  distance: string;
  icon: string;
}

interface PropertyNearbyContentProps {
  nearbyPlaces: NearbyPlace[];
  onViewAllOnMap: () => void;
}

const PropertyNearbyContent: React.FC<PropertyNearbyContentProps> = ({
  nearbyPlaces,
  onViewAllOnMap,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.nearbyContainer}>
      <Text style={styles.sectionTitle}>Nearby Places</Text>

      {nearbyPlaces.map((place, index) => (
        <View key={index} style={styles.nearbyPlaceItem}>
          <View style={styles.nearbyIconContainer}>
            <FontAwesome
              name={place.icon as keyof typeof FontAwesome.glyphMap}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.nearbyPlaceInfo}>
            <Text style={styles.nearbyPlaceName}>{place.name}</Text>
            <Text style={styles.nearbyPlaceDistance}>{place.distance}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewMapButton} onPress={onViewAllOnMap}>
        <Ionicons name="map-outline" size={20} color={LIGHT_COLORS.white} />
        <Text style={styles.viewMapButtonText}>View All on Map</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PropertyNearbyContent;