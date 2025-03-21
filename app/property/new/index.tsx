import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, UrlTile } from "react-native-maps";
import {
  prepareImageForUpload,
  uploadImageToSupabase,
} from "@/hooks/imageHelpers";
import * as Location from "expo-location";

// Define type for form data
interface FormData {
  title: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  propertyType: "rent" | "sale";
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    propertyType: "rent", // Default to rent
    coordinates: {
      latitude: -15.3875,
      longitude: 28.3228,
    },
  });

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed");
      return;
    }

    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add the selected image to the array
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Image Selection Error",
        "There was a problem selecting your image. Please try again."
      );
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setFormData((prev) => ({
      ...prev,
      coordinates: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in to list a property");
      return;
    }
  
    // Form validation
    if (
      !formData.title ||
      !formData.price ||
      !formData.location ||
      !formData.bedrooms ||
      !formData.bathrooms ||
      !formData.description
    ) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }
  
    if (images.length === 0) {
      Alert.alert("Missing Images", "Please add at least one image");
      return;
    }
  
    try {
      setLoading(true);
      setUploadProgress(0);
  
      // Show progress indicator
      Alert.alert(
        "Upload Started",
        "Your images are being uploaded. This may take a few minutes depending on your connection speed.",
        [{ text: "OK" }]
      );
  
      // Upload images one by one with progress tracking
      const imageUrls = [];
      const failedUploads = [];
      
      for (let i = 0; i < images.length; i++) {
        try {
          // Update progress indicator
          setUploadProgress(Math.floor((i / images.length) * 100));
          
          console.log(`Starting upload for image ${i+1} of ${images.length}`);
          
          // Use the enhanced helper function to upload the image with ArrayBuffer
          const imageUrl = await uploadImageToSupabase(
            supabase,
            images[i],
            user.id,
            i,
            'property-images',
            3 // Max retries
          );
          
          imageUrls.push(imageUrl);
          console.log(`Successfully uploaded image ${i+1}: ${imageUrl.substring(0, 30)}...`);
        } catch (uploadError) {
          console.error(`Error uploading image ${i}:`, uploadError);
          failedUploads.push(i + 1); // Store failed upload index (1-based for user display)
        }
      }
  
      // Check if we have any successful uploads
      if (imageUrls.length === 0) {
        throw new Error("Failed to upload any images. Please check your internet connection and try again.");
      }
      
      // Notify user of partial uploads if any failed
      if (failedUploads.length > 0) {
        console.log(`${failedUploads.length} images failed to upload: ${failedUploads.join(', ')}`);
        
        const shouldContinue = await new Promise((resolve) => {
          Alert.alert(
            "Partial Upload",
            `Successfully uploaded ${imageUrls.length} out of ${images.length} images. Would you like to continue with the listing?`,
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "Continue", onPress: () => resolve(true) }
            ],
            { cancelable: false }
          );
        });
        
        if (!shouldContinue) {
          setLoading(false);
          setUploadProgress(0);
          return;
        }
      }
  
      setUploadProgress(100);
  
      // Create property in database
      const { data, error } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          title: formData.title,
          price: parseFloat(formData.price),
          location: formData.location,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          description: formData.description,
          coordinates: formData.coordinates,
          images: imageUrls,
          property_type: formData.propertyType,
        })
        .select()
        .single();
  
      if (error) throw error;
  
      Alert.alert("Success", "Property listed successfully!", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    } catch (error: any) {
      console.error("Error creating property:", error);
      Alert.alert(
        "Error",
        `Error creating property: ${error.message || "Unknown error"}\n\nCheck your internet connection and try again.`
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Add New Property</Text>
        <Text className="text-gray-500">
          Fill in the details below to list your property
        </Text>
      </View>

      {/* Property Images */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">
          Property Images (Max 5)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {images.map((image, index) => (
            <View key={`img-${index}`} className="relative mr-3">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
            >
              <Ionicons name="add" size={32} color="gray" />
              <Text className="text-xs text-gray-500 mt-1">Add Image</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Property Type Selection */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Type *</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className={`flex-1 border rounded-lg p-3 items-center ${
              formData.propertyType === "rent"
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
            onPress={() =>
              setFormData((prev) => ({ ...prev, propertyType: "rent" }))
            }
          >
            <Text
              className={`font-medium ${
                formData.propertyType === "rent"
                  ? "text-blue-500"
                  : "text-gray-600"
              }`}
            >
              For Rent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 border rounded-lg p-3 items-center ${
              formData.propertyType === "sale"
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
            onPress={() =>
              setFormData((prev) => ({ ...prev, propertyType: "sale" }))
            }
          >
            <Text
              className={`font-medium ${
                formData.propertyType === "sale"
                  ? "text-blue-500"
                  : "text-gray-600"
              }`}
            >
              For Sale
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Property Details */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Details</Text>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Title *</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => updateFormField("title", text)}
            placeholder="e.g. Modern 2-Bed Apartment with Ocean View"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">
            {formData.propertyType === "rent"
              ? "Price (K/month) *"
              : "Price ($) *"}
          </Text>
          <TextInput
            value={formData.price}
            onChangeText={(text) => updateFormField("price", text)}
            placeholder={
              formData.propertyType === "rent" ? "e.g. 1500" : "e.g. 350000"
            }
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Location *</Text>
          <TextInput
            value={formData.location}
            onChangeText={(text) => updateFormField("location", text)}
            placeholder="e.g. Kabulonga"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bedrooms *</Text>
            <TextInput
              value={formData.bedrooms}
              onChangeText={(text) => updateFormField("bedrooms", text)}
              placeholder="e.g. 2"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bathrooms *</Text>
            <TextInput
              value={formData.bathrooms}
              onChangeText={(text) => updateFormField("bathrooms", text)}
              placeholder="e.g. 1"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Description *</Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => updateFormField("description", text)}
            placeholder="Describe your property..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
          />
        </View>
      </View>

      {/* Map for Location Selection */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Location *</Text>
        <Text className="text-sm text-gray-500 mb-2">
          Tap on the map to set the exact location of your property
        </Text>

        <View style={{ height: 250, borderRadius: 8, overflow: "hidden" }}>
          <MapView
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            initialRegion={{
              latitude: formData.coordinates.latitude,
              longitude: formData.coordinates.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: formData.coordinates.latitude,
                longitude: formData.coordinates.longitude,
              }}
              title="Property Location"
            />
          </MapView>
        </View>

        <View className="mt-2 flex-row">
          <Text className="text-xs text-gray-500">
            Lat: {formData.coordinates.latitude.toFixed(5)}
          </Text>
          <Text className="text-xs text-gray-500 ml-4">
            Long: {formData.coordinates.longitude.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View className="my-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-lg py-4 px-6 items-center justify-center ${
            loading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              List Property
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
