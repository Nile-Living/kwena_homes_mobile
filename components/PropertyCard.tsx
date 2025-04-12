import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons"; // Import both icon sets
import { Property } from "@/store/useStore"; // Import your Property type

// Interface for the component props
interface PropertyCardProps {
  property: Property; // Use the defined Property type
  onPress: () => void;
  onLike?: () => void; // Optional like handler
  isLiked?: boolean; // Optional liked status indicator
}

// Helper function to format time difference
const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return "Unknown date";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (isNaN(diff)) return "Invalid date"; // Handle invalid date strings

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
     if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
     if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;

  } catch (e) {
      console.error("Error parsing date for getTimeAgo:", dateString, e);
      return "Unknown date";
  }
};

// Placeholder image URL
const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/300x200.png?text=No+Image";

// The PropertyCard Component
export default function PropertyCard({
  property,
  onPress,
  onLike,
  isLiked,
}: PropertyCardProps) {

  // --- Dynamic Feature Extraction based on Category ---
  let feature1Icon: React.ComponentProps<typeof Ionicons>['name'] | null = null;
  let feature1Value: string | number | null = null;
  let feature2Icon: React.ComponentProps<typeof Ionicons>['name'] | React.ComponentProps<typeof FontAwesome>['name'] | null = null;
  let feature2Value: string | number | null = null;
  let feature2IconLibrary: 'Ionicons' | 'FontAwesome' = 'Ionicons'; // Default

  // Safely access details
  const details = property.details || {};

  switch (property.category) {
    case 'house':
    case 'apartment':
    case 'lodge': // Assuming lodge also uses bed/bath
      feature1Icon = 'bed-outline';
      feature1Value = details.bedrooms ?? '-'; // Use details first
      feature2Icon = 'bathtub'; // Using FontAwesome
      feature2IconLibrary = 'FontAwesome';
      feature2Value = details.bathrooms ?? 0;
      break;
    case 'land':
    case 'farm': // Assuming farm might show size and maybe road access
      feature1Icon = 'resize-outline';
      feature1Value = details.size_sqm ? `${details.size_sqm} sqm` : '-';
      feature2Icon = 'car-outline';
      feature2Value = details.road_access ? 'Road Access' : null; // Only show if true?
      break;
    case 'commercial':
    case 'industrial': // Assuming industrial might show area and power
      feature1Icon = 'business-outline';
      feature1Value = details.property_type || property.category; // Show specific type or category
      feature2Icon = 'resize-outline';
      feature2Value = details.square_meters ? `${details.square_meters} sqm` : '-';
      break;
    // Add default case or handle other categories if necessary
    default:
      // Maybe show category as feature 1?
      feature1Icon = 'information-circle-outline';
      feature1Value = property.category;
      break;
  }
  // --- End Dynamic Feature Extraction ---

  return (
    <TouchableOpacity
      className="bg-white rounded-lg mb-4 shadow-md overflow-hidden border border-gray-100" // Added border and overflow
      onPress={onPress}
      delayPressIn={150} // Optional: slight delay before press registers
      activeOpacity={0.8} // Optional: feedback on press
    >
      {/* Image Section */}
      <Image
        source={{ uri: property.images?.[0] || PLACEHOLDER_IMAGE_URL }}
        className="w-full h-48" // Adjust height as needed (e.g., h-52)
        resizeMode="cover"
      />

      {/* Type Tag (Absolute Positioned) */}
      <View className="absolute top-3 left-3">
        <View
          className={`px-3 py-1 rounded-full shadow ${
            property.property_type === 'sale' ? 'bg-emerald-700' : 'bg-amber-600' // Example colors
          }`}
        >
          <Text className="text-white text-xs font-semibold">
            {property.property_type === 'sale' ? 'For Sale' : 'For Rent'}
          </Text>
        </View>
      </View>

      {/* Like Button (Absolute Positioned, conditional) */}
      {onLike && (
        <TouchableOpacity
          className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow" // Added slight transparency
          onPress={onLike}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase tappable area
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={22} // Slightly smaller icon?
            color={isLiked ? "#ef4444" : "#374151"} // Example: Red when liked, dark gray otherwise
          />
        </TouchableOpacity>
      )}

      {/* Content Section */}
      <View className="p-4">
        {/* Price Row */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-bold text-emerald-800">
            K{property.price?.toLocaleString() ?? 'N/A'} {/* Handle potential null price */}
            {property.property_type === 'rent' && (
              <Text className="text-sm font-medium text-gray-600 self-end ml-1">
                /mo
              </Text>
            )}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-lg font-semibold text-gray-900 mb-1" numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={1}>
          {property.location}
        </Text>

        {/* Metadata Row */}
        <View className="flex-row justify-between items-center">
          {/* Time Ago */}
          <Text className="text-xs text-gray-500">
            {getTimeAgo(property.created_at)}
          </Text>

          {/* Dynamic Features Display */}
          <View className="flex-row space-x-3 items-center">
            {feature1Icon && feature1Value !== null && (
              <View className="flex-row items-center space-x-1">
                <Ionicons name={feature1Icon} size={16} color="#4b5563" />
                <Text className="text-sm text-gray-600">{feature1Value}</Text>
              </View>
            )}
            {feature2Icon && feature2Value !== null && (
              <View className="flex-row items-center space-x-1">
                {feature2IconLibrary === 'FontAwesome' ? (
                  <FontAwesome name={feature2Icon as any} size={14} color="#4b5563" /> // Adjusted size
                ) : (
                  <Ionicons name={feature2Icon as any} size={16} color="#4b5563" />
                )}
                <Text className="text-sm text-gray-600">{feature2Value}</Text>
              </View>
            )}
          </View>
          {/* End Dynamic Features Display */}
        </View>
      </View>
    </TouchableOpacity>
  );
}
