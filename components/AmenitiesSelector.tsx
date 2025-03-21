// components/AmenitiesSelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyType } from '../constants/PropertyTypes';

// Define amenities by property type
const AMENITIES_BY_TYPE: Record<PropertyType, string[]> = {
  house: [
    'Furnished',
    'Unfurnished',
    'Garden',
    'Swimming Pool',
    'Staff Quarters',
    'Borehole',
    'Solar System',
    'Generator',
    'Security System',
    'DSTV Connection',
    'Internet',
    'Water Tank',
    'Garage'
  ],
  apartment: [
    'Furnished',
    'Unfurnished',
    'Balcony',
    'Elevator',
    'Security System',
    'DSTV Connection',
    'Internet',
    'Parking',
    'Water Tank'
  ],
  land: [
    'Fenced',
    'Borehole',
    'Electricity',
    'Road Access',
    'Title Deed',
    'Water Connection'
  ],
  commercial: [
    'Reception Area',
    'Meeting Rooms',
    'Kitchen',
    'Parking',
    'Security System',
    'Internet',
    'Backup Power',
    'Air Conditioning',
    'Loading Bay'
  ],
  industrial: [
    'Loading Bay',
    'Security System',
    'Office Space',
    'Power Supply',
    'Water Supply',
    'Parking',
    'Storage Area'
  ],
  lodge: [
    'Furnished',
    'Swimming Pool',
    'Security System',
    'DSTV Connection',
    'Internet',
    'Parking',
    'Restaurant/Bar',
    'Conference Facilities'
  ],
  gated_estate: [
    'Security',
    'Clubhouse',
    'Swimming Pool',
    'Tennis Court',
    'Gym',
    'Children\'s Play Area',
    'Landscaped Gardens',
    'Street Lights'
  ]
};

interface AmenitiesSelectorProps {
  propertyType: PropertyType;
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

export function AmenitiesSelector({
  propertyType,
  selectedAmenities,
  onChange
}: AmenitiesSelectorProps) {
  const availableAmenities = AMENITIES_BY_TYPE[propertyType];

  const toggleAmenity = (amenity: string) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    onChange(newAmenities);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-2">Amenities</Text>
      <Text className="text-sm text-gray-500 mb-3">
        Select the amenities available for this property
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        <View className="flex-row flex-wrap" style={{ width: '100%' }}>
          {availableAmenities.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              className={`
                mr-2 mb-2 px-4 py-2 rounded-full border
                ${selectedAmenities.includes(amenity) 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-white border-gray-300'}
              `}
              onPress={() => toggleAmenity(amenity)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={selectedAmenities.includes(amenity) ? "checkmark-circle" : "add-circle-outline"}
                  size={18}
                  color={selectedAmenities.includes(amenity) ? "white" : "#666"}
                  className="mr-1"
                />
                <Text 
                  className={`ml-1 ${
                    selectedAmenities.includes(amenity) 
                      ? 'text-white' 
                      : 'text-gray-700'
                  }`}
                >
                  {amenity}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedAmenities.length > 0 && (
        <View className="mt-2">
          <Text className="text-sm text-gray-500 mb-2">
            Selected Amenities ({selectedAmenities.length}):
          </Text>
          <View className="flex-row flex-wrap">
            {selectedAmenities.map((amenity) => (
              <View 
                key={amenity} 
                className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-blue-700">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
