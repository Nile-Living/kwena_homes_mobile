import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms?: number;
    images: string[];
    liked?: boolean;
  };
  onPress: () => void;
  onLike?: () => void;
}

export default function PropertyCard({
  property,
  onPress,
  onLike,
}: PropertyCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <TouchableOpacity style={styles.likeButton} onPress={onLike}>
        <Ionicons
          name={property.liked ? "heart" : "heart-outline"}
          size={24}
          color={property.liked ? "#ED9B6B" : "#244835"}
        />
      </TouchableOpacity>

      <View style={styles.content}>
      <Text style={styles.price}>${property.price.toLocaleString()}</Text>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.location}>{property.location}</Text>
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="bed-outline" size={16} color="#666" />
            <Text style={styles.featureText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="water-outline" size={16} color="#666" />
            <Text style={styles.featureText}>{property.bathrooms}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  likeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#244835",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#244835",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  features: {
    flexDirection: "row",
    gap: 16,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
  },
});
