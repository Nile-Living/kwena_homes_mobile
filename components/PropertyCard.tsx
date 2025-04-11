import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    // Make bedrooms/bathrooms optional if they come from details
    bedrooms?: number;
    bathrooms?: number;
    images: string[];
    // 'liked' inside property is no longer strictly needed here if passed separately
    // liked?: boolean;
    property_type: "rent" | "sale";
    created_at: string;
    details?: any;

  };
  onPress: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

export default function PropertyCard({
  property,
  onPress,
  onLike,
  isLiked, // <-- Destructure the new prop
}: PropertyCardProps) {
  // Default bedrooms/bathrooms if not present (might come from details now)
  const displayBedrooms = property.bedrooms ?? property.details?.bedrooms ?? "-";
  const displayBathrooms =
    property.bathrooms ?? property.details?.bathrooms ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} delayPressIn={150}>
      <Image
        // Use a placeholder if images array might be empty
        source={{ uri: property.images?.[0] || "placeholder_image_url" }}
        style={styles.image}
        resizeMode="cover"
      />
      {/* Type Tag (For Sale/For Rent) */}
      <View style={styles.tagContainer}>
        <View
          style={[
            styles.typeTag,
            {
              backgroundColor:
                property.property_type === "sale" ? "#244835" : "#ED9B6B", // Example colors
            },
          ]}
        >
          <Text style={styles.typeTagText}>
            {property.property_type === "sale" ? "For Sale" : "For Rent"}
          </Text>
        </View>
      </View>

      {/* Like Button */}
      {onLike && ( // Conditionally render if onLike is provided
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Ionicons
            // Use the isLiked prop passed from HomeScreen
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            // Use the isLiked prop passed from HomeScreen
            color={isLiked ? "#ED9B6B" : "#244835"} // Example colors
          />
        </TouchableOpacity>
      )}

      {/* Use className="p-4" if using Nativewind */}
      <View style={styles.content}>
        {/* Price Row */}
        {/* Use className="flex-row justify-between items-start mb-2" */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          {/* Use className="text-2xl font-bold text-primary-800" */}
          {/* Use style={styles.price} */}
          <Text style={styles.price}>
            K{property.price.toLocaleString()}
            {property.property_type === "rent" && (
              // Use className="text-base font-medium text-neutral-600"
              // Use style={styles.rentPeriod}
              <Text style={styles.rentPeriod}>/mo</Text>
            )}
          </Text>
        </View>

        {/* Title & Location */}
        {/* Use className="text-lg font-semibold text-neutral-900 mb-1" */}
        {/* Use style={styles.title} */}
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        {/* Use className="text-sm text-neutral-600 mb-3" */}
        {/* Use style={styles.location} */}
        <Text style={styles.location} numberOfLines={1}>
          {property.location}
        </Text>

        {/* Metadata Row */}
        {/* Use className="flex-row justify-between items-center" */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Time Ago */}
          {/* Use className="text-xs text-neutral-500" */}
          {/* Use style={styles.timeAgo} */}
          <Text style={styles.timeAgo}>
            {getTimeAgo(property.created_at)}
          </Text>

          {/* Features */}
          {/* Use className="flex-row gap-4" */}
          {/* Use style={styles.features} */}
          <View style={styles.features}>
            {/* Use className="flex-row items-center gap-1" */}
            {/* Use style={styles.feature} */}
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={16} color="#4b5563" />
              {/* Use className="text-sm text-neutral-600" */}
              {/* Use style={styles.featureText} */}
              <Text style={styles.featureText}>{displayBedrooms}</Text>
            </View>
            {/* Use className="flex-row items-center gap-1" */}
            {/* Use style={styles.feature} */}
            <View style={styles.feature}>
              <FontAwesome name="bathtub" size={16} color="#4b5563" />
              {/* Use className="text-sm text-neutral-600" */}
              {/* Use style={styles.featureText} */}
              <Text style={styles.featureText}>{displayBathrooms}</Text>
            </View>
            {/* Add other features like garages/parkings if needed */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- Styles --- (Keep your existing styles)
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
  tagContainer: {
    position: "absolute",
    top: 16,
    left: 16,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeTagText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  likeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFF", // Example background for visibility
    borderRadius: 20, // Make it circular
    padding: 8, // Add padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  price: {
    fontSize: 20, // text-2xl is approx 24, adjust as needed
    fontWeight: "700", // font-bold
    color: "#244835", // text-primary-800 (example mapping)
  },
  rentPeriod: {
    fontSize: 14, // text-base is 16, adjust as needed
    fontWeight: "500", // font-medium
    color: "#4B5563", // text-neutral-600 (example mapping)
  },
  title: {
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    color: "#1F2937", // text-neutral-900 (example mapping)
    marginBottom: 4, // mb-1
  },
  location: {
    fontSize: 14, // text-sm
    color: "#4B5563", // text-neutral-600
    marginBottom: 12, // mb-3
  },
  timeAgo: {
    fontSize: 12, // text-xs
    color: "#6B7280", // text-neutral-500
  },
  features: {
    flexDirection: "row",
    gap: 16, // gap-4
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
  },
  featureText: {
    fontSize: 14, // text-sm
    color: "#4B5563", // text-neutral-600
  },
});
