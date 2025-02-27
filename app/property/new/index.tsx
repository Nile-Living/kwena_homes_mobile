import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Define type for form data
interface FormData {
  title: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
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
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    coordinates: { latitude: 0, longitude: 0 }
  });

  const pickImage = async () => {
    if (images.length >= 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // Form validation
    if (!formData.title || !formData.price || !formData.location || 
        !formData.bedrooms || !formData.bathrooms || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    if (images.length === 0) {
      Alert.alert('Missing Images', 'Please add at least one image');
      return;
    }
    
    try {
      setLoading(true);
      // Upload images to Supabase Storage
      const imageUrls = await Promise.all(
        images.map(async (uri: string, index: number) => {
          const response = await fetch(uri);
          const blob = await response.blob();
          const fileExt = uri.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${index}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(filePath, blob);
          if (error) throw error;
          return `${process.env.SUPABASE_URL}/storage/v1/object/public/property-images/${filePath}`;
        })
      );
      // Create property in database
      const { data, error } = await supabase
        .from('properties')
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
        })
        .select()
        .single();
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Property listed successfully!',
        [{ text: 'OK', onPress: () => router.push('/') }]
      );
    } catch (error) {
      console.error('Error creating property:', error);
      Alert.alert('Error', 'Error creating property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Add New Property</Text>
        <Text className="text-gray-500">Fill in the details below to list your property</Text>
      </View>

      {/* Property Images */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Images (Max 5)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {images.map((image, index) => (
            <View key={`img-${index}`} className="relative mr-3">
              <Image 
                source={{ uri: image }} 
                className="w-24 h-24 rounded-lg" 
              />
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

      {/* Property Details */}
      <View className="mb-6">
        <Text className="text-base font-medium mb-2">Property Details</Text>
        
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Title *</Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => updateFormField('title', text)}
            placeholder="e.g. Modern 2-Bed Apartment with Ocean View"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Price ($/month) *</Text>
          <TextInput
            value={formData.price}
            onChangeText={(text) => updateFormField('price', text)}
            placeholder="e.g. 1500"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-sm text-gray-600 mb-1">Location *</Text>
          <TextInput
            value={formData.location}
            onChangeText={(text) => updateFormField('location', text)}
            placeholder="e.g. 123 Main St, Anytown"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50"
          />
        </View>
        
        <View className="flex-row mb-4 space-x-3">
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bedrooms *</Text>
            <TextInput
              value={formData.bedrooms}
              onChangeText={(text) => updateFormField('bedrooms', text)}
              placeholder="e.g. 2"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-600 mb-1">Bathrooms *</Text>
            <TextInput
              value={formData.bathrooms}
              onChangeText={(text) => updateFormField('bathrooms', text)}
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
            onChangeText={(text) => updateFormField('description', text)}
            placeholder="Describe your property..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
          />
        </View>
      </View>

      {/* Submit Button */}
      <View className="my-6">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-lg py-4 px-6 items-center justify-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
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