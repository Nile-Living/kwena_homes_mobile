import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
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
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setFormData({
          title: data.title,
          price: data.price.toString(),
          location: data.location,
          bedrooms: data.bedrooms.toString(),
          bathrooms: data.bathrooms.toString(),
          description: data.description,
          propertyType: data.property_type,
          coordinates: data.coordinates,
          images: data.images,
        });
        setExistingImages(data.images);
      } catch (error) {
        Alert.alert("Error", "Failed to load property details");
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
      console.error("Error picking image:", error);
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

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in");
      return;
    }

    try {
      setLoading(true);
      
      // Upload new images
      const uploadedImages = await Promise.all(
        newImages.map(async (uri) => {
          return uploadImageToSupabase(
            supabase,
            uri,
            user.id,
            Date.now(),
            'property-images'
          );
        })
      );

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImages];

      // Update property in database
      const { error } = await supabase
        .from("properties")
        .update({
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          images: allImages,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Property updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Existing Add/Edit UI from AddPropertyScreen */}
      {/* Modify the image section to show both existing and new images */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      {/* Rest of the form from AddPropertyScreen */}
      {/* Make sure to use formData state for all fields */}
      
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-500 py-4 px-6 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">Update Property</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}