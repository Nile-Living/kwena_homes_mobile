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
  StyleSheet, // Import StyleSheet if you use it
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/supabaseClient"; // Keep for image upload helper potentially
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Corrected import name
import MapView, { Marker } from "react-native-maps"; // Removed UrITile unless used
import {
  prepareImageForUpload, // Keep if used
  uploadImageToSupabase, // Keep this helper
} from "@/hooks/imageHelpers";
import {
  PROPERTY_TYPES,
  PropertyCategory,
} from "@/constants/propertyTypes";
import { API_BASE_URL } from "@/constants/Config"; // Import API base URL

// Interface for form data - should align with CreatePropertyDto structure
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
  category: PropertyCategory; // e.g., 'house', 'land', 'apartment', 'commercial'
  amenities: string[];
  // Add fields for details based on category
  garages?: string; // Example for house/commercial
  parkings?: string; // Example for house
  size_sqm?: string; // Example for land
  legal_status?: string; // Example for land
  intended_use?: string; // Example for land
  // ... other detail fields
  security_features?: string[]; // Example
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]); // Store local image URIs (file paths)
  const mapRef = useRef<MapView>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Progress 0-100

  // Initial form state - ensure category matches a key in PROPERTY_TYPES
  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    propertyType: "rent", // Default to rent
    coordinates: {
      latitude: -15.3875, // Default coordinates
      longitude: 28.3228,
    },
    category: "house", // Default category
    amenities: [],
    garages: "",
    parkings: "",
    security_features: [],
    // Initialize other fields as needed
  });

  // --- Image Picker Logic (Keep as is) ---
  const pickImage = async () => {
    // ... (your existing pickImage logic remains the same)
    // It should add the local file URI to the `images` state array
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed");
      return;
    }
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos",
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
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Image Selection Error",
        "There was a problem selecting your image. Please try again.",
      );
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // --- Map Press Logic (Keep as is) ---
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

  // --- Form Update Logic (Keep as is) ---
  const updateFormField = (field: keyof FormData, value: any) => {
    // Special handling for nested coordinates if needed, otherwise direct update
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Submission Logic (MODIFIED) ---
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to list a property",
      );
      return;
    }

    // --- Validation (Keep your existing validation) ---
    const validationErrors = [];
    if (!formData.title) validationErrors.push("Title");
    if (!formData.price) validationErrors.push("Price");
    if (!formData.location) validationErrors.push("Location");
    // Add category-specific validation based on PROPERTY_TYPES[formData.category].hasBedBath etc.
    const categoryDetails = PROPERTY_TYPES[formData.category];
    if (categoryDetails?.hasBedBath) {
      if (!formData.bedrooms) validationErrors.push("Bedrooms");
      if (!formData.bathrooms) validationErrors.push("Bathrooms");
    }
    // Add validation for other required fields based on category
    if (!formData.description) validationErrors.push("Description");

    if (validationErrors.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in: ${validationErrors.join(", ")}`,
      );
      return;
    }

    if (images.length === 0) {
      Alert.alert("Missing Images", "Please add at least one image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    const uploadedImageUrls: string[] = [];
    const failedUploads: number[] = [];

    // --- Step 1: Upload Images ---
    try {
      Alert.alert(
        "Upload Started",
        "Your images are being uploaded. This may take a few minutes...",
        [{ text: "OK" }],
      );

      for (let i = 0; i < images.length; i++) {
        const currentProgress = Math.floor(((i + 1) / images.length) * 100);
        setUploadProgress(currentProgress); // Update progress state

        try {
          // Use your existing helper to upload
          const imageUrl = await uploadImageToSupabase(
            supabase, // Pass supabase client instance
            images[i], // Local file URI
            user.id,
            i, // Index for potential naming conflict resolution
            "property-images", // Your designated bucket folder
            3, // Max retries
          );

          if (imageUrl) {
            uploadedImageUrls.push(imageUrl);
            console.log(
              `Successfully uploaded image ${i + 1}: ${imageUrl.substring(
                0,
                30,
              )}...`,
            );
          } else {
            throw new Error("Upload helper returned no URL");
          }
        } catch (uploadError) {
          console.error(`Error uploading image ${i + 1}:`, uploadError);
          failedUploads.push(i + 1);
        }
      }

      // --- Handle Upload Failures ---
      if (uploadedImageUrls.length === 0) {
        throw new Error(
          "Failed to upload any images. Please check your internet connection and try again.",
        );
      }

      if (failedUploads.length > 0) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Partial Upload",
            `Successfully uploaded ${uploadedImageUrls.length} out of ${images.length} images. Failed: ${failedUploads.join(", ")}. Continue listing?`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              { text: "Continue", onPress: () => resolve(true) },
            ],
            { cancelable: false },
          );
        });

        if (!shouldContinue) {
          setLoading(false);
          setUploadProgress(0);
          return; // Stop the submission process
        }
      }
      setUploadProgress(100); // Mark upload as complete

      // --- Step 2: Prepare Payload for Backend ---
      // Construct the 'details' object based on the category
      let detailsPayload: any = {};
      switch (formData.category) {
        case "house":
          detailsPayload = {
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            garages: parseInt(formData.garages || "0") || 0,
            parkings: parseInt(formData.parkings || "0") || 0,
            amenities: formData.amenities,
            security_features: formData.security_features,
          };
          break;
        case "apartment":
          detailsPayload = {
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            square_meters: parseFloat(formData.size_sqm || "0") || 0, // Assuming size_sqm maps here
            amenities: formData.amenities,
            parking_spaces: parseInt(formData.parkings || "0") || 0, // Assuming parkings maps here
            security_features: formData.security_features,
          };
          break;
        case "land":
          detailsPayload = {
            size_sqm: parseFloat(formData.size_sqm || "0") || 0,
            legal_status: formData.legal_status || "",
            intended_use: formData.intended_use || "",
            // Add other land fields: road_access, water_supply etc.
          };
          break;
        case "commercial":
          detailsPayload = {
            property_type: formData.title, // Example: Map title or add specific field
            square_meters: parseFloat(formData.size_sqm || "0") || 0,
            parking_spaces: parseInt(formData.parkings || "0") || 0,
            amenities: formData.amenities,
            security_features: formData.security_features,
          };
          break;
        // Add cases for other categories
      }

      const payload = {
        title: formData.title,
        price: parseFloat(formData.price) || 0,
        location: formData.location,
        images: uploadedImageUrls, // Use the uploaded URLs
        coordinates: formData.coordinates,
        description: formData.description,
        user_id: user.id, // Add user_id
        agent_id: undefined, // Add if applicable
        property_type: formData.propertyType,
        category: formData.category,
        details: Object.keys(detailsPayload).length > 0 ? detailsPayload : undefined, // Include details only if populated
        // DO NOT include base bedrooms/bathrooms if they are removed from backend 'properties' table
      };

      console.log("Sending payload to backend:", JSON.stringify(payload));

      // --- Step 3: Send Data to Backend ---
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          // Use specific error message from backend if available
          errorMsg =
            errorData.message || JSON.stringify(errorData) || errorMsg;
        } catch (e) {
          // Ignore if response body is not JSON
        }
        throw new Error(`Failed to create property: ${errorMsg}`);
      }

      const createdProperty = await response.json();
      console.log("Property created successfully:", createdProperty);

      Alert.alert("Success", "Property listed successfully!", [
        { text: "OK", onPress: () => router.push("/") }, // Navigate home on success
      ]);
    } catch (error: any) {
      console.error("Error submitting property:", error);
      Alert.alert(
        "Error",
        `Error creating property: ${error.message || "Unknown error"}\n\nCheck your connection and try again.`,
      );
    } finally {
      setLoading(false);
      setUploadProgress(0); // Reset progress
    }
  };

  // --- Render Logic (Keep your existing JSX structure) ---
  return (
    <ScrollView
      // className="flex-1 bg-white p-4" // Use Nativewind if applicable
      style={{ flex: 1, backgroundColor: "white", padding: 16 }} // Use StyleSheet otherwise
      keyboardShouldPersistTaps="handled" // Good practice for ScrollViews with inputs
    >
      {/* --- Add New Property Header --- */}
      <View style={{ marginBottom: 24 }}>
        {/* className="mb-6" */}
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          {/* className="text-lg font-semibold mb-2" */}
          Add New Property
        </Text>
        <Text style={{ color: "#6B7280" }}>
          {/* className="text-gray-500" */}
          Fill in the details below to list your property
        </Text>
      </View>

      {/* --- Property Images Section (Keep as is) --- */}
      <View style={{ marginBottom: 24 }}>
        {/* className="mb-6" */}
        <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
          {/* className="text-base font-medium mb-2" */}
          Property Images (Max 5)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          // className="mb-3"
        >
          {images.map((image, index) => (
            <View key={`img-${index}`} style={{ position: "relative", marginRight: 12 }}>
              {/* className="relative mr-3" */}
              <Image
                source={{ uri: image }}
                style={{ width: 96, height: 96, borderRadius: 8 }} // w-24 h-24 rounded-lg
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "white",
                  borderRadius: 999,
                  padding: 2,
                }}
                // className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              style={{
                width: 96,
                height: 96,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: "#D1D5DB", // border-gray-300
                borderRadius: 8, // rounded-lg
                justifyContent: "center",
                alignItems: "center",
              }}
              // className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center"
            >
              <Ionicons name="add" size={32} color="gray" />
              <Text style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>
                {/* className="text-xs text-gray-500 mt-1" */}
                Add Image
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* --- Other form fields (Category, Type, Details, Map, etc.) --- */}
      {/* Keep your existing JSX structure for these fields */}
      {/* Ensure onChangeText calls updateFormField correctly */}
      {/* Ensure category selection updates formData.category */}
      {/* Ensure property type selection updates formData.propertyType */}
      {/* Ensure map updates formData.coordinates */}

      {/* --- Submit Button --- */}
      <View style={{ marginVertical: 24 }}>
        {/* className="my-6" */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            borderRadius: 8, // rounded-lg
            paddingVertical: 16, // py-4
            paddingHorizontal: 24, // px-6
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loading ? "#9CA3AF" : "#3B82F6", // bg-gray-400 : bg-blue-500
          }}
          // className={`rounded-lg py-4 px-6 items-center justify-center ${loading ? "bg-gray-400" : "bg-blue-500"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
              {/* className="text-white font-semibold text-base" */}
              List Property
            </Text>
          )}
        </TouchableOpacity>
        {/* Optional: Show Upload Progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <View style={{ marginTop: 10, alignItems: "center" }}>
            <Text>Uploading images: {uploadProgress}%</Text>
            {/* You could add a ProgressBar component here */}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Add StyleSheet definitions if you are not using Nativewind
// const styles = StyleSheet.create({ ... });
