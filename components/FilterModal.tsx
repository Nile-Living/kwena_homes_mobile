import React from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FilterModalProps {
  onApply: () => void;
  onClear: () => void;
}

const propertyTypes = [
  "All properties",
  "House",
  "Townhouse/Cluster",
  "Apartment/Flat",
  "Vacant land/Plot",
  "Farm/Smallholding",
];

const amenitiesList = ["Pets allowed", "Flatlet", "Pool", "Staff quarters", "Garden", "Sea view"];
const securityFeatures = ["Alarm", "Intercom", "Access gate", "Security post", "Electric fencing"];

export default function FilterModal({ onApply, onClear }: FilterModalProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedType, setSelectedType] = useState<string>("All properties");
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("Any");
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>("Any");
  const [selectedGarages, setSelectedGarages] = useState<string>("Any");
  const [selectedParkings, setSelectedParkings] = useState<string>("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedSecurity, setSelectedSecurity] = useState<string[]>([]);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const toggleSecurity = (feature: string) => {
    setSelectedSecurity(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };

  const handleClear = () => {
    setSelectedType("All properties");
    setSelectedBedrooms("Any");
    setSelectedBathrooms("Any");
    setSelectedGarages("Any");
    setSelectedParkings("Any");
    setSelectedAmenities([]);
    setSelectedSecurity([]);
    onClear();
    closeModal();
  };

  const renderOptionGroup = (
    title: string,
    options: string[],
    selected: string,
    setSelected: (value: string) => void
  ) => (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-3">{title}</Text>
      <View className="flex flex-row flex-wrap">
        {options.map(option => (
          <TouchableOpacity
            key={option}
            className={`px-4 py-2 mr-2 mb-2 rounded-full ${
              selected === option ? 'bg-light-tint' : 'bg-gray-200'
            }`}
            onPress={() => setSelected(option)}
          >
            <Text className={selected === option ? 'text-green-900 border rounded-full px-4 py-2' : ''}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCheckboxGroup = (
    title: string,
    items: string[],
    selected: string[],
    toggleFn: (item: string) => void
  ) => (
    <View className="mb-6">
      <Text className="text-base font-semibold mb-3">{title}</Text>
      <View className="flex flex-row flex-wrap">
        {items.map(item => (
          <TouchableOpacity
            key={item}
            className="flex-row items-center mr-4 mb-3"
            onPress={() => toggleFn(item)}
          >
            <Ionicons
              name={selected.includes(item) ? "checkbox" : "square-outline"}
              size={20}
              color={selected.includes(item) ? "#3B82F6" : "#666"}
              className="mr-1"
            />
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        className="bg-light-tint border border-gray-50 p-3 rounded-full ml-2"
        onPress={openModal}
      >
        <Ionicons name="options" size={24} color="white" />
      </TouchableOpacity>
      
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["90%"]}
        backgroundStyle={{ backgroundColor: "#F5F5F5" }}
        containerStyle={{ zIndex: 1000 }}
      >
        <BottomSheetView>
          <ScrollView className="p-4">
            <Text className="text-xl font-bold mb-6">Filter your results</Text>

            {/* Property Type */}
            {renderOptionGroup("Property type", propertyTypes, selectedType, setSelectedType)}

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-3">Min price    Max price</Text>
              <View className="flex flex-row justify-between">
                <View className="bg-gray-200 px-4 py-2 rounded-full w-[48%]">
                  <Text>Any</Text>
                </View>
                <View className="bg-gray-200 px-4 py-2 rounded-full w-[48%]">
                  <Text>Any</Text>
                </View>
              </View>
            </View>

            {/* Bedrooms */}
            {renderOptionGroup("Bedrooms", ["Any", "1 +", "2 +", "3 +", "4 +", "5 +"], selectedBedrooms, setSelectedBedrooms)}

            {/* Bathrooms */}
            {renderOptionGroup("Bathrooms", ["Any", "1 +", "2 +", "3 +", "4 +", "5 +"], selectedBathrooms, setSelectedBathrooms)}

            {/* Garages */}
            {renderOptionGroup("Garages", ["Any", "1 +", "2 +", "3 +", "4 +", "5 +"], selectedGarages, setSelectedGarages)}

            {/* Parkings */}
            {renderOptionGroup("Parkings", ["Any", "1 +", "2 +", "3 +", "4 +", "5 +"], selectedParkings, setSelectedParkings)}

            {/* Amenities */}
            {renderCheckboxGroup("Amenities", amenitiesList, selectedAmenities, toggleAmenity)}

            {/* Security */}
            {renderCheckboxGroup("Security", securityFeatures, selectedSecurity, toggleSecurity)}

            {/* Buttons */}
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="px-6 py-3 bg-gray-200 rounded-full"
                onPress={handleClear}
              >
                <Text>Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-6 py-3 bg-light-tint rounded-full"
                onPress={() => {
                  onApply();
                  closeModal();
                }}
              >
                <Text className="text-white">Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}