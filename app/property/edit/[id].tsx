import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
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
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { uploadImageToSupabase } from "@/hooks/imageHelpers";

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
  images: string[];
}

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
    propertyType: "rent",
    coordinates: { latitude: -15.3875, longitude: 28.3228 },
    images: [],
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        router.back();
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data.user_id !== user.id) {
          Alert.alert("Error", "You don't have permission to edit this property");
          router.back();
          return;
        }

        setFormData({
          title: data.title,
          price: data.price.toString(),
          location: data.location,
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          description: data.description || "",
          propertyType: data.property_type,
          coordinates: data.coordinates || { latitude: -15.3875, longitude: 28.3228 },
          images: data.images,
        });
        setExistingImages(data.images || []);
      } catch (error) {
        console.error("Fetch error:", error);
        Alert.alert("Error", "Failed to load property details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const pickImage = async () => {
    if (newImages.length + existingImages.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 images allowed");
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant permission to access photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setNewImages([...newImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const removeImage = (index: number, isNew: boolean) => {
    if (isNew) {
      setNewImages(newImages.filter((_, i) => i !== index));
    } else {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    }
  };

    const deleteImageFromStorage = async (imageUrl: string) => {
      try {
        const path = imageUrl.split('/').slice(-2).join('/');
        const { error } = await supabase.storage
        .from('property-images')
        .remove([path]);
  
        if (error) throw error;
      } catch (error) {
        console.error(' Error deleting image from storage:', error);
      }
    }
  

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
    }));
  };

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in");
      return;
    }

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

    try {
      setLoading(true);

      const uploadedImages = await Promise.all(
        newImages.map(async (uri, index) => {
          try {
            return await uploadImageToSupabase(
              supabase,
              uri,
              user.id,
              Date.now() + index,
              'property-images'
            );
          } catch (error) {
            console.error("Image upload failed:", error);
            return null;
          }
        })
      );

      // Filter out any failed uploads
      const successfulUploads = uploadedImages.filter(url => url !== null) as string[];
      
      // Combine existing and new images
      const allImages = [...existingImages ?? [], ...successfulUploads ?? []];

      const removedImages = existingImages?.filter(img => !allImages?.includes(img)) ?? [];
      await Promise.all(
        removedImages.map(imageUrl => deleteImageFromStorage(imageUrl))
      );

      if ((allImages ?? []).length === 0) {
        Alert.alert("Error", "At least one image is required");
        return;
      }

      // Update property in database
      const { error } = await supabase
        .from("properties")
        .update({
          title: formData.title,
          price: parseFloat(formData.price),
          location: formData.location,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          description: formData.description,
          property_type: formData.propertyType,
          coordinates: formData.coordinates,
          images: allImages,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Property updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Loading property details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Stack.Screen
        options={{
          title: "Edit Property",
          headerTitle: "Edit Property",
        }}
      />
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Edit Property</Text>
        <Text className="text-gray-500">Update your property details below</Text>
      </View>

      {/* Property Images */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Images (Max 5)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {existingImages.map((image, index) => (
            <View key={`existing-${index}`} className="relative mr-3">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
              <TouchableOpacity
                onPress={() => removeImage(index, false)}
                className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((image, index) => (
            <View key={`new-${index}`} className="relative mr-3">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
              <TouchableOpacity
                onPress={() => removeImage(index, true)}
                className="absolute top-1 right-1 bg-white rounded-full p-1"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {(existingImages.length + newImages.length) < 5 && (
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
            onPress={() => updateFormField("propertyType", "rent")}
          >
            <Text className={`font-medium ${
              formData.propertyType === "rent" ? "text-blue-500" : "text-gray-600"
            }`}>
              For Rent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 border rounded-lg p-3 items-center ${
              formData.propertyType === "sale"
                ? "bg-blue-100 border-blue-500"
                : "border-gray-300"
            }`}
            onPress={() => updateFormField("propertyType", "sale")}
          >
            <Text className={`font-medium ${
              formData.propertyType === "sale" ? "text-blue-500" : "text-gray-600"
            }`}>
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
            placeholder="Property title"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">
            {formData.propertyType === "rent" ? "Price ($/month) *" : "Price ($) *"}
          </Text>
          <TextInput
            value={formData.price}
            onChangeText={(text) => updateFormField("price", text)}
            placeholder="Enter price"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Location *</Text>
          <TextInput
            value={formData.location}
            onChangeText={(text) => updateFormField("location", text)}
            placeholder="Property address"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>

        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bedrooms *</Text>
            <TextInput
              value={formData.bedrooms}
              onChangeText={(text) => updateFormField("bedrooms", text)}
              placeholder="Number of bedrooms"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bathrooms *</Text>
            <TextInput
              value={formData.bathrooms}
              onChangeText={(text) => updateFormField("bathrooms", text)}
              placeholder="Number of bathrooms"
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
            placeholder="Detailed description"
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
          />
        </View>
      </View>

      {/* Map Section */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Location *</Text>
        <Text className="text-sm text-gray-500 mb-2">
          Tap on the map to update the location
        </Text>

        <View style={{ height: 250, borderRadius: 8, overflow: "hidden" }}>
          <MapView
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
            <Text className="text-white font-semibold text-base">Update Property</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}