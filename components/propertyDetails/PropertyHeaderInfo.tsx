import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";

interface PropertyHeaderInfoProps {
  price: number;
  priceUnit: string;
  propertyTypeDisplay: string;
  title: string;
  subtitle: string;
  location: string;
  onViewOnMap: () => void;
  viewCount: number;
}

const PropertyHeaderInfo: React.FC<PropertyHeaderInfoProps> = ({
  price,
  priceUnit,
  propertyTypeDisplay,
  title,
  subtitle,
  location,
  onViewOnMap,
  viewCount,
}) => {
  return (
    <View style={styles.propertyHeader}>
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {priceUnit}
          {price.toLocaleString()}
        </Text>
        <View style={styles.propertyTypeTag}>
          <Text style={styles.propertyTypeText}>{propertyTypeDisplay}</Text>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
        <Text style={styles.location}>{location}</Text>
        <TouchableOpacity style={styles.mapButton} onPress={onViewOnMap}>
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewCountRow}>
        <Ionicons name="eye-outline" size={16} color={COLORS.darkGray} />
        <Text style={styles.viewCountText}>{viewCount} views</Text>
      </View>
    </View>
  );
};

export default PropertyHeaderInfo;
