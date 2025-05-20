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
  Share,
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
import {
  originalMockProperty,
  generateDisplayableFeatures,
  getKeyFeaturesForDisplay,
} from "@/components/propertyDetails/MockPropertyData";

const { width } = Dimensions.get("window");

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { toggleSavedProperty, savedProperties, getPropertyById } = useStore();
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

  const headerContainerAnimatedStyle = useAnimatedStyle(() => {
    const interpolatedScrollOpacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    const newZIndex = interpolatedScrollOpacity < 0.05 ? -1 : 100;

    return {
      backgroundColor: `rgba(255, 255, 255, ${interpolatedScrollOpacity})`,
      borderBottomWidth: interpolatedScrollOpacity > 0.7 ? 1 : 0,
      borderBottomColor: COLORS.lightGray,
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
      }
    };

    loadPropertyDetails();
  }, [id, getPropertyById]);

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

  const handleShare = async () => {
    if (!propertyData) {
      return;
    }

    const propertyUrl = `https://www.kwenaproperties.com/property/${propertyData.id}`;
    const titleToShare = propertyData.title || originalMockProperty.title;
    const message = `Check out this property: ${titleToShare}\n\nLocation: ${
      propertyData.location || originalMockProperty.location
    }\nPrice: K${(
      propertyData.price ?? originalMockProperty.price
    ).toLocaleString()}\n\nView more details here: ${propertyUrl}`;

    try {
      const result = await Share.share(
        {
          message: message,
          url: propertyUrl,
          title: `Check out: ${titleToShare}`,
        },
        {
          dialogTitle: `Share ${titleToShare}`,
        }
      );

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error: any) {
      console.error("Error sharing property:", error.message);
    }
  };

  const handleViewAgentProfile = () => {};

  const handleMessageAgent = () => {};

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
  let statusTagText: string | null = null;
  let statusTagColor: string = COLORS.mediumGray;

  if (propertyData.is_promoted === true) {
    statusTagText = "Premium";
    statusTagColor = COLORS.statusColor.premium;
  } else if (propertyData.status && statusTextMap[propertyData.status]) {
    statusTagText = statusTextMap[propertyData.status];
    statusTagColor =
      COLORS.statusColor[
        propertyData.status as keyof typeof COLORS.statusColor
      ] || COLORS.mediumGray;
  } else if (propertyData.status) {
    statusTagText =
      propertyData.status.charAt(0).toUpperCase() +
      propertyData.status.slice(1);
    statusTagColor = COLORS.mediumGray;
  }
  const listedDate = getFormattedDate(propertyData.created_at);

  const getDisplayCategory = (category?: string) => {
    if (!category) return originalMockProperty.propertyType;
    switch (category.toLowerCase()) {
      case "house":
        return "House";
      case "apartment":
        return "Apartment";
      case "land":
        return "Land";
      case "commercial":
        return "Commercial";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };
  const propertyTypeForDisplay = getDisplayCategory(propertyData.category);

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
        animatedProperties={headerContainerAnimatedStyle}
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

        <View style={styles.contentWrapper}>
          <PropertyHeaderInfo
            price={price}
            priceUnit={originalMockProperty.priceUnit}
            propertyTypeDisplay={propertyTypeForDisplay}
            title={title}
            subtitle={subtitle}
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
              featureCategories={defaultFeatureCategories}
              groupedFeatures={groupedFeatures}
            />
          </View>
          <View style={{ display: activeTab === "nearby" ? "flex" : "none" }}>
            <PropertyNearbyContent
              nearbyPlaces={originalMockProperty.nearbyPlaces}
              onViewAllOnMap={handleViewOnMap}
            />
          </View>

          <PropertyAgentCard
            agent={originalMockProperty.agent}
            onViewProfile={handleViewAgentProfile}
          />
        </View>
      </ScrollView>

      <PropertyContactBar
        agentPhone={originalMockProperty.agent.phone}
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
