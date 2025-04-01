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
} from "react-native";
import { useLocalSearchParams, Stack, useNavigation } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useStore, Property } from "@/store/useStore";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { propertyDetailsStyles as styles } from "@/constants/styles/property_details";
import { supabase } from "@/supabaseClient";
import LoadingSpinner from "@/components/LoadingSpinner";

const { width } = Dimensions.get("window");

export default function PropertyDetails() {
  // All hooks at the top of the component
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values for pinch-to-zoom
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        
        // Check Zustand first
        const existingProperty = useStore.getState().properties.find(p => p.id === id);
        if (existingProperty) {
          // Fetch agent data from Supabase
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("full_name, phone, email")
            .eq("id", existingProperty.user_id)
            .single();
    
          setProperty({
            ...existingProperty,
            agent: {
              name: userData?.full_name || "Unknown",
              phone: userData?.phone || "No phone provided",
              email: userData?.email,
            },
            liked: useStore.getState().savedProperties.includes(existingProperty.id),
          });
          setLoading(false);
          return;
        }
    
        // If not in Zustand, fetch from your backend
        const response = await fetch(`https://kwena-properties-backend.onrender.com/api/properties/${id}`);
        if (!response.ok) throw new Error('Failed to fetch property');
        const propertyData = await response.json();
    
        // Fetch agent data from Supabase
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("full_name, phone, email")
          .eq("id", propertyData.user_id)
          .single();
    
        // Update Zustand with the new property (deduplicate)
        const currentProperties = useStore.getState().properties;
        const mergedProperties = [...currentProperties, propertyData].filter(
          (p, index, self) => self.findIndex((prop) => prop.id === p.id) === index
        );
        useStore.getState().setProperties(mergedProperties);
    
        setProperty({
          ...propertyData,
          agent: {
            name: userData?.full_name || "Unknown",
            phone: userData?.phone || "No phone provided",
            email: userData?.email,
          },
          liked: useStore.getState().savedProperties.includes(propertyData.id),
        });
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleCallAgent = () => {
    if (property?.agent?.phone) {
      const phoneUrl = `tel:${property.agent.phone}`;
      Linking.canOpenURL(phoneUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(phoneUrl);
          } else {
            console.log("Phone dialer is not available");
          }
        })
        .catch((err) => console.error("An error occurred", err));
    }
  };

  const handleWhatsAppAgent = () => {
    if (property?.agent?.phone) {
      const phoneNumber = property.agent.phone.replace(/\D/g, "");
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=Hello, I'm interested in the ${property.title} property listed on your app.`;

      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            console.log("WhatsApp is not installed");
            const webWhatsappUrl = `https://wa.me/${phoneNumber}?text=Hello, I'm interested in the ${encodeURIComponent(
              property.title
            )} property listed on Kwena Homes.`;
            return Linking.openURL(webWhatsappUrl);
          }
        })
        .catch((err) => console.error("An error occurred", err));
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onPinchGestureEvent = ({ nativeEvent }: any) => {
    scale.value = savedScale.value * nativeEvent.scale;
  };

  const onPinchHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      savedScale.value = scale.value;
    }
  };

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const toggleFullScreen = (imageUri?: string) => {
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

  // Ensure we have at least one image to display
  const images =
    property?.images && property.images.length > 0
      ? property.images
      : ["https://via.placeholder.com/400x300?text=No+Image+Available"];

  // Single return statement with conditional rendering
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: property?.title || "Property Details",
          headerTitle: property?.title || "Property Details",
        }}
      />
      {loading ? (
        <LoadingSpinner />
      ) : !property ? (
        <Text>Property not found</Text>
      ) : (
        <ScrollView style={styles.container}>
          {/* Image Carousel */}
          <View>
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
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
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            {/* Image counter overlay */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeIndex + 1}/{images.length}
              </Text>
            </View>

            {/* Pagination dots */}
            <View style={styles.pagination}>
              {images.map((_: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeIndex ? styles.paginationDotActive : {},
                  ]}
                  onPress={() => handleDotPress(index)}
                />
              ))}
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.price}>K{property.price.toLocaleString()}</Text>
            <Text style={styles.location}>{property.location}</Text>

            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="bed-outline" size={20} color="#666" />
                <Text style={styles.featureText}>
                  {property.bedrooms} Bedrooms
                </Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="water-outline" size={20} color="#666" />
                <Text style={styles.featureText}>
                  {property.bathrooms} Bathrooms
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>

            {property.agent && (
              <View style={styles.agentSection}>
                <Text style={styles.sectionTitle}>Contact Person</Text>
                <View style={styles.agentInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={50}
                    color={Colors.light.tint}
                    style={styles.agentAvatar}
                  />
                  <View style={styles.agentDetails}>
                    <Text style={styles.agentName}>{property.agent.name}</Text>
                    <Text style={styles.agentContact}>
                      {property.agent.phone}
                    </Text>
                    {property.agent.email && (
                      <Text style={styles.agentContact}>
                        {property.agent.email}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.contactButtons}>
                  <TouchableOpacity
                    style={[styles.contactButton, styles.callButton]}
                    onPress={handleCallAgent}
                  >
                    <Ionicons name="call-outline" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.contactButton, styles.whatsappButton]}
                    onPress={handleWhatsAppAgent}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Full screen image modal with pinch-to-zoom */}
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={exitFullScreen}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={exitFullScreen}>
            <Ionicons name="close-circle" size={36} color="#fff" />
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
              {activeIndex + 1}/{images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}
