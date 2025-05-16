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
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore"; // Adjust path as needed
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/propertyTypes"; // Adjust path
import { API_BASE_URL } from "@/constants/Config"; // Adjust path

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
}

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]); // Local URIs from picker
  const mapRef = useRef<MapView>(null);

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
  });

  const currentCategoryDetails = PROPERTY_TYPES[formData.category];
  const availableAmenities = currentCategoryDetails?.amenities || [];

  const pickImage = async () => {
    if (images.length >= 5) { Alert.alert("Limit Reached", "Maximum 5 images allowed"); return; }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission Required", "Please grant permission to access your photos"); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 });
      if (!result.canceled && result.assets && result.assets.length > 0) { setImages([...images, result.assets[0].uri]); }
    } catch (error) { console.error("Error picking image:", error); Alert.alert("Image Selection Error", "There was a problem selecting your image. Please try again."); }
  };
  const removeImage = (index: number) => { setImages(images.filter((_, i) => i !== index)); };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setFormData((prev) => ({ ...prev, coordinates: { latitude: coordinate.latitude, longitude: coordinate.longitude } }));
    mapRef.current?.animateToRegion({ ...coordinate, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
  };

  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) { Alert.alert("Authentication Error", "You must be logged in to list a property"); return; }

    const validationErrors = [];
    if (!formData.title) validationErrors.push("Title");
    if (!formData.price) validationErrors.push("Price");
    if (!formData.location) validationErrors.push("Location");
    if (!formData.description) validationErrors.push("Description");
    if (currentCategoryDetails?.hasBedBath) { if (!formData.bedrooms) validationErrors.push("Bedrooms"); if (!formData.bathrooms) validationErrors.push("Bathrooms"); }
    if (currentCategoryDetails?.hasLandDetails) { if (!formData.size_sqm) validationErrors.push("Land Size (sqm)"); if (!formData.legal_status) validationErrors.push("Legal Status"); if (!formData.intended_use) validationErrors.push("Intended Use"); if (!formData.water_supply) validationErrors.push("Water Supply"); }
    if (currentCategoryDetails?.hasSquareMeters && !formData.square_meters) validationErrors.push("Square Meters");
    if (currentCategoryDetails?.hasCommercialDetails && !formData.commercial_property_type) validationErrors.push("Commercial Property Type");
    if (images.length === 0) validationErrors.push("at least one Image");

    if (validationErrors.length > 0) { Alert.alert("Missing Information", `Please fill in: ${validationErrors.join(", ")}`); return; }

    setLoading(true);

    const data = new FormData();

    data.append('title', formData.title);
    data.append('price', formData.price);
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('propertyType', formData.propertyType);
    data.append('category', formData.category);
    data.append('coordinates', JSON.stringify(formData.coordinates));
    data.append('user_id', user.id);

    let detailsPayload: any = {};
    switch (formData.category) {
      case 'house': detailsPayload = { bedrooms: parseInt(formData.bedrooms || "0") || undefined, bathrooms: parseInt(formData.bathrooms || "0") || undefined, garages: parseInt(formData.garages || "0") || undefined, parkings: parseInt(formData.parkings || "0") || undefined, amenities: formData.amenities, security_features: formData.security_features }; break;
      case 'apartment': detailsPayload = { bedrooms: parseInt(formData.bedrooms || "0") || undefined, bathrooms: parseInt(formData.bathrooms || "0") || undefined, square_meters: parseFloat(formData.square_meters || "0") || undefined, amenities: formData.amenities, parking_spaces: parseInt(formData.parking_spaces || "0") || undefined, security_features: formData.security_features }; break;
      case 'land': detailsPayload = { size_sqm: parseFloat(formData.size_sqm || "0") || undefined, legal_status: formData.legal_status, intended_use: formData.intended_use, road_access: formData.road_access, water_supply: formData.water_supply, electricity_available: formData.electricity_available, fenced: formData.fenced }; break;
      case 'commercial': detailsPayload = { property_type: formData.commercial_property_type, square_meters: parseFloat(formData.square_meters || "0") || undefined, parking_spaces: parseInt(formData.parking_spaces || "0") || undefined, amenities: formData.amenities, security_features: formData.security_features }; break;
    }
    Object.keys(detailsPayload).forEach(key => { if (detailsPayload[key] == null || detailsPayload[key] === '' || (Array.isArray(detailsPayload[key]) && detailsPayload[key].length === 0)) { delete detailsPayload[key]; }});
    if (Object.keys(detailsPayload).length > 0) {
        data.append('details', JSON.stringify(detailsPayload));
    }

    images.forEach((uri, index) => {
      const filename = uri.split('/').pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      data.append('images', {
        uri: uri,
        name: filename,
        type: type,
      } as any);
    });

    try {
      const token = useAuthStore.getState().session?.access_token;
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try { const ed = await response.json(); errorMsg = ed.message || JSON.stringify(ed) || errorMsg; } catch(e){}
        throw new Error(`Failed to create property: ${errorMsg}`);
      }
      Alert.alert("Success", "Property listed successfully!", [{ text: "OK", onPress: () => router.replace("/") }]);
    } catch (error: any) {
      console.error("Error submitting property:", error);
      Alert.alert("Error", `Error creating property: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white p-4"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-1">Add New Property</Text>
        <Text className="text-gray-500">
          Fill in the details below to list your property
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">
          Property Images (Max 5) *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {images.map((image, index) => (
            <View key={`img-${index}`} className="relative mr-3">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-lg" />
              <TouchableOpacity onPress={() => removeImage(index)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 && (
            <TouchableOpacity onPress={pickImage} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center bg-gray-50">
              <Ionicons name="add" size={32} color="gray" />
              <Text className="text-xs text-gray-500 mt-1">Add Image</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

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

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Listing Type *</Text>
        <View className="flex-row gap-2 space-x-3">
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

      <Text className="text-lg font-semibold mb-3 mt-2">Property Details</Text>

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Title *</Text>
        <TextInput value={formData.title} onChangeText={(v) => updateFormField('title', v)} placeholder="e.g. Modern 3-Bed House in Roma" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
      </View>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Price (K) *</Text>
        <TextInput value={formData.price} onChangeText={(v) => updateFormField('price', v)} placeholder={formData.propertyType === 'rent' ? "e.g. 15000" : "e.g. 2500000"} keyboardType="numeric" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
      </View>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Location Description *</Text>
        <TextInput value={formData.location} onChangeText={(v) => updateFormField('location', v)} placeholder="e.g. Off Zambezi Rd, Lusaka" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
      </View>

      {currentCategoryDetails?.hasBedBath && (
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bedrooms *</Text>
            <TextInput value={formData.bedrooms} onChangeText={(v) => updateFormField('bedrooms', v)} keyboardType="numeric" placeholder="e.g. 3" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bathrooms *</Text>
            <TextInput value={formData.bathrooms} onChangeText={(v) => updateFormField('bathrooms', v)} keyboardType="numeric" placeholder="e.g. 2" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
        </View>
      )}

      {currentCategoryDetails?.hasGaragesParkings && (
         <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Garages</Text>
            <TextInput value={formData.garages} onChangeText={(v) => updateFormField('garages', v)} keyboardType="numeric" placeholder="e.g. 1" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Parkings (House)</Text>
            <TextInput value={formData.parkings} onChangeText={(v) => updateFormField('parkings', v)} keyboardType="numeric" placeholder="e.g. 2" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
        </View>
      )}

      {currentCategoryDetails?.hasSquareMeters && (
         <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Area (sqm) *</Text>
            <TextInput value={formData.square_meters} onChangeText={(v) => updateFormField('square_meters', v)} keyboardType="numeric" placeholder="e.g. 120" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Parking Spaces</Text>
            <TextInput value={formData.parking_spaces} onChangeText={(v) => updateFormField('parking_spaces', v)} keyboardType="numeric" placeholder="e.g. 1" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
          </View>
        </View>
      )}

      {currentCategoryDetails?.hasLandDetails && (
        <View className="mb-4">
            <Text className="text-base font-medium mb-3">Land Specifics</Text>
            <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Land Size (sqm) *</Text>
                <TextInput value={formData.size_sqm} onChangeText={(v) => updateFormField('size_sqm', v)} keyboardType="numeric" placeholder="e.g. 4000" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
            </View>
             <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Legal Status *</Text>
                <TextInput value={formData.legal_status} onChangeText={(v) => updateFormField('legal_status', v)} placeholder="e.g. Title Deed, Customary" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
            </View>
             <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Intended Use *</Text>
                <TextInput value={formData.intended_use} onChangeText={(v) => updateFormField('intended_use', v)} placeholder="e.g. Residential, Agricultural" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
            </View>
             <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-1">Water Supply *</Text>
                <TextInput value={formData.water_supply} onChangeText={(v) => updateFormField('water_supply', v)} placeholder="e.g. Borehole, Municipal" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
            </View>
             <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-base text-gray-700">Road Access</Text>
                <Switch value={formData.road_access} onValueChange={(v) => updateFormField('road_access', v)} />
            </View>
             <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-base text-gray-700">Electricity Available</Text>
                <Switch value={formData.electricity_available} onValueChange={(v) => updateFormField('electricity_available', v)} />
            </View>
             <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <Text className="text-base text-gray-700">Fenced</Text>
                <Switch value={formData.fenced} onValueChange={(v) => updateFormField('fenced', v)} />
            </View>
        </View>
      )}

       {currentCategoryDetails?.hasCommercialDetails && (
           <View className="mb-4">
                <Text className="text-base font-medium mb-3">Commercial Specifics</Text>
                <Text className="text-sm text-gray-600 mb-1">Commercial Property Type *</Text>
                <TextInput value={formData.commercial_property_type} onChangeText={(v) => updateFormField('commercial_property_type', v)} placeholder="e.g. Office, Retail, Warehouse" className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-base" />
            </View>
       )}

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
                <Text className={`text-sm ${formData.amenities.includes(amenity) ? "text-blue-600" : "text-gray-700"}`}>
                  {amenity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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

      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Location *</Text>
        <Text className="text-sm text-gray-500 mb-2">
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
            <Text className="text-xs text-gray-500">Lat: {formData.coordinates.latitude.toFixed(5)}</Text>
            <Text className="text-xs text-gray-500 ml-4">Long: {formData.coordinates.longitude.toFixed(5)}</Text>
         </View>
      </View>

      <View className="my-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-lg py-4 px-6 items-center justify-center shadow-sm ${loading ? "bg-gray-400" : "bg-emerald-700"}`}
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
