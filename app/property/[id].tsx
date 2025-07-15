import React, { useEffect, useState, useRef, useMemo } from "react";
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
  Share,
  Alert,
  useColorScheme,
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
import {
  useAppColors,
  createStyles as createPropertyDetailsStyles,
  LIGHT_COLORS,
} from "@/styles/PropertyDetails.styles";
import { useRouter } from "expo-router";
import {
  DisplayableFeature,
  generateDisplayableFeatures,
  getKeyFeaturesForDisplay,
  featureCategories,
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

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { toggleSavedProperty, savedProperties, getPropertyById } = useStore();
  const { user } = useAuthStore();

  const COLORS = useAppColors();
  const propertyDetailsStyles = React.useMemo(
    () => createPropertyDetailsStyles(COLORS),
    [COLORS],
  );
  const colorScheme = useColorScheme();

  const [propertyData, setPropertyData] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "nearby">(
    "overview",
  );
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [currentFullScreenIndex, setCurrentFullScreenIndex] = useState(0);

  const carouselFlatListRef = useRef<FlatList<string>>(null);
  const fullScreenFlatListRef = useRef<FlatList<string>>(null);
  const scrollY = useSharedValue(0);

  const nearbyPlacesData = useMemo(() => {
    if (!propertyData?.nearby_places) {
      return [];
    }
    const places = propertyData.nearby_places;
    if (Array.isArray(places)) {
      return places;
    }
    if (typeof places === "string") {
      try {
        const parsedPlaces = JSON.parse(places);
        return Array.isArray(parsedPlaces) ? parsedPlaces : [];
      } catch (e) {
        console.error("Failed to parse nearby_places JSON string:", e);
        return [];
      }
    }
    return [];
  }, [propertyData?.nearby_places]);

  const headerContainerAnimatedStyle = useAnimatedStyle(() => {
    const interpolatedScrollOpacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0, 0.5, 1],
      Extrapolate.CLAMP,
    );
    const newZIndex = interpolatedScrollOpacity < 0.05 ? -1 : 100;
    const baseBackgroundColor =
      colorScheme === "dark" ? "24,24,24" : "255,255,255";
    return {
      backgroundColor: `rgba(${baseBackgroundColor}, ${interpolatedScrollOpacity})`,
      borderBottomWidth: interpolatedScrollOpacity > 0.7 ? 1 : 0,
      borderBottomColor: COLORS.borderColor,
      contentOpacity: interpolatedScrollOpacity,
      zIndex: newZIndex,
    };
  });

  const isLiked = propertyData
    ? savedProperties.includes(propertyData.id)
    : false;

  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (!id) {
        setError("Property ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const storeProperty = getPropertyById(id);
      if (storeProperty) {
        setPropertyData(storeProperty);
        setLoading(false);
      } else {
        try {
          const response = await fetch(`${API_BASE_URL}/properties/${id}`);
          if (!response.ok) {
            if (response.status === 404)
              throw new Error("Property not found.");
            throw new Error(
              `Failed to fetch property (status: ${response.status})`,
            );
          }
          const data: Property = await response.json();
          setPropertyData(data);
        } catch (err: any) {
          setError(err.message || "Could not load property details.");
        } finally {
          setLoading(false);
        }
      }
    };
    loadPropertyDetails();
  }, [id, getPropertyById]);

  const imagesFromProperty =
    propertyData?.images && propertyData.images.length > 0
      ? propertyData.images
      : ["https://via.placeholder.com/400x300?text=No+Image+Available"];

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

  const phoneNumberForCall =
    propertyData?.use_phone_for_call && propertyData.contact_phone_number
      ? propertyData.contact_phone_number
      : null;
  const numberForWhatsApp =
    propertyData?.use_whatsapp_for_message &&
    propertyData.contact_whatsapp_number
      ? propertyData.contact_whatsapp_number
      : null;

  const handleCallAgent = () => {
    if (phoneNumberForCall) {
      Linking.openURL(`tel:${phoneNumberForCall}`);
    } else {
      Alert.alert(
        "Not Available",
        "Calling is not configured for this property.",
      );
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
  if (numberForWhatsApp) {
    let cleanedNumber = numberForWhatsApp.replace(/\D/g, "");

    if (!cleanedNumber.startsWith("260")) {
      cleanedNumber = `260${cleanedNumber}`;
    }

    const titleToUse = propertyData?.title || "this property";
    const url = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(
      `Hello, I'm interested in ${titleToUse} listed on Kwena Properties.`,
    )}`;

    Linking.openURL(url);
  } else {
    Alert.alert(
      "Not Available",
      "WhatsApp messaging is not configured for this property.",
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

  const handleShare = async () => {
    if (!propertyData) {
      return;
    }
    const propertyUrl = `https://www.kwenaproperties.com/property/${propertyData.id}`;
    const message = `Check out this property: ${propertyData.title}\n\nLocation: ${propertyData.location}\nPrice: K${propertyData.price.toLocaleString()}\n\nView more details here: ${propertyUrl}`;
    try {
      await Share.share(
        {
          message: message,
          url: propertyUrl,
          title: `Check out: ${propertyData.title}`,
        },
        {
          dialogTitle: `Share ${propertyData.title}`,
        },
      );
    } catch (error: any) {
      console.error("Error sharing property:", error.message);
    }
  };

  const handleViewAgentProfile = () => {};

  const statusTextMap: { [key: string]: string } = {
    available: "Available",
    occupied: "Occupied",
    rented: "Rented",
    "off-market": "Off Market",
    "under-maintenance": "Maintenance",
    "pending-approval": "Pending",
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return "Recently listed";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Recently listed";
    }
  };

  if (loading) {
    return (
      <View style={propertyDetailsStyles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={propertyDetailsStyles.loadingText}>
          Loading Property...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={propertyDetailsStyles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.red} />
        <Text style={propertyDetailsStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={propertyDetailsStyles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={propertyDetailsStyles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!propertyData) {
    return (
      <View style={propertyDetailsStyles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="home-outline" size={60} color={COLORS.mediumGray} />
        <Text style={propertyDetailsStyles.errorText}>
          Property data could not be loaded.
        </Text>
        <TouchableOpacity
          style={propertyDetailsStyles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={propertyDetailsStyles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = propertyData.title;
  const price = propertyData.price;
  const location = propertyData.location;
  const description = propertyData.description || "No description available";

  let statusTagText: string | null = null;
  let statusTagColor: string = COLORS.mediumGray;

  if (propertyData.is_promoted === true) {
    statusTagText = "Premium";
    statusTagColor = COLORS.statusColor?.premium || COLORS.primary;
  } else if (propertyData.status && statusTextMap[propertyData.status]) {
    statusTagText = statusTextMap[propertyData.status];
    statusTagColor =
      COLORS.statusColor?.[
        propertyData.status as keyof typeof LIGHT_COLORS.statusColor
      ] || COLORS.mediumGray;
  }

  const listedDate = getFormattedDate(propertyData.created_at);

  const getDisplayCategory = (category?: string) => {
    if (!category) return "Property";
    const categoryMap: Record<string, string> = {
      house: "House",
      apartment: "Apartment",
      land: "Land",
      commercial: "Commercial Property",
      farm: "Farm",
      industrial: "Industrial",
      lodge: "Lodge",
    };
    return (
      categoryMap[category.toLowerCase()] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  const propertyTypeForDisplay = getDisplayCategory(propertyData.category);
  const priceUnit = propertyData.property_type === "rent" ? "/month" : "";

  const displayableFeatures = generateDisplayableFeatures(propertyData);
  const keyFeaturesToDisplay = getKeyFeaturesForDisplay(
    displayableFeatures,
    propertyData.category,
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

  const getUserAgent = () => {
    if (!propertyData?.userProfile) {
      return {
        id: "agent-default",
        name: "Property Agent",
        photo:
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
        phone: phoneNumberForCall || "+260 97 1234567",
      };
    }

    const profile = propertyData.userProfile;
    return {
      id: profile.id,
      name: profile.full_name || "Property Owner",
      photo:
        profile.avatar_url ||
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
      phone: phoneNumberForCall || profile.phone || "+260 97 1234567",
    };
  };

  const actualAgent = getUserAgent();

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <AnimatedDetailHeader
        title={title}
        isLiked={isLiked}
        animatedProperties={headerContainerAnimatedStyle}
        onBackPress={() => navigation.goBack()}
        onLikePress={handleLikePress}
        onSharePress={handleShare}
      />

      <ScrollView
        style={propertyDetailsStyles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
      >
        <PropertyImageCarousel
          images={imagesFromProperty}
          isLiked={isLiked}
          statusText={statusTagText || ""}
          statusColor={statusTagColor}
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

        <View style={propertyDetailsStyles.contentWrapper}>
          <PropertyHeaderInfo
            price={price}
            priceUnit={priceUnit}
            propertyTypeDisplay={propertyTypeForDisplay}
            title={title}
            location={location}
            onViewOnMap={handleViewOnMap}
          />

          <PropertyTabs activeTab={activeTab} onTabPress={setActiveTab} />

          <View style={{ display: activeTab === "overview" ? "flex" : "none" }}>
            <PropertyOverviewContent
              keyFeaturesToDisplay={keyFeaturesToDisplay}
            />
          </View>

          <View style={{ display: activeTab === "details" ? "flex" : "none" }}>
            <PropertyDetailsContent
              description={description}
              displayableFeatures={displayableFeatures}
              visibleFeatures={visibleFeatures}
              showAllFeatures={showAllFeatures}
              onShowAllFeaturesToggle={() =>
                setShowAllFeatures(!showAllFeatures)
              }
              featureCategories={Object.values(featureCategories).map(
                (name) => ({
                  id: name.toLowerCase().replace(" ", "_"),
                  name,
                }),
              )}
              groupedFeatures={groupedFeatures}
            />
          </View>

          <View style={{ display: activeTab === "nearby" ? "flex" : "none" }}>
            <PropertyNearbyContent
              nearbyPlaces={nearbyPlacesData}
              onViewAllOnMap={handleViewOnMap}
            />
          </View>

          <PropertyAgentCard
            agent={actualAgent}
            onViewProfile={handleViewAgentProfile}
          />
        </View>
      </ScrollView>

      <PropertyContactBar
        agentPhone={phoneNumberForCall}
        agentWhatsApp={numberForWhatsApp}
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