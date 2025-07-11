import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Property } from "@/store/useStore";
import { useAnalytics } from "@/hooks/useAnalytics";

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
  isInjectedAd?: boolean; // Added this prop
}

const getTimeAgo = (dateString?: string): string => {
  if (!dateString) return "Unknown date";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (isNaN(diff)) return "Invalid date";

    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  } catch (e) {
    console.error("Error parsing date for getTimeAgo:", dateString, e);
    return "Unknown date";
  }
};

const PLACEHOLDER_IMAGE_URL =
  "https://via.placeholder.com/300x200.png?text=No+Image";

export default function PropertyCard({
  property,
  onPress,
  onLike,
  isLiked,
  isInjectedAd,
}: PropertyCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { trackPropertyView, trackPropertySave } = useAnalytics();

  const handlePress = () => {
    // Track property view
    trackPropertyView(property.id, {
      category: property.category,
      property_type: property.property_type,
      price: property.price,
    });
    
    if (onPress) {
      onPress();
    }
  };

  const handleLike = () => {
    // Track property save/unsave
    trackPropertySave(property.id, {
      action: isLiked ? 'unsave' : 'save',
      category: property.category,
      property_type: property.property_type,
    });
    
    if (onLike) {
      onLike();
    }
  };

  let feature1Icon: React.ComponentProps<typeof Ionicons>["name"] | null = null;
  let feature1Value: string | number | null = null;
  let feature2Icon:
    | React.ComponentProps<typeof Ionicons>["name"]
    | React.ComponentProps<typeof FontAwesome>["name"]
    | null = null;
  let feature2Value: string | number | null = null;
  let feature2IconLibrary: "Ionicons" | "FontAwesome" = "Ionicons";

  const details = property.details || {};

  switch (property.category) {
    case "house":
    case "apartment":
    case "lodge":
      feature1Icon = "bed-outline";
      feature1Value = details.bedrooms ?? "-";
      feature2Icon = "bathtub";
      feature2IconLibrary = "FontAwesome";
      feature2Value = details.bathrooms ?? 0;
      break;
    case "land":
    case "farm":
      feature1Icon = "resize-outline";
      feature1Value = details.size_sqm ? `${details.size_sqm} sqm` : "-";
      feature2Icon = "car-outline";
      feature2Value = details.road_access ? "Road Access" : null;
      break;
    case "commercial":
    case "industrial":
      feature1Icon = "business-outline";
      feature1Value = details.property_type || property.category;
      feature2Icon = "resize-outline";
      feature2Value = details.square_meters
        ? `${details.square_meters} sqm`
        : "-";
      break;
    default:
      feature1Icon = "information-circle-outline";
      feature1Value = property.category;
      break;
  }

  const renderStatusTag = () => {
    let tagText: string | null = null;
    let tagBgColor = "";
    let tagTextColor = "text-white";

    if (property.status === "offer-accepted") {
      tagText = "Offer Accepted";
      tagBgColor = "bg-yellow-500 dark:bg-yellow-600";
    } else if (property.status === "under-maintenance") {
      tagText = "Coming Soon";
      tagBgColor = "bg-blue-500 dark:bg-blue-600";
    }

    if (!tagText) return null;

    return (
      <View
        className={`px-2.5 py-1 rounded-full shadow-sm ${tagBgColor} absolute top-3 right-3`}
      >
        <Text className={`text-xs font-semibold ${tagTextColor}`}>
          {tagText}
        </Text>
      </View>
    );
  };

  const propertyTypeTagBg =
    property.property_type === "sale"
      ? "bg-emerald-700 dark:bg-emerald-600"
      : "bg-amber-600 dark:bg-amber-500";

  const cardBorderColor = isInjectedAd
    ? isDark
      ? "border-blue-500"
      : "border-blue-400"
    : isDark
      ? "border-slate-700"
      : "border-gray-100";
  const cardBgColor = isInjectedAd
    ? isDark
      ? "bg-slate-700"
      : "bg-blue-50"
    : isDark
      ? "bg-slate-800"
      : "bg-white";

  return (
    <TouchableOpacity
      className={`rounded-lg mb-4 shadow-md overflow-hidden border-2 ${cardBorderColor} ${cardBgColor}`}
      onPress={handlePress}
      delayPressIn={150}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: property.images?.[0] || PLACEHOLDER_IMAGE_URL }}
        className="w-full h-48"
        resizeMode="cover"
      />

      <View className="absolute top-3 left-3">
        <View className={`px-3 py-1 rounded-full shadow ${propertyTypeTagBg}`}>
          <Text className="text-white text-xs font-semibold">
            {property.property_type === "sale" ? "For Sale" : "For Rent"}
          </Text>
        </View>
      </View>

      {isInjectedAd && (
        <View className="absolute top-3 right-3 bg-blue-500 dark:bg-blue-600 px-2 py-0.5 rounded-full shadow">
          <Text className="text-white text-xs font-bold">Promoted</Text>
        </View>
      )}

      {!isInjectedAd && renderStatusTag()}

      {onLike && (
        <TouchableOpacity
          className={`absolute p-2 rounded-full shadow ${
            isInjectedAd
              ? "top-10 right-3"
              : property.status === "offer-accepted" ||
                  property.status === "under-maintenance"
                ? "top-12 right-3"
                : "top-3 right-3"
          } ${isDark ? "bg-slate-700/80" : "bg-white/80"}`}
          onPress={handleLike}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={22}
            color={isLiked ? "#ef4444" : isDark ? "#cbd5e1" : "#374151"}
          />
        </TouchableOpacity>
      )}

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text
            className={`text-xl font-bold ${
              isDark ? "text-emerald-500" : "text-emerald-700"
            }`}
          >
            K{property.price?.toLocaleString() ?? "N/A"}
            {property.property_type === "rent" && (
              <Text
                className={`text-sm font-medium ${
                  isDark ? "text-slate-400" : "text-gray-600"
                }`}
              >
                /mo
              </Text>
            )}
          </Text>
        </View>

        <Text
          className={`text-lg font-semibold mb-1 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {property.title}
        </Text>

        <Text
          className={`text-sm mb-3 ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}
          numberOfLines={1}
        >
          {property.location}
        </Text>

        <View className="flex-row justify-between items-center">
          <Text
            className={`text-xs ${
              isDark ? "text-slate-500" : "text-gray-500"
            }`}
          >
            {getTimeAgo(property.created_at)}
          </Text>

          <View className="flex-row gap-3 space-x-3 items-center">
            {feature1Icon && feature1Value !== null && (
              <View className="flex-row gap-1 items-center space-x-1">
                <Ionicons
                  name={feature1Icon}
                  size={16}
                  color={isDark ? "#94a3b8" : "#4b5563"}
                />
                <Text
                  className={`text-sm ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  {feature1Value}
                </Text>
              </View>
            )}
            {feature2Icon && feature2Value !== null && (
              <View className="flex-row gap-1 items-center space-x-1">
                {feature2IconLibrary === "FontAwesome" ? (
                  <FontAwesome
                    name={feature2Icon as any}
                    size={14}
                    color={isDark ? "#94a3b8" : "#4b5563"}
                  />
                ) : (
                  <Ionicons
                    name={feature2Icon as any}
                    size={16}
                    color={isDark ? "#94a3b8" : "#4b5563"}
                  />
                )}
                <Text
                  className={`text-sm ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  {feature2Value}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
