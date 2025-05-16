import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  Dimensions,
  FlatList,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Property, useStore } from "@/store/useStore";
import { API_BASE_URL } from "@/constants/Config";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { useAuthStore } from "@/store/authStore";
import { styles, COLORS } from "@/styles/PropertyDetails.styles";
import { useRouter } from "expo-router";
import {
  DisplayableFeature,
  IconProps,
  featureCategories as defaultFeatureCategories,
} from "../../utils/propertyDetailsUtils";
import PropertyImageCarousel from "@/components/propertyDetails/PropertyImageCarousel";
import PropertyHeaderInfo from "@/components/propertyDetails/PropertyHeaderInfo";
import AnimatedDetailHeader from "@/components/propertyDetails/AnimatedDetailHeader";
import PropertyTabs from "@/components/propertyDetails/PropertyTabs";
import PropertyOverviewContent from "@/components/propertyDetails/PropertyOverviewContent";
import PropertyDetailsContent from "@/components/propertyDetails/PropertyDetailsContent";
import PropertyNearbyContent from "@/components/propertyDetails/PropertyNearbyContent";
import PropertyAgentCard from "@/components/propertyDetails/PropertyAgentCard";
import PropertyContactBar from "@/components/propertyDetails/PropertyContactBar";
import FullScreenImageModal from "@/components/propertyDetails/FullScreenImageModal";

const { width } = Dimensions.get("window");

const originalMockProperty = {
  id: "property-123",
  title: "Luxurious Riverside Villa",
  subtitle: "Executive Home in Exclusive Neighborhood",
  price: 2750000,
  priceUnit: "K",
  location: "30 Leopards Hill, Lusaka",
  coordinates: { latitude: -15.3875, longitude: 28.3228 },
  status: "premium" as keyof typeof COLORS.statusColor,
  listedDate: "3 weeks ago",
  description:
    "This magnificent property offers a perfect blend of luxury and comfort. Nestled in a serene environment with panoramic views of the surrounding landscape, this villa features high-end finishes, spacious living areas, and state-of-the-art amenities. The property includes a large swimming pool, landscaped gardens, and a private gym. The open floor plan creates a seamless flow between indoor and outdoor living spaces, making it ideal for entertaining guests.",
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
  ],
  category: "house",
  details: {
    bedrooms: 5,
    bathrooms: 4.5,
    size_sqm: 450,
    garages: 3,
    pool: true,
    garden: true,
    security_details: "24/7 Security",
    wifi_details: "High-speed Internet",
    ac_details: "Central AC",
    is_furnished: true,
    gym_details: "Private Gym",
    year_built: 2021,
  },
  nearbyPlaces: [
    { name: "International School", distance: "0.5 km", icon: "school" },
    { name: "Shopping Mall", distance: "1.2 km", icon: "shopping-bag" },
    { name: "Hospital", distance: "3.5 km", icon: "hospital-o" },
    { name: "Park", distance: "0.8 km", icon: "tree" },
  ],
  agent: {
    id: "agent-456",
    name: "Sarah Mwanza",
    photo:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 124,
    phone: "+260 97 1234567",
    email: "sarah.mwanza@kwenahomes.com",
  },
  liked: true,
  propertyType: "Villa",
  viewCount: 342,
};

function generateDisplayableFeatures(
  property: Property | null
): DisplayableFeature[] {
  if (!property) return [];
  const features: DisplayableFeature[] = [];
  const details = property.details || originalMockProperty.details;
  const pCategory = property.category?.toLowerCase();

  const addFeature = (
    name: string,
    icon: string,
    value: any,
    category: string,
    iconLib: IconProps["library"],
    condition: any = value
  ) => {
    if (
      condition !== null &&
      typeof condition !== "undefined" &&
      condition !== ""
    ) {
      features.push({
        name,
        icon,
        value: String(value),
        category,
        iconLibrary: iconLib,
      });
    }
  };
  const addFeatureFromBool = (
    name: string,
    icon: string,
    displayValue: string,
    category: string,
    iconLib: IconProps["library"],
    condition?: boolean
  ) => {
    if (condition === true) {
      features.push({
        name,
        icon,
        value: displayValue,
        category,
        iconLibrary: iconLib,
      });
    }
  };
  const addFeaturesFromArray = (
    key: string,
    icon: string,
    category: string,
    iconLib: IconProps["library"]
  ) => {
    if (details && details[key] && Array.isArray(details[key])) {
      details[key].forEach((item: string) => {
        addFeature(
          `${key}_${item.toLowerCase().replace(/\s/g, "")}`,
          icon,
          item,
          category,
          iconLib
        );
      });
    }
  };

  if (pCategory === "house") {
    addFeature(
      "bedrooms",
      "bed",
      details?.bedrooms ? `${details.bedrooms} Bedrooms` : null,
      "basic",
      "FontAwesome",
      details?.bedrooms
    );
    addFeature(
      "bathrooms",
      "bath",
      details?.bathrooms ? `${details.bathrooms} Bathrooms` : null,
      "basic",
      "FontAwesome",
      details?.bathrooms
    );
    addFeature(
      "garage",
      "car",
      details?.garages ? `${details.garages} Car Garage` : null,
      "outdoor",
      "FontAwesome",
      details?.garages
    );
    addFeature(
      "parking",
      "parking",
      details?.parkings ? `${details.parkings} Parking Spaces` : null,
      "outdoor",
      "FontAwesome",
      details?.parkings
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeatureFromBool(
      "pool",
      "pool",
      "Swimming Pool",
      "outdoor",
      "MaterialIcons",
      originalMockProperty.details.pool
    );
    addFeatureFromBool(
      "garden",
      "leaf",
      "Landscaped Garden",
      "outdoor",
      "FontAwesome",
      originalMockProperty.details.garden
    );
  } else if (pCategory === "land") {
    addFeature(
      "size",
      "texture-box",
      details?.size_sqm ? `${details.size_sqm} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.size_sqm
    );
    addFeature(
      "legalStatus",
      "file-document-outline",
      details?.legal_status,
      "details",
      "MaterialCommunityIcons"
    );
    addFeature(
      "intendedUse",
      "lightbulb-on-outline",
      details?.intended_use,
      "details",
      "MaterialCommunityIcons"
    );
    addFeatureFromBool(
      "roadAccess",
      "road-variant",
      "Road Access",
      "outdoor",
      "MaterialCommunityIcons",
      details?.road_access
    );
    addFeature(
      "waterSupply",
      "water",
      details?.water_supply ? `Water: ${details.water_supply}` : null,
      "amenities",
      "MaterialCommunityIcons",
      details?.water_supply
    );
    addFeatureFromBool(
      "electricity",
      "power-plug-outline",
      "Electricity Available",
      "amenities",
      "MaterialCommunityIcons",
      details?.electricity_available
    );
    addFeatureFromBool(
      "fenced",
      "fence",
      "Fenced",
      "outdoor",
      "MaterialCommunityIcons",
      details?.fenced
    );
  } else if (pCategory === "apartment") {
    addFeature(
      "bedrooms",
      "bed",
      details?.bedrooms ? `${details.bedrooms} Bedrooms` : null,
      "basic",
      "FontAwesome",
      details?.bedrooms
    );
    addFeature(
      "bathrooms",
      "bath",
      details?.bathrooms ? `${details.bathrooms} Bathrooms` : null,
      "basic",
      "FontAwesome",
      details?.bathrooms
    );
    addFeature(
      "size",
      "ruler-combined",
      details?.square_meters ? `${details.square_meters} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.square_meters
    );
    addFeature(
      "parking",
      "parking",
      details?.parking_spaces
        ? `${details.parking_spaces} Parking Spaces`
        : null,
      "outdoor",
      "FontAwesome",
      details?.parking_spaces
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
  } else if (pCategory === "commercial") {
    addFeature(
      "commercialType",
      "office-building",
      details?.property_type,
      "basic",
      "MaterialCommunityIcons",
      details?.property_type
    );
    addFeature(
      "size",
      "ruler-square",
      details?.square_meters ? `${details.square_meters} sq.m` : null,
      "basic",
      "MaterialCommunityIcons",
      details?.square_meters
    );
    addFeature(
      "parking",
      "parking",
      details?.parking_spaces
        ? `${details.parking_spaces} Parking Spaces`
        : null,
      "outdoor",
      "FontAwesome",
      details?.parking_spaces
    );
    addFeaturesFromArray(
      "amenities",
      "check-circle-outline",
      "amenities",
      "MaterialCommunityIcons"
    );
    addFeaturesFromArray(
      "security_features",
      "shield-check",
      "amenities",
      "MaterialCommunityIcons"
    );
  }

  if (
    originalMockProperty.details.year_built &&
    !features.some((f) => f.name === "year")
  ) {
    addFeature(
      "year",
      "calendar",
      `Built ${originalMockProperty.details.year_built}`,
      "details",
      "FontAwesome"
    );
  }
  return features;
}

const getKeyFeaturesForDisplay = (
  allGeneratedFeatures: DisplayableFeature[],
  pCategory: string | undefined
): DisplayableFeature[] => {
  let keys: DisplayableFeature[] = [];
  const categoryLower = pCategory?.toLowerCase();

  if (categoryLower === "house" || categoryLower === "apartment") {
    keys = ["bedrooms", "bathrooms", "size", "parking", "garage"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  } else if (categoryLower === "land") {
    keys = ["size", "roadAccess", "legalStatus"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  } else if (categoryLower === "commercial") {
    keys = ["commercialType", "size", "parking"]
      .map((name) => allGeneratedFeatures.find((f) => f.name === name))
      .filter(Boolean) as DisplayableFeature[];
  }

  if (keys.length < 3) {
    const basicFeatures = allGeneratedFeatures.filter(
      (f) => f.category === "basic"
    );
    keys = [
      ...keys,
      ...basicFeatures.filter((bf) => !keys.some((k) => k.name === bf.name)),
    ];
  }
  if (keys.length < 3) {
    keys = [
      ...keys,
      ...allGeneratedFeatures.filter(
        (af) => !keys.some((k) => k.name === af.name)
      ),
    ];
  }
  return keys.slice(0, 3);
};

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { toggleSavedProperty, savedProperties } = useStore();
  const { user } = useAuthStore();

  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "nearby">(
    "overview"
  );
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [currentFullScreenIndex, setCurrentFullScreenIndex] = useState(0);

  const carouselFlatListRef = useRef<FlatList<string>>(null);
  const fullScreenFlatListRef = useRef<FlatList<string>>(null);
  const scrollY = useSharedValue(0);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderBottomWidth: opacity > 0.7 ? 1 : 0,
      borderBottomColor: COLORS.lightGray,
    };
  });

  const isLiked = propertyData
    ? savedProperties.includes(propertyData.id)
    : false;

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Property not found.");
          throw new Error(
            `Failed to fetch property (status: ${response.status})`
          );
        }
        const data: Property = await response.json();
        setPropertyData(data);
      } catch (err: any) {
        setError(err.message || "Could not load property details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const imagesFromProperty =
    propertyData?.images && propertyData.images.length > 0
      ? propertyData.images
      : originalMockProperty.images;

  useEffect(() => {
    if (
      isFullScreen &&
      fullScreenFlatListRef.current &&
      imagesFromProperty.length > 0 &&
      currentFullScreenIndex >= 0 &&
      currentFullScreenIndex < imagesFromProperty.length
    ) {
      setTimeout(() => {
        fullScreenFlatListRef.current?.scrollToIndex({
          index: currentFullScreenIndex,
          animated: false,
        });
      }, 100);
    }
  }, [isFullScreen, currentFullScreenIndex, imagesFromProperty]);

  const handleLikePress = () => {
    if (!user) {
      navigation.navigate("auth/signin" as never);
      return;
    }
    if (propertyData) {
      toggleSavedProperty(propertyData.id);
    }
  };

  const handleCallAgent = () => {
    if (originalMockProperty.agent?.phone) {
      Linking.openURL(`tel:${originalMockProperty.agent.phone}`);
    }
  };

  const handleViewOnMap = () => {
    if (propertyData?.coordinates) {
      router.push({
        pathname: "/explore",
        params: {
          propertyId: propertyData.id,
          latitude: propertyData.coordinates.latitude.toString(),
          longitude: propertyData.coordinates.longitude.toString(),
        },
      });
    }
  };

  const handleWhatsAppAgent = () => {
    if (originalMockProperty.agent?.phone) {
      const phoneNumber = originalMockProperty.agent.phone.replace(/\D/g, "");
      const titleToUse = propertyData?.title || originalMockProperty.title;
      Linking.openURL(
        `https://wa.me/${phoneNumber}?text=Hello, I'm interested in the ${encodeURIComponent(
          titleToUse
        )} property listed on Kwena Properties.`
      );
    }
  };

  const handleCarouselScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== carouselActiveIndex) {
      setCarouselActiveIndex(newIndex);
    }
  };

  const handleMainScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const handleDotPress = ({ index }: { index: number }) => {
    setCarouselActiveIndex(index);
    carouselFlatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const toggleFullScreen = ({
    imageUri,
    index,
  }: {
    imageUri: string | null;
    index: number;
  }) => {
    if (imageUri) {
      setCurrentFullScreenIndex(index);
      setIsFullScreen(true);
    }
  };

  const exitFullScreen = () => setIsFullScreen(false);

  const handleFullScreenScroll = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentFullScreenIndex) {
      setCurrentFullScreenIndex(newIndex);
    }
  };

  const handleShare = () => {
    console.log("Share pressed");
  };

  const handleViewAgentProfile = () => {
    console.log("View agent profile");
  };

  const handleMessageAgent = () => {
    console.log("Message agent");
  };

  const statusTextMap: { [key: string]: string } = {
    available: "Available",
    occupied: "Occupied",
    rented: "Rented",
    "off-market": "Off Market",
    "under-maintenance": "Maintenance",
    "pending-approval": "Pending",
    premium: "Premium",
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return originalMockProperty.listedDate;
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Property...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.red} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!propertyData) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="home-outline" size={60} color={COLORS.mediumGray} />
        <Text style={styles.errorText}>Property data could not be loaded.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = propertyData.title || originalMockProperty.title;
  const subtitle = originalMockProperty.subtitle;
  const price = propertyData.price ?? originalMockProperty.price;
  const location = propertyData.location || originalMockProperty.location;
  const description =
    propertyData.description || originalMockProperty.description;
  const propertyStatus = propertyData.status || originalMockProperty.status;
  const statusColor =
    COLORS.statusColor[propertyStatus as keyof typeof COLORS.statusColor] ||
    COLORS.mediumGray;
  const statusText = statusTextMap[propertyStatus] || "Status Unknown";
  const listedDate = getFormattedDate(propertyData.created_at);

  const displayableFeatures = generateDisplayableFeatures(propertyData);
  const keyFeaturesToDisplay = getKeyFeaturesForDisplay(
    displayableFeatures,
    propertyData.category
  );
  const groupedFeatures = displayableFeatures.reduce<
    Record<string, DisplayableFeature[]>
  >((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {});
  const visibleFeatures = showAllFeatures
    ? displayableFeatures
    : displayableFeatures.slice(0, 6);

  console.log("Active Tab:", activeTab);
  if (activeTab === "details") {
    console.log("Displayable Features for Details:", displayableFeatures);
    console.log("Grouped Features for Details:", groupedFeatures);
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <AnimatedDetailHeader
        title={title}
        isLiked={isLiked}
        animatedStyle={headerAnimatedStyle}
        onBackPress={() => navigation.goBack()}
        onLikePress={handleLikePress}
        onSharePress={handleShare}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
      >
        <PropertyImageCarousel
          images={imagesFromProperty}
          isLiked={isLiked}
          statusText={statusText}
          statusColor={statusColor}
          listedDate={listedDate}
          activeIndex={carouselActiveIndex}
          flatListRef={carouselFlatListRef}
          onImagePress={toggleFullScreen}
          onLikePress={handleLikePress}
          onSharePress={handleShare}
          onBackPress={() => navigation.goBack()}
          onScroll={handleCarouselScroll}
          onDotPress={handleDotPress}
        />

        <View style={styles.contentWrapper}>
          <PropertyHeaderInfo
            price={price}
            priceUnit={originalMockProperty.priceUnit}
            propertyTypeDisplay={originalMockProperty.propertyType}
            title={title}
            subtitle={subtitle}
            location={location}
            onViewOnMap={handleViewOnMap}
            viewCount={originalMockProperty.viewCount}
          />
          <PropertyTabs activeTab={activeTab} onTabPress={setActiveTab} />

          {activeTab === "overview" && (
            <PropertyOverviewContent
              keyFeaturesToDisplay={keyFeaturesToDisplay}
            />
          )}
          {activeTab === "details" && (
            <PropertyDetailsContent
              description={description}
              displayableFeatures={displayableFeatures}
              visibleFeatures={visibleFeatures}
              showAllFeatures={showAllFeatures}
              onShowAllFeaturesToggle={() =>
                setShowAllFeatures(!showAllFeatures)
              }
              featureCategories={defaultFeatureCategories}
              groupedFeatures={groupedFeatures}
            />
          )}
          {activeTab === "nearby" && (
            <PropertyNearbyContent
              nearbyPlaces={originalMockProperty.nearbyPlaces}
              onViewAllOnMap={handleViewOnMap}
            />
          )}
          <PropertyAgentCard
            agent={originalMockProperty.agent}
            onViewProfile={handleViewAgentProfile}
          />
        </View>
      </ScrollView>

      <PropertyContactBar
        agentPhone={originalMockProperty.agent.phone}
        onMessageAgent={handleMessageAgent}
        onCallAgent={handleCallAgent}
        onWhatsAppAgent={handleWhatsAppAgent}
      />

      <FullScreenImageModal
        visible={isFullScreen}
        images={imagesFromProperty}
        initialIndex={currentFullScreenIndex}
        currentFullScreenIndex={currentFullScreenIndex}
        flatListRef={fullScreenFlatListRef}
        onClose={exitFullScreen}
        onMomentumScrollEnd={handleFullScreenScroll}
      />
    </GestureHandlerRootView>
  );
}
