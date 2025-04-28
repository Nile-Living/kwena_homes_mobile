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
  Switch,
} from "react-native";
import { supabase } from "@/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { uploadImageToSupabase } from "@/hooks/imageHelpers";
import { Picker } from "@react-native-picker/picker";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/propertyTypes";

interface FormData {
  title: string;
  price: string;
  location: string;
  description: string;
  propertyType: "rent" | "sale";
  coordinates: { latitude: number; longitude: number };
  category: PropertyCategory;
  amenities: string[];
  security_features?: string[];
  
  // Dynamic fields
  bedrooms?: string;
  bathrooms?: string;
  garages?: string;
  parkings?: string;
  size_sqm?: string;
  legal_status?: string;
  intended_use?: string;
  road_access?: boolean;
  water_supply?: string;
  electricity_available?: boolean;
  fenced?: boolean;
  square_meters?: string;
  parking_spaces?: string;
  commercial_property_type?: string;
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
    description: "",
    propertyType: "rent",
    coordinates: { latitude: -15.3875, longitude: 28.3228 },
    category: "house",
    amenities: [],
    security_features: [],
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const currentCategoryDetails = PROPERTY_TYPES[formData.category];
  const availableAmenities = currentCategoryDetails?.amenities || [];

  useEffect(() => {
    const fetchProperty = async () => {
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        router.back();
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch base property
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .single();

        if (propertyError) throw propertyError;

        // Fetch details based on category
        const detailTable = `property_details_${propertyData.category}`;
        const { data: detailData, error: detailError } = await supabase
          .from(detailTable)
          .select("*")
          .eq("property_id", id)
          .single();

        if (detailError && propertyData.category !== 'land') throw detailError;

        // Combine data
        setFormData({
          title: propertyData.title,
          price: propertyData.price?.toString() ?? "",
          location: propertyData.location,
          description: propertyData.description || "",
          propertyType: propertyData.property_type,
          coordinates: propertyData.coordinates || { latitude: -15.3875, longitude: 28.3228 },
          category: propertyData.category,
          amenities: detailData?.amenities || [],
          security_features: detailData?.security_features || [],
          bedrooms: detailData?.bedrooms?.toString() ?? "",
          bathrooms: detailData?.bathrooms?.toString() ?? "",
          garages: detailData?.garages?.toString() ?? "",
          parkings: detailData?.parkings?.toString() ?? "",
          size_sqm: detailData?.size_sqm?.toString() ?? "",
          legal_status: detailData?.legal_status ?? "",
          intended_use: detailData?.intended_use ?? "",
          road_access: detailData?.road_access ?? false,
          water_supply: detailData?.water_supply ?? "",
          electricity_available: detailData?.electricity_available ?? false,
          fenced: detailData?.fenced ?? false,
          square_meters: detailData?.square_meters?.toString() ?? "",
          parking_spaces: detailData?.parking_spaces?.toString() ?? "",
          commercial_property_type: detailData?.property_type ?? "",
        });

        setExistingImages(propertyData.images || []);
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
      console.error('Error deleting image from storage:', error);
    }
  };

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

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in");
      return;
    }

    // Validation
    const validationErrors = [];
    if (!formData.title) validationErrors.push("Title");
    if (!formData.price) validationErrors.push("Price");
    if (!formData.location) validationErrors.push("Location");
    if (!formData.description) validationErrors.push("Description");
    if (currentCategoryDetails?.hasBedBath) {
      if (!formData.bedrooms) validationErrors.push("Bedrooms");
      if (!formData.bathrooms) validationErrors.push("Bathrooms");
    }
    if (currentCategoryDetails?.hasLandDetails) {
      if (!formData.size_sqm) validationErrors.push("Land Size (sqm)");
      if (!formData.legal_status) validationErrors.push("Legal Status");
      if (!formData.intended_use) validationErrors.push("Intended Use");
      if (!formData.water_supply) validationErrors.push("Water Supply");
    }
    if (currentCategoryDetails?.hasSquareMeters && !formData.square_meters) validationErrors.push("Square Meters");
    if (currentCategoryDetails?.hasCommercialDetails && !formData.commercial_property_type) validationErrors.push("Commercial Property Type");
    if (existingImages.length + newImages.length === 0) validationErrors.push("at least one Image");

    if (validationErrors.length > 0) {
      Alert.alert("Missing Information", `Please fill in: ${validationErrors.join(", ")}`);
      return;
    }

    try {
      setLoading(true);

      // Upload new images
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

      // Filter out failed uploads
      const successfulUploads = uploadedImages.filter(url => url !== null) as string[];
      
      // Combine existing and new images
      const allImages = [...existingImages, ...successfulUploads];
      const removedImages = existingImages.filter(img => !allImages.includes(img));
      await Promise.all(removedImages.map(deleteImageFromStorage));

      if (allImages.length === 0) {
        Alert.alert("Error", "At least one image is required");
        return;
      }

      // Prepare base update
      const baseUpdate = {
        title: formData.title,
        price: parseFloat(formData.price),
        location: formData.location,
        description: formData.description,
        property_type: formData.propertyType,
        coordinates: formData.coordinates,
        images: allImages,
        category: formData.category
      };

      // Prepare details update
      let detailsUpdate: any = {};
      switch (formData.category) {
        case 'house':
          detailsUpdate = {
            bedrooms: parseInt(formData.bedrooms || "0"),
            bathrooms: parseInt(formData.bathrooms || "0"),
            garages: parseInt(formData.garages || "0"),
            parkings: parseInt(formData.parkings || "0"),
            amenities: formData.amenities,
            security_features: formData.security_features
          };
          break;
        case 'land':
          detailsUpdate = {
            size_sqm: parseFloat(formData.size_sqm || "0"),
            legal_status: formData.legal_status,
            intended_use: formData.intended_use,
            road_access: formData.road_access,
            water_supply: formData.water_supply,
            electricity_available: formData.electricity_available,
            fenced: formData.fenced
          };
          break;
        case 'apartment':
          detailsUpdate = {
            bedrooms: parseInt(formData.bedrooms || "0"),
            bathrooms: parseInt(formData.bathrooms || "0"),
            square_meters: parseFloat(formData.square_meters || "0"),
            parking_spaces: parseInt(formData.parking_spaces || "0"),
            amenities: formData.amenities,
            security_features: formData.security_features
          };
          break;
        case 'commercial':
          detailsUpdate = {
            property_type: formData.commercial_property_type,
            square_meters: parseFloat(formData.square_meters || "0"),
            parking_spaces: parseInt(formData.parking_spaces || "0"),
            amenities: formData.amenities,
            security_features: formData.security_features
          };
          break;
      }

      // Update base property
      const { error: baseError } = await supabase
        .from("properties")
        .update(baseUpdate)
        .eq("id", id)
        .eq("user_id", user.id);

      if (baseError) throw baseError;

      // Update details
      const detailTable = `property_details_${formData.category}`;
      const { error: detailError } = await supabase
        .from(detailTable)
        .update(detailsUpdate)
        .eq("property_id", id);

      if (detailError) throw detailError;

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
      <Stack.Screen options={{ title: "Edit Property", headerTitle: "Edit Property" }} />
      
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-1">Edit Property</Text>
        <Text className="text-gray-500">Update your property details below</Text>
      </View>

      {/* Image Upload Section */}
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
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50"
            >
              <Ionicons name="add" size={32} color="gray" />
              <Text className="text-xs text-gray-500 mt-1">Add Image</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Category Selection */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Category *</Text>
        <View className="border border-gray-300 rounded-lg bg-gray-50">
          <Picker
            selectedValue={formData.category}
            onValueChange={(itemValue) => updateFormField('category', itemValue as PropertyCategory)}
            style={{ height: 50, width: '100%' }}
          >
            {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
              <Picker.Item key={key} label={value.label} value={key} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Property Type (Rent/Sale) */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Listing Type *</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => updateFormField('propertyType', 'rent')}
            className={`flex-1 border rounded-lg p-3 items-center ${formData.propertyType === 'rent' ? 'bg-blue-100 border-blue-500' : 'border-gray-300 bg-gray-50'}`}
          >
            <Text className={`font-medium ${formData.propertyType === 'rent' ? 'text-blue-600' : 'text-gray-700'}`}>
              For Rent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateFormField('propertyType', 'sale')}
            className={`flex-1 border rounded-lg p-3 items-center ${formData.propertyType === 'sale' ? 'bg-blue-100 border-blue-500' : 'border-gray-300 bg-gray-50'}`}
          >
            <Text className={`font-medium ${formData.propertyType === 'sale' ? 'text-blue-600' : 'text-gray-700'}`}>
              For Sale
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Property Details */}
      <Text className="text-lg font-semibold mb-3 mt-2">Property Details</Text>

      {/* Base Fields */}
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Title *</Text>
        <TextInput
          value={formData.title}
          onChangeText={(v) => updateFormField('title', v)}
          placeholder="e.g. Modern 3-Bed House"
          className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Price (K) *</Text>
        <TextInput
          value={formData.price}
          onChangeText={(v) => updateFormField('price', v)}
          placeholder={formData.propertyType === 'rent' ? "e.g. 15000" : "e.g. 2500000"}
          keyboardType="numeric"
          className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Location Description *</Text>
        <TextInput
          value={formData.location}
          onChangeText={(v) => updateFormField('location', v)}
          placeholder="e.g. Off Zambezi Rd, Lusaka"
          className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
        />
      </View>

      {/* Bedrooms/Bathrooms */}
      {currentCategoryDetails?.hasBedBath && (
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bedrooms *</Text>
            <TextInput
              value={formData.bedrooms}
              onChangeText={(v) => updateFormField('bedrooms', v)}
              keyboardType="numeric"
              placeholder="e.g. 3"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bathrooms *</Text>
            <TextInput
              value={formData.bathrooms}
              onChangeText={(v) => updateFormField('bathrooms', v)}
              keyboardType="numeric"
              placeholder="e.g. 2"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
        </View>
      )}

      {/* Garages/House Parkings */}
      {currentCategoryDetails?.hasGaragesParkings && (
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Garages</Text>
            <TextInput
              value={formData.garages}
              onChangeText={(v) => updateFormField('garages', v)}
              keyboardType="numeric"
              placeholder="e.g. 1"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Parkings (House)</Text>
            <TextInput
              value={formData.parkings}
              onChangeText={(v) => updateFormField('parkings', v)}
              keyboardType="numeric"
              placeholder="e.g. 2"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
        </View>
      )}

      {/* Square Meters & Parking Spaces */}
      {currentCategoryDetails?.hasSquareMeters && (
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Area (sqm) *</Text>
            <TextInput
              value={formData.square_meters}
              onChangeText={(v) => updateFormField('square_meters', v)}
              keyboardType="numeric"
              placeholder="e.g. 120"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Parking Spaces</Text>
            <TextInput
              value={formData.parking_spaces}
              onChangeText={(v) => updateFormField('parking_spaces', v)}
              keyboardType="numeric"
              placeholder="e.g. 1"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
        </View>
      )}

      {/* Land Details */}
      {currentCategoryDetails?.hasLandDetails && (
        <View className="mb-4">
          <Text className="text-base font-medium mb-3">Land Specifics</Text>
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Land Size (sqm) *</Text>
            <TextInput
              value={formData.size_sqm}
              onChangeText={(v) => updateFormField('size_sqm', v)}
              keyboardType="numeric"
              placeholder="e.g. 4000"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Legal Status *</Text>
            <TextInput
              value={formData.legal_status}
              onChangeText={(v) => updateFormField('legal_status', v)}
              placeholder="e.g. Title Deed, Customary"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Intended Use *</Text>
            <TextInput
              value={formData.intended_use}
              onChangeText={(v) => updateFormField('intended_use', v)}
              placeholder="e.g. Residential, Agricultural"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Water Supply *</Text>
            <TextInput
              value={formData.water_supply}
              onChangeText={(v) => updateFormField('water_supply', v)}
              placeholder="e.g. Borehole, Municipal"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
            />
          </View>
          <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Text className="text-base text-gray-700">Road Access</Text>
            <Switch
              value={formData.road_access}
              onValueChange={(v) => updateFormField('road_access', v)}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Text className="text-base text-gray-700">Electricity Available</Text>
            <Switch
              value={formData.electricity_available}
              onValueChange={(v) => updateFormField('electricity_available', v)}
            />
          </View>
          <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Text className="text-base text-gray-700">Fenced</Text>
            <Switch
              value={formData.fenced}
              onValueChange={(v) => updateFormField('fenced', v)}
            />
          </View>
        </View>
      )}

      {/* Commercial Details */}
      {currentCategoryDetails?.hasCommercialDetails && (
        <View className="mb-4">
          <Text className="text-base font-medium mb-3">Commercial Specifics</Text>
          <Text className="text-sm text-gray-600 mb-1">Commercial Property Type *</Text>
          <TextInput
            value={formData.commercial_property_type}
            onChangeText={(v) => updateFormField('commercial_property_type', v)}
            placeholder="e.g. Office, Retail, Warehouse"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base"
          />
        </View>
      )}

      {/* Amenities */}
      {availableAmenities.length > 0 && (
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Amenities</Text>
          <View className="flex-row flex-wrap gap-2">
            {availableAmenities.map((amenity) => (
              <TouchableOpacity
                key={amenity}
                onPress={() => {
                  const newAmenities = formData.amenities.includes(amenity)
                    ? formData.amenities.filter((a) => a !== amenity)
                    : [...formData.amenities, amenity];
                  updateFormField("amenities", newAmenities);
                }}
                className={`px-3 py-2 rounded-full border ${
                  formData.amenities.includes(amenity)
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <Text className={`text-sm ${
                  formData.amenities.includes(amenity) 
                    ? "text-blue-600" 
                    : "text-gray-700"
                }`}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      <View className="mb-6">
        <Text className="text-sm text-gray-600 mb-1">Description *</Text>
        <TextInput
          value={formData.description}
          onChangeText={(v) => updateFormField('description', v)}
          placeholder="Describe the property..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base h-32"
        />
      </View>

      {/* Map Section */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Location *</Text>
        <Text className="text-sm text-gray-500 mb-2">
          Tap on the map to update the location
        </Text>
        <View style={{ height: 250, borderRadius: 8, overflow: "hidden" }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: formData.coordinates.latitude,
              longitude: formData.coordinates.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={formData.coordinates}
              title="Property Location"
              draggable
              onDragEnd={handleMapPress}
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
            loading ? "bg-gray-400" : "bg-emerald-700"
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