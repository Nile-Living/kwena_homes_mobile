import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAppColors,
  createStyles as createGlobalStyles,
} from "@/styles/PropertyDetails.styles";

interface PropertyHeaderInfoProps {
  price: number;
  priceUnit: string;
  propertyTypeDisplay: string;
  title: string;
  location: string;
  onViewOnMap: () => void;
}

const PropertyHeaderInfo: React.FC<PropertyHeaderInfoProps> = ({
  price,
  priceUnit,
  propertyTypeDisplay,
  title,
  location,
  onViewOnMap,
}) => {
  const COLORS = useAppColors();
  const styles = React.useMemo(() => createGlobalStyles(COLORS), [COLORS]);

  return (
    <View style={styles.propertyHeader}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          K{price.toLocaleString()}
          {priceUnit}
        </Text>
        <View style={styles.propertyTypeTag}>
          <Text style={styles.propertyTypeText}>{propertyTypeDisplay}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <Text style={styles.location}>{location}</Text>
        <TouchableOpacity style={styles.mapButton} onPress={onViewOnMap}>
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PropertyHeaderInfo;