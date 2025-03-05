import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
    property_type: 'rent' | 'sale';
    created_at: string;
  };
  onPress: () => void;
  onLike?: () => void;
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
}: PropertyCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} delayPressIn={150} activeOpacity={0.7}>
      <Image
        source={{ uri: property.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.tagContainer}>
        <View style={[
          styles.typeTag, 
          { backgroundColor: property.property_type === 'sale' ? '#244835' : '#ED9B6B' }
        ]}>
          <Text style={styles.typeTagText}>
            {property.property_type === 'sale' ? 'For Sale' : 'For Rent'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.likeButton} onPress={onLike}>
        <Ionicons
          name={property.liked ? "heart" : "heart-outline"}
          size={24}
          color={property.liked ? "#ED9B6B" : "#244835"}
        />
      </TouchableOpacity>

      <View className="p-4">
        {/* Price Row */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-2xl font-bold text-primary-800">
            K{property.price.toLocaleString()}
            {property.property_type === 'rent' && 
              <Text className="text-base font-medium text-neutral-600">/mo</Text>}
          </Text>
        </View>

        {/* Title & Location */}
        <Text className="text-lg font-semibold text-neutral-900 mb-1">
          {property.title}
        </Text>
        <Text className="text-sm text-neutral-600 mb-3">
          {property.location}
        </Text>

        {/* Metadata Row */}
        <View className="flex-row justify-between items-center">
          {/* Time Ago */}
          <Text className="text-xs text-neutral-500">
            {getTimeAgo(property.created_at)}
          </Text>
          
          {/* Features */}
          <View className="flex-row gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={16} color="#4b5563" />
              <Text className="text-sm text-neutral-600">
                {property.bedrooms}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              {/* <Ionicons name="water-outline" size={16} color="#4b5563" /> */}
              <FontAwesome name="bathtub" size={16} color="#4b5563" />
              <Text className="text-sm text-neutral-600">
                {property.bathrooms || 0}
              </Text>
            </View>
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
  rentPeriod: {
    fontSize: 14,
    fontWeight: "400",
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
  timeAgo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
});