import React, { useState, useRef } from "react";
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
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/propertyTypes";
import { API_BASE_URL } from "@/constants/Config";
import { useStore as usePropertyStore } from "@/store/useStore";
import LocationPicker from "@/components/LocationPicker";
import NearbyPlacesInput from "@/components/NearbyPlacesInput";

interface FormData {
  title: string;
  price: string;
  location: string;
  description: string;
  propertyType: "rent" | "sale";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: PropertyCategory;
  amenities: string[];
  security_features?: string[];
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
  contact_phone_number?: string;
  contact_whatsapp_number?: string;
  use_phone_for_call: boolean;
  use_whatsapp_for_message: boolean;
  nearby_places: Array<{
    name: string;
    distance: string;
    icon: string;
  }>;
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { updatePropertyInStore } = usePropertyStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

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
    bedrooms: "",
    bathrooms: "",
    garages: "",
    parkings: "",
    size_sqm: "",
    legal_status: "",
    intended_use: "",
    road_access: false,
    water_supply: "",
    electricity_available: false,
    fenced: false,
    square_meters: "",
    parking_spaces: "",
    commercial_property_type: "",
    contact_phone_number: "",
    contact_whatsapp_number: "",
    use_phone_for_call: true,
    use_whatsapp_for_message: true,
    nearby_places: [
      { name: '', distance: '', icon: 'map-pin' },
      { name: '', distance: '', icon: 'map-pin' },
      { name: '', distance: '', icon: 'map-pin' },
    ],
  });

  const currentCategoryDetails = PROPERTY_TYPES[formData.category];
  const availableAmenities = currentCategoryDetails?.amenities || [];

  const pickImage = async () => {
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
          "Please grant permission to access your photos"
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });
      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0 &&
        result.assets[0].uri
      ) {
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
    mapRef.current?.animateToRegion(
      { ...coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  };

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to list a property"
      );
      return;
    }

    const clientSideValidationErrors = [];
    if (!formData.title.trim()) clientSideValidationErrors.push("Title");
    if (
      !formData.price.trim() ||
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    )
      clientSideValidationErrors.push("Valid Price");
    if (!formData.location.trim()) clientSideValidationErrors.push("Location");
    if (!formData.description.trim())
      clientSideValidationErrors.push("Description");
    if (images.length === 0)
      clientSideValidationErrors.push("at least one Image");
    if (formData.use_phone_for_call && !formData.contact_phone_number?.trim())
      clientSideValidationErrors.push("Phone Number (for calls)");
    if (
      formData.use_whatsapp_for_message &&
      !formData.contact_whatsapp_number?.trim()
    )
      clientSideValidationErrors.push("WhatsApp Number (for messages)");

    if (formData.nearby_places.length < 3) {
      clientSideValidationErrors.push('At least 3 nearby places');
    } else {
      const invalidNearbyPlaces = formData.nearby_places.some(
        place => !place.name.trim() || !place.distance.trim()
      );
      if (invalidNearbyPlaces) {
        clientSideValidationErrors.push('All nearby places must have name and distance');
      }
    }

    if (clientSideValidationErrors.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in: ${clientSideValidationErrors.join(", ")}`
      );
      return;
    }

    setLoading(true);
    const dataPayload = new FormData();

    dataPayload.append("title", formData.title.trim());
    dataPayload.append("price", formData.price.trim());
    dataPayload.append("location", formData.location.trim());
    dataPayload.append("description", formData.description.trim());
    dataPayload.append("property_type", formData.propertyType);
    dataPayload.append("category", formData.category);
    dataPayload.append("coordinates", JSON.stringify(formData.coordinates));
    dataPayload.append("user_id", user.id);

    if (formData.contact_phone_number?.trim())
      dataPayload.append(
        "contact_phone_number",
        formData.contact_phone_number.trim()
      );
    if (formData.contact_whatsapp_number?.trim())
      dataPayload.append(
        "contact_whatsapp_number",
        formData.contact_whatsapp_number.trim()
      );
    dataPayload.append(
      "use_phone_for_call",
      String(formData.use_phone_for_call)
    );
    dataPayload.append(
      "use_whatsapp_for_message",
      String(formData.use_whatsapp_for_message)
    );

    dataPayload.append('nearby_places', JSON.stringify(formData.nearby_places));

    let detailsObject: any = {};
    switch (formData.category) {
      case "house":
        detailsObject = {
          bedrooms: parseInt(formData.bedrooms || "0") || undefined,
          bathrooms: parseInt(formData.bathrooms || "0") || undefined,
          garages: parseInt(formData.garages || "0") || undefined,
          parkings: parseInt(formData.parkings || "0") || undefined,
          amenities: formData.amenities,
          security_features: formData.security_features,
        };
        break;
      case "apartment":
        detailsObject = {
          bedrooms: parseInt(formData.bedrooms || "0") || undefined,
          bathrooms: parseInt(formData.bathrooms || "0") || undefined,
          square_meters: parseFloat(formData.square_meters || "0") || undefined,
          amenities: formData.amenities,
          parking_spaces: parseInt(formData.parking_spaces || "0") || undefined,
          security_features: formData.security_features,
        };
        break;
      case "land":
        detailsObject = {
          size_sqm: parseFloat(formData.size_sqm || "0") || undefined,
          legal_status: formData.legal_status,
          intended_use: formData.intended_use,
          road_access: formData.road_access,
          water_supply: formData.water_supply,
          electricity_available: formData.electricity_available,
          fenced: formData.fenced,
        };
        break;
      case "commercial":
        detailsObject = {
          property_type: formData.commercial_property_type,
          square_meters: parseFloat(formData.square_meters || "0") || undefined,
          parking_spaces: parseInt(formData.parking_spaces || "0") || undefined,
          amenities: formData.amenities,
          security_features: formData.security_features,
        };
        break;
    }
    Object.keys(detailsObject).forEach((key) => {
      if (
        detailsObject[key] == null ||
        detailsObject[key] === "" ||
        (Array.isArray(detailsObject[key]) && detailsObject[key].length === 0)
      ) {
        delete detailsObject[key];
      }
    });

    if (Object.keys(detailsObject).length > 0) {
      dataPayload.append("details", JSON.stringify(detailsObject));
    }

    images.forEach((uri, index) => {
      const filename = uri.split("/").pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      dataPayload.append("images", {
        uri: uri,
        name: filename,
        type: type,
      } as any);
    });

    try {
      const token = useAuthStore.getState().session?.access_token;
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: dataPayload,
      });

      const responseBodyText = await response.text();
      if (!response.ok) {
        let errorMsg = `Status: ${response.status}.`;
        try {
          const errorJson = JSON.parse(responseBodyText);
          if (errorJson.message) {
            errorMsg += ` Message: ${
              Array.isArray(errorJson.message)
                ? errorJson.message.join(", ")
                : errorJson.message
            }`;
          } else {
            errorMsg += ` Body: ${responseBodyText}`;
          }
        } catch (e) {
          errorMsg += ` Body: ${responseBodyText}`;
        }
        throw new Error(`Failed to create property: ${errorMsg}`);
      }
      const newPropertyData = JSON.parse(responseBodyText);
      updatePropertyInStore(newPropertyData.id, newPropertyData);

      Alert.alert("Success", "Property listed successfully!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Submission Error",
        `${error.message || "An unknown error occurred."}`
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "border border-gray-300 dark:border-slate-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-700 text-base text-slate-900 dark:text-slate-100";
  const labelClasses = "text-sm text-gray-600 dark:text-slate-300 mb-1";
  const sectionTitleClasses =
    "text-lg font-semibold mb-3 mt-2 text-slate-800 dark:text-slate-100";
  const pickerContainerClasses =
    "border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700";
  const switchContainerClasses =
    "flex-row justify-between items-center mb-4 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700";
  const switchLabelClasses = "text-base text-gray-700 dark:text-slate-300";

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-slate-800 p-4"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Stack.Screen options={{ title: "Add Property" }} />
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-1 text-slate-800 dark:text-slate-100">
          Add New Property
        </Text>
        <Text className="text-gray-500 dark:text-slate-400">
          Fill in the details below to list your property
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
          Property Images (Max 5) *
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
                className="absolute top-1 right-1 bg-white dark:bg-slate-600 rounded-full p-1 shadow"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg justify-center items-center bg-gray-50 dark:bg-slate-700"
            >
              <Ionicons
                name="add"
                size={32}
                color={colorScheme === "dark" ? "#94a3b8" : "gray"}
              />
              <Text className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Add Image
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
          Property Category *
        </Text>
        <View className={pickerContainerClasses}>
          <Picker
            selectedValue={formData.category}
            onValueChange={(itemValue) =>
              updateFormField("category", itemValue as PropertyCategory)
            }
            style={{
              height: 50,
              width: "100%",
              color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
            }}
            dropdownIconColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
          >
            {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
              <Picker.Item key={key} label={value.label} value={key} />
            ))}
          </Picker>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
          Listing Type *
        </Text>
        <View className="flex-row gap-2 space-x-3">
          <TouchableOpacity
            onPress={() => updateFormField("propertyType", "rent")}
            className={`flex-1 border rounded-lg p-3 items-center ${
              formData.propertyType === "rent"
                ? "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700"
                : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
            }`}
          >
            <Text
              className={`font-medium ${
                formData.propertyType === "rent"
                  ? "text-blue-600 dark:text-blue-300"
                  : "text-gray-700 dark:text-slate-300"
              }`}
            >
              For Rent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateFormField("propertyType", "sale")}
            className={`flex-1 border rounded-lg p-3 items-center ${
              formData.propertyType === "sale"
                ? "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700"
                : "border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
            }`}
          >
            <Text
              className={`font-medium ${
                formData.propertyType === "sale"
                  ? "text-blue-600 dark:text-blue-300"
                  : "text-gray-700 dark:text-slate-300"
              }`}
            >
              For Sale
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className={sectionTitleClasses}>Property Details</Text>
      <View className="mb-4">
        <Text className={labelClasses}>Title *</Text>
        <TextInput
          value={formData.title}
          onChangeText={(v) => updateFormField("title", v)}
          placeholder="e.g. Modern 3-Bed House in Roma"
          className={inputClasses}
          placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        />
      </View>
      <View className="mb-4">
        <Text className={labelClasses}>Price (K) *</Text>
        <TextInput
          value={formData.price}
          onChangeText={(v) => updateFormField("price", v)}
          placeholder={
            formData.propertyType === "rent" ? "e.g. 15000" : "e.g. 2500000"
          }
          keyboardType="numeric"
          className={inputClasses}
          placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        />
      </View>
      <View className="mb-4">
        <Text className={labelClasses}>Location *</Text>
        <LocationPicker
          selectedLocation={formData.location}
          onLocationSelect={(location) => updateFormField("location", location)}
          placeholder="Select Location"
        />
      </View>

      {currentCategoryDetails?.hasBedBath && (
        <View className="flex flex-row mb-4 gap-2">
          <View className="flex-1">
            <Text className={labelClasses}>Bedrooms *</Text>
            <TextInput
              value={formData.bedrooms}
              onChangeText={(v) => updateFormField("bedrooms", v)}
              keyboardType="numeric"
              placeholder="e.g. 3"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="flex-1">
            <Text className={labelClasses}>Bathrooms *</Text>
            <TextInput
              value={formData.bathrooms}
              onChangeText={(v) => updateFormField("bathrooms", v)}
              keyboardType="numeric"
              placeholder="e.g. 2"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
        </View>
      )}
      {currentCategoryDetails?.hasGaragesParkings && (
        <View className="flex flex-row mb-4 gap-2">
          <View className="flex-1">
            <Text className={labelClasses}>Garages</Text>
            <TextInput
              value={formData.garages}
              onChangeText={(v) => updateFormField("garages", v)}
              keyboardType="numeric"
              placeholder="e.g. 1"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="flex-1">
            <Text className={labelClasses}>Parkings (House)</Text>
            <TextInput
              value={formData.parkings}
              onChangeText={(v) => updateFormField("parkings", v)}
              keyboardType="numeric"
              placeholder="e.g. 2"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
        </View>
      )}
      {currentCategoryDetails?.hasSquareMeters && (
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className={labelClasses}>Area (sqm) *</Text>
            <TextInput
              value={formData.square_meters}
              onChangeText={(v) => updateFormField("square_meters", v)}
              keyboardType="numeric"
              placeholder="e.g. 120"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="flex-1">
            <Text className={labelClasses}>Parking Spaces</Text>
            <TextInput
              value={formData.parking_spaces}
              onChangeText={(v) => updateFormField("parking_spaces", v)}
              keyboardType="numeric"
              placeholder="e.g. 1"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
        </View>
      )}
      {currentCategoryDetails?.hasLandDetails && (
        <View className="mb-4">
          <Text className="text-base font-medium mb-3 text-slate-700 dark:text-slate-300">
            Land Specifics
          </Text>
          <View className="mb-4">
            <Text className={labelClasses}>Land Size (sqm) *</Text>
            <TextInput
              value={formData.size_sqm}
              onChangeText={(v) => updateFormField("size_sqm", v)}
              keyboardType="numeric"
              placeholder="e.g. 4000"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="mb-4">
            <Text className={labelClasses}>Legal Status *</Text>
            <TextInput
              value={formData.legal_status}
              onChangeText={(v) => updateFormField("legal_status", v)}
              placeholder="e.g. Title Deed, Customary"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="mb-4">
            <Text className={labelClasses}>Intended Use *</Text>
            <TextInput
              value={formData.intended_use}
              onChangeText={(v) => updateFormField("intended_use", v)}
              placeholder="e.g. Residential, Agricultural"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className="mb-4">
            <Text className={labelClasses}>Water Supply *</Text>
            <TextInput
              value={formData.water_supply}
              onChangeText={(v) => updateFormField("water_supply", v)}
              placeholder="e.g. Borehole, Municipal"
              className={inputClasses}
              placeholderTextColor={
                colorScheme === "dark" ? "#94a3b8" : "#6b7280"
              }
            />
          </View>
          <View className={switchContainerClasses}>
            <Text className={switchLabelClasses}>Road Access</Text>
            <Switch
              value={formData.road_access}
              onValueChange={(v) => updateFormField("road_access", v)}
              trackColor={{
                false: "#767577",
                true: colorScheme === "dark" ? "#14532d" : "#54816D",
              }}
              thumbColor={formData.road_access ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          <View className={switchContainerClasses}>
            <Text className={switchLabelClasses}>Electricity Available</Text>
            <Switch
              value={formData.electricity_available}
              onValueChange={(v) => updateFormField("electricity_available", v)}
              trackColor={{
                false: "#767577",
                true: colorScheme === "dark" ? "#14532d" : "#54816D",
              }}
              thumbColor={
                formData.electricity_available ? "#f4f3f4" : "#f4f3f4"
              }
            />
          </View>
          <View className={switchContainerClasses}>
            <Text className={switchLabelClasses}>Fenced</Text>
            <Switch
              value={formData.fenced}
              onValueChange={(v) => updateFormField("fenced", v)}
              trackColor={{
                false: "#767577",
                true: colorScheme === "dark" ? "#14532d" : "#54816D",
              }}
              thumbColor={formData.fenced ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>
      )}
      {currentCategoryDetails?.hasCommercialDetails && (
        <View className="mb-4">
          <Text className="text-base font-medium mb-3 text-slate-700 dark:text-slate-300">
            Commercial Specifics
          </Text>
          <Text className={labelClasses}>Commercial Property Type *</Text>
          <TextInput
            value={formData.commercial_property_type}
            onChangeText={(v) => updateFormField("commercial_property_type", v)}
            placeholder="e.g. Office, Retail, Warehouse"
            className={inputClasses}
            placeholderTextColor={
              colorScheme === "dark" ? "#94a3b8" : "#6b7280"
            }
          />
        </View>
      )}

      <Text className={sectionTitleClasses}>Contact Configuration</Text>
      <View className="mb-4">
        <Text className={labelClasses}>Contact Phone Number</Text>
        <TextInput
          value={formData.contact_phone_number}
          onChangeText={(v) => updateFormField("contact_phone_number", v)}
          placeholder="e.g. 0977123456"
          keyboardType="phone-pad"
          className={inputClasses}
          placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        />
      </View>
      <View className={switchContainerClasses}>
        <Text className={switchLabelClasses}>
          Use this phone number for calls?
        </Text>
        <Switch
          value={formData.use_phone_for_call}
          onValueChange={(v) => updateFormField("use_phone_for_call", v)}
          disabled={!formData.contact_phone_number}
          trackColor={{
            false: "#767577",
            true: colorScheme === "dark" ? "#14532d" : "#54816D",
          }}
          thumbColor={formData.use_phone_for_call ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>
      <View className="mb-4">
        <Text className={labelClasses}>Contact WhatsApp Number</Text>
        <TextInput
          value={formData.contact_whatsapp_number}
          onChangeText={(v) => updateFormField("contact_whatsapp_number", v)}
          placeholder="e.g. 0966123456"
          keyboardType="phone-pad"
          className={inputClasses}
          placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        />
      </View>
      <View className={switchContainerClasses}>
        <Text className={switchLabelClasses}>
          Use this WhatsApp number for messages?
        </Text>
        <Switch
          value={formData.use_whatsapp_for_message}
          onValueChange={(v) => updateFormField("use_whatsapp_for_message", v)}
          disabled={!formData.contact_whatsapp_number}
          trackColor={{
            false: "#767577",
            true: colorScheme === "dark" ? "#14532d" : "#54816D",
          }}
          thumbColor={formData.use_whatsapp_for_message ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>

      {availableAmenities.length > 0 && (
        <View className="mb-6">
          <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
            Amenities
          </Text>
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
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-700"
                    : "bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                }`}
              >
                <Text
                  className={`text-sm ${
                    formData.amenities.includes(amenity)
                      ? "text-blue-600 dark:text-blue-300"
                      : "text-gray-700 dark:text-slate-300"
                  }`}
                >
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <NearbyPlacesInput
        nearbyPlaces={formData.nearby_places}
        onUpdate={(places) => updateFormField('nearby_places', places)}
        colorScheme={colorScheme ?? null}
      />

      <View className="mb-6">
        <Text className={labelClasses}>Description *</Text>
        <TextInput
          value={formData.description}
          onChangeText={(v) => updateFormField("description", v)}
          placeholder="Describe the property..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className={`${inputClasses} h-32`}
          placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
        />
      </View>
      <View className="mb-6">
        <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
          Property Location *
        </Text>
        <Text className="text-sm text-gray-500 dark:text-slate-400 mb-2">
          Tap on the map to set the exact location
        </Text>
        <View style={{ height: 250, borderRadius: 8, overflow: "hidden" }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: formData.coordinates.latitude,
              longitude: formData.coordinates.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
            provider="google"
            customMapStyle={colorScheme === "dark" ? mapDarkStyle : []}
          >
            <Marker
              coordinate={formData.coordinates}
              title="Property Location"
              description="Drag to adjust"
              draggable
              onDragEnd={(e) => handleMapPress(e)}
            />
          </MapView>
        </View>
        <View className="mt-2 flex-row">
          <Text className="text-xs text-gray-500 dark:text-slate-400">
            Lat: {formData.coordinates.latitude.toFixed(5)}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-slate-400 ml-4">
            Long: {formData.coordinates.longitude.toFixed(5)}
          </Text>
        </View>
      </View>
      <View className="my-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-lg py-4 px-6 items-center justify-center shadow-sm ${
            loading
              ? "bg-gray-400 dark:bg-slate-500"
              : "bg-emerald-700 dark:bg-dark-tint"
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

const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];