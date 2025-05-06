import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Pressable,
} from "react-native";
import { useLocalSearchParams, Stack, useNavigation } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// Theme colors
const COLORS = {
  primary: "#2A63E2",
  secondary: "#8AA3F9",
  accent: "#F9B16E",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#1A2138",
  textSecondary: "#5B6987",
  lightGray: "#E8ECF4",
  mediumGray: "#A9B4CC",
  darkGray: "#667085",
  green: "#27AE60",
  red: "#FF5252",
  yellow: "#FFBB0E",
  shadow: "rgba(42, 99, 226, 0.08)",
  backdrop: "rgba(26, 33, 56, 0.7)",
  statusColor: {
    forSale: "#27AE60",
    forRent: "#2A63E2",
    sold: "#FF5252",
    premium: "#FFBB0E",
  }
};

// Mock data for our beautiful UI
const dummyProperty = {
  id: "property-123",
  title: "Luxurious Riverside Villa",
  subtitle: "Executive Home in Exclusive Neighborhood",
  price: 2750000,
  priceUnit: "K",
  location: "30 Leopards Hill, Lusaka",
  coordinates: {
    latitude: -15.3875,
    longitude: 28.3228
  },
  status: "premium" as keyof typeof COLORS.statusColor,
  listedDate: "3 weeks ago",
  description: "This magnificent property offers a perfect blend of luxury and comfort. Nestled in a serene environment with panoramic views of the surrounding landscape, this villa features high-end finishes, spacious living areas, and state-of-the-art amenities. The property includes a large swimming pool, landscaped gardens, and a private gym. The open floor plan creates a seamless flow between indoor and outdoor living spaces, making it ideal for entertaining guests.",
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?q=80&w=2070&auto=format&fit=crop"
  ],
  features: [
    { name: "bedrooms", icon: "bed", value: "5 Bedrooms", category: "basic", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "bathrooms", icon: "bath", value: "4.5 Bathrooms", category: "basic", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "size", icon: "ruler", value: "450 sq.m", category: "basic", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "garage", icon: "car", value: "3 Car Garage", category: "outdoor", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "pool", icon: "swimming-pool", value: "Pool", category: "outdoor", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "garden", icon: "leaf", value: "Garden", category: "outdoor", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "security", icon: "shield-check", value: "24/7 Security", category: "amenities", iconLibrary: "MaterialCommunityIcons" as 'MaterialCommunityIcons' },
    { name: "wifi", icon: "wifi", value: "High-speed Internet", category: "amenities", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "ac", icon: "snowflake-o", value: "Central AC", category: "amenities", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "furnished", icon: "chair", value: "Fully Furnished", category: "interior", iconLibrary: "MaterialCommunityIcons" as 'MaterialCommunityIcons' },
    { name: "gym", icon: "dumbbell", value: "Private Gym", category: "amenities", iconLibrary: "FontAwesome" as 'FontAwesome' },
    { name: "year", icon: "calendar", value: "Built 2021", category: "details", iconLibrary: "FontAwesome" as 'FontAwesome' }
  ],
  nearbyPlaces: [
    { name: "International School", distance: "0.5 km", icon: "school" },
    { name: "Shopping Mall", distance: "1.2 km", icon: "shopping-bag" },
    { name: "Hospital", distance: "3.5 km", icon: "hospital-o" },
    { name: "Park", distance: "0.8 km", icon: "tree" }
  ],
  agent: {
    id: "agent-456",
    name: "Sarah Mwanza",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
    rating: 4.9,
    reviewCount: 124,
    phone: "+260 97 1234567",
    email: "sarah.mwanza@kwenahomes.com",
    experience: "8 years",
    specialty: "Luxury Properties"
  },
  liked: true,
  propertyType: "Villa",
  viewCount: 342
};

// Feature categories for organization
const featureCategories = [
  { id: "basic", name: "Basic Information" },
  { id: "interior", name: "Interior Features" },
  { id: "outdoor", name: "Outdoor Features" },
  { id: "amenities", name: "Amenities" },
  { id: "details", name: "Additional Details" }
];

// Helper function to get icon component based on library
interface IconProps {
  library: 'MaterialCommunityIcons' | 'MaterialIcons' | 'Ionicons' | 'FontAwesome';
  name: string;
  size: number;
  color: string;
}

const getIconComponent = ({ library, name, size, color }: IconProps) => {
  switch (library) {
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'Ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'FontAwesome':
    default:
      return <FontAwesome name={name as any} size={size} color={color} />;
  }
};

export default function PropertyDetails() {
  // Keep track of image carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  
  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  
  // Simulating the property from params
  const property = dummyProperty;
  
  const handleCallAgent = () => {
    if (property?.agent?.phone) {
      Linking.openURL(`tel:${property.agent.phone}`);
    }
  };

  const handleWhatsAppAgent = () => {
    if (property?.agent?.phone) {
      const phoneNumber = property.agent.phone.replace(/\D/g, "");
      Linking.openURL(`https://wa.me/${phoneNumber}?text=Hello, I'm interested in the ${encodeURIComponent(property.title)} property listed on Kwena Homes.`);
    }
  };

  interface ScrollEvent {
    nativeEvent: {
      contentOffset: {
        x: number;
        y: number;
      };
    };
  }

  const handleScroll = (event: ScrollEvent) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
    
    // For header transparency
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
  };

  interface HandleDotPressParams {
    index: number;
  }

  const handleDotPress = ({ index }: HandleDotPressParams) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onPinchGestureEvent = ({ nativeEvent }: { nativeEvent: { scale: number } }) => {
    scale.value = savedScale.value * nativeEvent.scale;
  };

  const onPinchHandlerStateChange = ({ nativeEvent }: { nativeEvent: { oldState: number } }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      savedScale.value = scale.value;
    }
  };

  interface ToggleFullScreenParams {
    imageUri: string | null;
  }

  const toggleFullScreen = ({ imageUri }: ToggleFullScreenParams) => {
    if (imageUri) {
      setSelectedImage(imageUri);
      setIsFullScreen(true);
      scale.value = 1;
      savedScale.value = 1;
    } else {
      setIsFullScreen(false);
      setSelectedImage(null);
    }
  };

  const exitFullScreen = () => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    setIsFullScreen(false);
    setSelectedImage(null);
  };

  // Animation styles
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
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
  
  const statusText = {
    forSale: "For Sale",
    forRent: "For Rent",
    sold: "Sold",
    premium: "Premium"
  };

  // Group features by category
  const groupedFeatures = property.features.reduce<Record<string, typeof property.features>>((acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    }, {});

  // Get visible features (limit to 6 unless showAllFeatures is true)
  const visibleFeatures = showAllFeatures 
    ? property.features
    : property.features.slice(0, 6);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      {/* Custom animated header */}
      <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
        <Pressable style={styles.headerButton} onPress={() => useNavigation().goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton}>
            <Ionicons name={property.liked ? "heart" : "heart-outline"} size={24} color={property.liked ? COLORS.red : COLORS.text} />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
          </Pressable>
        </View>
      </Animated.View>
      
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Image Carousel with Status Tag and Actions */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const contentOffsetX = e.nativeEvent.contentOffset.x;
              const newIndex = Math.round(contentOffsetX / width);
              if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
              }
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggleFullScreen(item)}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                
                {/* Overlay gradient for readability */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.imageGradient}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          
          {/* Back button for images */}
          <Pressable 
            style={[styles.floatingButton, styles.backButton]} 
            onPress={() => useNavigation().goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </Pressable>
          
          {/* Action buttons (like, share) */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton}>
              <Ionicons 
                name={property.liked ? "heart" : "heart-outline"} 
                size={24} 
                color={property.liked ? COLORS.red : COLORS.white} 
              />
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color={COLORS.white} />
            </Pressable>
          </View>
          
          {/* Status tag */}
          <View 
            style={[
              styles.statusTag, 
              { backgroundColor: COLORS.statusColor[property.status as keyof typeof COLORS.statusColor] }
            ]}
          >
            <Text style={styles.statusText}>{statusText[property.status]}</Text>
          </View>
          
          {/* Listed date */}
          <View style={styles.listedDateTag}>
            <Ionicons name="time-outline" size={14} color={COLORS.white} />
            <Text style={styles.listedDateText}>{property.listedDate}</Text>
          </View>
          
          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>
          
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {property.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeIndex ? styles.paginationDotActive : {},
                ]}
                onPress={() => handleDotPress({ index })}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.contentWrapper}>
          {/* Property header info */}
          <View style={styles.propertyHeader}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {property.priceUnit}{property.price.toLocaleString()}
              </Text>
              <View style={styles.propertyTypeTag}>
                <Text style={styles.propertyTypeText}>{property.propertyType}</Text>
              </View>
            </View>
            
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.subtitle}>{property.subtitle}</Text>
            
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.location}>{property.location}</Text>
              <TouchableOpacity style={styles.mapButton}>
                <Text style={styles.mapButtonText}>View on Map</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.viewCountRow}>
              <Ionicons name="eye-outline" size={16} color={COLORS.darkGray} />
              <Text style={styles.viewCountText}>{property.viewCount} views</Text>
            </View>
            
            {/* Tab navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === "overview" && styles.activeTab]} 
                onPress={() => setActiveTab("overview")}
              >
                <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === "details" && styles.activeTab]} 
                onPress={() => setActiveTab("details")}
              >
                <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === "nearby" && styles.activeTab]} 
                onPress={() => setActiveTab("nearby")}
              >
                <Text style={[styles.tabText, activeTab === "nearby" && styles.activeTabText]}>
                  Nearby
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Main content based on active tab */}
          {activeTab === "overview" && (
            <View style={styles.overviewContainer}>
              {/* Key Features Cards - Top 3 */}
              <View style={styles.keyFeaturesContainer}>
                {property.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.keyFeatureCard}>
                    {getIconComponent({
                      library: feature.iconLibrary, 
                      name: feature.icon, 
                      size: 24, 
                      color: COLORS.primary
                    })}
                    <Text style={styles.keyFeatureValue}>{feature.value}</Text>
                  </View>
                ))}
              </View>
              
              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{property.description}</Text>
              </View>
              
              {/* All Features */}
              <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Property Features</Text>
                <View style={styles.featuresGrid}>
                  {visibleFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      {getIconComponent({
                        library: feature.iconLibrary, 
                        name: feature.icon, 
                        size: 18, 
                        color: COLORS.primary
                      })}
                      <Text style={styles.featureText}>{feature.value}</Text>
                    </View>
                  ))}
                </View>
                
                {property.features.length > 6 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setShowAllFeatures(!showAllFeatures)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllFeatures ? "Show Less" : "Show All Features"}
                    </Text>
                    <Ionicons 
                      name={showAllFeatures ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          
          {activeTab === "details" && (
            <View style={styles.detailsContainer}>
              {featureCategories.map(category => {
                const features = groupedFeatures[category.id];
                if (!features || features.length === 0) return null;
                
                return (
                  <View key={category.id} style={styles.featureCategory}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    <View style={styles.categoryFeaturesGrid}>
                      {features.map((feature, index) => (
                        <View key={index} style={styles.detailFeatureItem}>
                          {getIconComponent({
                            library: feature.iconLibrary, 
                            name: feature.icon, 
                            size: 18, 
                            color: COLORS.primary
                          })}
                          <Text style={styles.featureText}>{feature.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          
          {activeTab === "nearby" && (
            <View style={styles.nearbyContainer}>
              <Text style={styles.sectionTitle}>Nearby Places</Text>
              
              {property.nearbyPlaces.map((place, index) => (
                <View key={index} style={styles.nearbyPlaceItem}>
                  <View style={styles.nearbyIconContainer}>
                    <FontAwesome name={place.icon as keyof typeof FontAwesome.glyphMap} size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.nearbyPlaceInfo}>
                    <Text style={styles.nearbyPlaceName}>{place.name}</Text>
                    <Text style={styles.nearbyPlaceDistance}>{place.distance}</Text>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity style={styles.viewMapButton}>
                <Ionicons name="map-outline" size={20} color={COLORS.white} />
                <Text style={styles.viewMapButtonText}>View All on Map</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Agent information */}
          <View style={styles.agentCard}>
            <View style={styles.agentHeader}>
              <Text style={styles.sectionTitle}>Listed by</Text>
              <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.agentInfo}>
              <Image source={{ uri: property.agent.photo }} style={styles.agentPhoto} />
              <View style={styles.agentDetails}>
                <Text style={styles.agentName}>{property.agent.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.yellow} />
                  <Text style={styles.ratingText}>
                    {property.agent.rating} ({property.agent.reviewCount} reviews)
                  </Text>
                </View>
                <Text style={styles.agentSpecialty}>{property.agent.specialty}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Contact Agent fixed bottom bar */}
      <View style={styles.contactBar}>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <Text style={styles.contactButtonText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.contactButton, styles.callButton]}
          onPress={handleCallAgent}
        >
          <Ionicons name="call-outline" size={20} color={COLORS.white} />
          <Text style={styles.callButtonText}>Call Agent</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.contactButton, styles.whatsappButton]}
          onPress={handleWhatsAppAgent}
        >
          <Ionicons name="logo-whatsapp" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
      {/* Full screen image modal with pinch-to-zoom */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={exitFullScreen}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={exitFullScreen}>
            <Ionicons name="close-circle" size={36} color={COLORS.white} />
          </TouchableOpacity>

          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <Animated.View style={styles.pinchContainer}>
              <Animated.Image
                source={{ uri: selectedImage || "" }}
                style={[styles.fullScreenImage, animatedImageStyle]}
                resizeMode="contain"
              />
            </Animated.View>
          </PinchGestureHandler>

          {/* Image counter in full screen mode */}
          <View style={styles.fullScreenImageCounter}>
            <Text style={styles.imageCounterText}>
              {activeIndex + 1}/{property.images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  carouselContainer: {
    position: 'relative',
    height: height * 0.45,
    width: width,
  },
  carouselImage: {
    width: width,
    height: height * 0.45,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    top: 50,
    left: 16,
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusTag: {
    position: 'absolute',
    top: 100,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  listedDateTag: {
    position: 'absolute',
    top: 100,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  listedDateText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 4,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
    opacity: 0.4,
  },
  paginationDotActive: {
    opacity: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  contentWrapper: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100, // Extra padding for the bottom contact bar
  },
  propertyHeader: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  propertyTypeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  propertyTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  mapButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewCountText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  overviewContainer: {
    marginBottom: 24,
  },
  keyFeaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  keyFeatureCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  keyFeatureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  featureCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  categoryFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  nearbyContainer: {
    marginBottom: 24,
  },
  nearbyPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nearbyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nearbyPlaceInfo: {
    flex: 1,
  },
  nearbyPlaceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  nearbyPlaceDistance: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  viewMapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  agentCard: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 24,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewProfileButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  agentSpecialty: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  contactBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  callButtonText: {
    color: COLORS.white,
    marginLeft: 8,
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp color
    borderColor: '#25D366',
    width: 50,
    flex: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
  },
  pinchContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.8,
  },
  fullScreenImageCounter: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  }
});